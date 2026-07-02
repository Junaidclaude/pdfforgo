'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

type Mode = 'pixels' | 'percent'
type ResizeUnit = 'px' | 'cm' | 'mm' | 'in'
type OutputFmt = 'original' | 'jpg' | 'png' | 'webp'
type EditTool = 'adjust' | 'filters' | 'crop' | 'transform' | 'blur' | 'removebg'
type CropHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'

interface FileEntry { id: string; file: File; previewUrl: string; origW: number; origH: number }
interface Result    { id: string; url: string; blob: Blob; w: number; h: number; ext: string }
interface Crop      { x: number; y: number; w: number; h: number }
interface CropDrag  { handle: CropHandle; sx: number; sy: number; init: Crop }

const RESIZE_PRESETS = [
  { label: 'HD',              w: 1280, h: 720  },
  { label: 'Full HD',         w: 1920, h: 1080 },
  { label: '4K',              w: 3840, h: 2160 },
  { label: 'Square',          w: 1080, h: 1080 },
  { label: 'Insta Post',      w: 1080, h: 1350 },
  { label: 'Insta Story',     w: 1080, h: 1920 },
  { label: 'Twitter / X',     w: 1600, h: 900  },
  { label: 'Facebook Cover',  w: 1200, h: 630  },
  { label: 'LinkedIn Banner', w: 1584, h: 396  },
  { label: 'Profile Pic',     w: 400,  h: 400  },
  { label: 'Thumbnail',       w: 150,  h: 150  },
]

const FILTER_PRESETS = [
  { name: 'Normal',   f: '' },
  { name: 'Vivid',    f: 'brightness(1.1) contrast(1.2) saturate(1.5)' },
  { name: 'Faded',    f: 'brightness(1.15) contrast(0.85) saturate(0.7)' },
  { name: 'B & W',    f: 'grayscale(1)' },
  { name: 'Sepia',    f: 'sepia(1)' },
  { name: 'Warm',     f: 'sepia(0.25) saturate(1.5) brightness(1.05)' },
  { name: 'Cool',     f: 'hue-rotate(25deg) saturate(0.9) brightness(1.05)' },
  { name: 'Dramatic', f: 'contrast(1.4) brightness(0.9) saturate(1.2)' },
  { name: 'Matte',    f: 'contrast(0.88) brightness(1.08) saturate(0.75)' },
]

const EDIT_TOOLS: { id: EditTool; label: string }[] = [
  { id: 'adjust',    label: 'Adjust'    },
  { id: 'filters',   label: 'Filters'   },
  { id: 'crop',      label: 'Crop'      },
  { id: 'transform', label: 'Transform' },
  { id: 'blur',      label: 'Blur'      },
  { id: 'removebg',  label: 'Remove BG' },
]

const BLUR_PRESETS = [
  { label: 'Slight',  value: 2  },
  { label: 'Medium',  value: 6  },
  { label: 'Heavy',   value: 14 },
  { label: 'Max',     value: 25 },
]

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
function uid() { return Math.random().toString(36).slice(2, 9) }

function Slider({ label, value, min, max, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-semibold text-mute">{label}</span>
        <span className="text-xs font-bold text-violet-600">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-violet-600 h-1" />
    </div>
  )
}

export default function ResizeImageTool() {
  // ── Resize state ───────────────────────────────────────────────────────────
  const [files,      setFiles]      = useState<FileEntry[]>([])
  const [results,    setResults]    = useState<Map<string, Result>>(new Map())
  const [dragging,   setDragging]   = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress,   setProgress]   = useState(0)
  const [error,      setError]      = useState('')
  const [showPresets, setShowPresets] = useState(false)
  const [exportOpen,  setExportOpen]  = useState(true)

  const [mode,       setMode]       = useState<Mode>('pixels')
  const [unit,       setUnit]       = useState<ResizeUnit>('px')
  const [targetW,    setTargetW]    = useState('')
  const [targetH,    setTargetH]    = useState('')
  const [lockAspect, setLockAspect] = useState(true)
  const [percent,    setPercent]    = useState('50')
  const [outputFmt,  setOutputFmt]  = useState<OutputFmt>('original')
  const [quality,    setQuality]    = useState(85)

  // ── Edit state ─────────────────────────────────────────────────────────────
  const [editingEntry, setEditingEntry] = useState<FileEntry | null>(null)
  const [editTool,     setEditTool]     = useState<EditTool>('adjust')

  const [brightness,  setBrightness]  = useState(100)
  const [contrast,    setContrast]    = useState(100)
  const [saturation,  setSaturation]  = useState(100)
  const [blur,        setBlur]        = useState(0)
  const [preset,      setPreset]      = useState('Normal')
  const [rotation,    setRotation]    = useState(0)
  const [flipH,       setFlipH]       = useState(false)
  const [flipV,       setFlipV]       = useState(false)
  const [crop,        setCrop]        = useState<Crop>({ x: 0, y: 0, w: 1, h: 1 })
  const [cropDrag,    setCropDrag]    = useState<CropDrag | null>(null)
  const [removingBg,  setRemovingBg]  = useState(false)
  const [bgDone,      setBgDone]      = useState(false)
  const [bgUrl,       setBgUrl]       = useState<string | null>(null)
  const [bakedUrl,    setBakedUrl]    = useState<string | null>(null)
  const [baking,      setBaking]      = useState(false)
  const [applying,    setApplying]    = useState(false)

  const cropContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef     = useRef<HTMLInputElement>(null)
  const previewUrlsRef   = useRef<string[]>([])
  const blobUrlsRef      = useRef<string[]>([])
  const presetsRef       = useRef<HTMLDivElement>(null)

  useEffect(() => () => {
    previewUrlsRef.current.forEach(URL.revokeObjectURL)
    blobUrlsRef.current.forEach(URL.revokeObjectURL)
  }, [])

  useEffect(() => () => { if (bgUrl) URL.revokeObjectURL(bgUrl) }, [bgUrl])
  useEffect(() => () => { if (bakedUrl) URL.revokeObjectURL(bakedUrl) }, [bakedUrl])

  useEffect(() => {
    if (!showPresets) return
    const h = (e: MouseEvent) => { if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) setShowPresets(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showPresets])

  // ── Edit helpers ───────────────────────────────────────────────────────────
  const presetCSS = FILTER_PRESETS.find(p => p.name === preset)?.f ?? ''
  const adjustCSS = [
    brightness !== 100 ? `brightness(${brightness}%)` : '',
    contrast   !== 100 ? `contrast(${contrast}%)` : '',
    saturation !== 100 ? `saturate(${saturation}%)` : '',
    blur > 0 ? `blur(${blur}px)` : '',
  ].filter(Boolean).join(' ')
  const filterCSS    = [presetCSS, adjustCSS].filter(Boolean).join(' ') || 'none'
  const transformCSS = [
    rotation ? `rotate(${rotation}deg)` : '',
    flipH ? 'scaleX(-1)' : '',
    flipV ? 'scaleY(-1)' : '',
  ].filter(Boolean).join(' ') || undefined

  const startEditing = (entry: FileEntry) => {
    setEditingEntry(entry)
    setEditTool('adjust')
    setBrightness(100); setContrast(100); setSaturation(100); setBlur(0)
    setPreset('Normal')
    setRotation(0); setFlipH(false); setFlipV(false)
    setCrop({ x: 0, y: 0, w: 1, h: 1 })
    setCropDrag(null)
    setRemovingBg(false); setBgDone(false)
    if (bgUrl) { URL.revokeObjectURL(bgUrl); setBgUrl(null) }
    if (bakedUrl) { URL.revokeObjectURL(bakedUrl); setBakedUrl(null) }
  }

  const cancelEditing = () => {
    setEditingEntry(null)
    if (bgUrl) { URL.revokeObjectURL(bgUrl); setBgUrl(null) }
    if (bakedUrl) { URL.revokeObjectURL(bakedUrl); setBakedUrl(null) }
  }

  // Bake current rotation/flip into canvas before entering crop mode so the
  // crop handles align with what the user sees (transformed image).
  const bakeAndEnterCrop = async () => {
    if (rotation === 0 && !flipH && !flipV) { setEditTool('crop'); return }
    setBaking(true)
    try {
      const src = bgUrl || bakedUrl || editingEntry!.previewUrl
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src
      })
      const nw = img.naturalWidth, nh = img.naturalHeight
      const isSwap = rotation === 90 || rotation === 270
      const rw = isSwap ? nh : nw
      const rh = isSwap ? nw : nh
      const rc = document.createElement('canvas')
      rc.width = rw; rc.height = rh
      const rctx = rc.getContext('2d')!
      rctx.translate(rw / 2, rh / 2)
      rctx.rotate((rotation * Math.PI) / 180)
      if (flipH) rctx.scale(-1, 1)
      if (flipV) rctx.scale(1, -1)
      rctx.drawImage(img, -nw / 2, -nh / 2)
      const blob = await new Promise<Blob>((res, rej) => rc.toBlob(b => b ? res(b) : rej(), 'image/png'))
      const url = URL.createObjectURL(blob)
      setBakedUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url })
      setEditingEntry(prev => prev ? { ...prev, origW: rw, origH: rh } : null)
      setRotation(0); setFlipH(false); setFlipV(false)
      setCrop({ x: 0, y: 0, w: 1, h: 1 })
    } catch (err) { console.error('Bake transforms failed:', err) }
    setBaking(false)
    setEditTool('crop')
  }

  // ── Crop handlers ──────────────────────────────────────────────────────────
  const normPos = (e: React.PointerEvent) => {
    const el = cropContainerRef.current
    if (!el) return { x: 0, y: 0 }
    const r = el.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
  }

  const startCropDrag = useCallback((e: React.PointerEvent, handle: CropHandle) => {
    e.preventDefault(); e.stopPropagation()
    const { x, y } = normPos(e)
    setCropDrag({ handle, sx: x, sy: y, init: { ...crop } });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop])

  const onCropMove = useCallback((e: React.PointerEvent) => {
    if (!cropDrag) return
    const { x, y } = normPos(e)
    const dx = x - cropDrag.sx, dy = y - cropDrag.sy
    const ir = cropDrag.init, MIN = 0.04
    let { x: cx, y: cy, w: cw, h: ch } = ir
    switch (cropDrag.handle) {
      case 'move': cx = Math.max(0, Math.min(1 - cw, ir.x + dx)); cy = Math.max(0, Math.min(1 - ch, ir.y + dy)); break
      case 'nw': { const nx = Math.max(0, Math.min(ir.x + ir.w - MIN, ir.x + dx)); const ny = Math.max(0, Math.min(ir.y + ir.h - MIN, ir.y + dy)); cw = ir.x + ir.w - nx; ch = ir.y + ir.h - ny; cx = nx; cy = ny; break }
      case 'ne': { const ny2 = Math.max(0, Math.min(ir.y + ir.h - MIN, ir.y + dy)); ch = ir.y + ir.h - ny2; cy = ny2; cw = Math.max(MIN, Math.min(1 - ir.x, ir.w + dx)); break }
      case 'sw': { const nx2 = Math.max(0, Math.min(ir.x + ir.w - MIN, ir.x + dx)); cw = ir.x + ir.w - nx2; cx = nx2; ch = Math.max(MIN, Math.min(1 - ir.y, ir.h + dy)); break }
      case 'se': cw = Math.max(MIN, Math.min(1 - ir.x, ir.w + dx)); ch = Math.max(MIN, Math.min(1 - ir.y, ir.h + dy)); break
      case 'n': { const ny3 = Math.max(0, Math.min(ir.y + ir.h - MIN, ir.y + dy)); ch = ir.y + ir.h - ny3; cy = ny3; break }
      case 's': ch = Math.max(MIN, Math.min(1 - ir.y, ir.h + dy)); break
      case 'w': { const nx3 = Math.max(0, Math.min(ir.x + ir.w - MIN, ir.x + dx)); cw = ir.x + ir.w - nx3; cx = nx3; break }
      case 'e': cw = Math.max(MIN, Math.min(1 - ir.x, ir.w + dx)); break
    }
    setCrop({ x: Math.max(0, cx), y: Math.max(0, cy), w: Math.max(MIN, cw), h: Math.max(MIN, ch) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropDrag])

  const onCropUp = useCallback(() => setCropDrag(null), [])

  // ── Shared canvas render: applies crop → filters → rotation/flip ──────────
  const renderToBlob = async (): Promise<{ blob: Blob; width: number; height: number }> => {
    if (!editingEntry) throw new Error('No image')
    const src = bgUrl || bakedUrl || editingEntry.previewUrl
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src
    })
    const nw = img.naturalWidth, nh = img.naturalHeight

    // Step 1: Crop
    let step: HTMLCanvasElement = document.createElement('canvas')
    {
      const cx = Math.round(crop.x * nw), cy = Math.round(crop.y * nh)
      const cw = Math.round(crop.w * nw), ch = Math.round(crop.h * nh)
      step.width = cw; step.height = ch
      step.getContext('2d')!.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch)
    }

    // Step 2: Filters (brightness / contrast / blur / preset)
    if (filterCSS !== 'none') {
      const fc = document.createElement('canvas')
      fc.width = step.width; fc.height = step.height
      const fctx = fc.getContext('2d')!
      fctx.filter = filterCSS; fctx.drawImage(step, 0, 0)
      step = fc
    }

    // Step 3: Rotation + flip
    const isSwap = rotation === 90 || rotation === 270
    const rw = isSwap ? step.height : step.width
    const rh = isSwap ? step.width  : step.height
    const rc = document.createElement('canvas')
    rc.width = rw; rc.height = rh
    const rctx = rc.getContext('2d')!
    rctx.translate(rw / 2, rh / 2)
    rctx.rotate((rotation * Math.PI) / 180)
    if (flipH) rctx.scale(-1, 1)
    if (flipV) rctx.scale(1, -1)
    rctx.drawImage(step, -step.width / 2, -step.height / 2)
    step = rc

    const blob = await new Promise<Blob>((res, rej) =>
      step.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png')
    )
    return { blob, width: step.width, height: step.height }
  }

  // ── Apply edits to canvas ─────────────────────────────────────────────────
  const applyEdit = async () => {
    if (!editingEntry) return
    setApplying(true)
    try {
      const { blob, width, height } = await renderToBlob()
      const url = URL.createObjectURL(blob)
      const id  = editingEntry.id

      setFiles(prev => prev.map(e => {
        if (e.id !== id) return e
        URL.revokeObjectURL(e.previewUrl)
        previewUrlsRef.current.push(url)
        return { ...e, previewUrl: url, origW: width, origH: height }
      }))
      setResults(prev => {
        const m = new Map(prev), old = m.get(id)
        if (old) { URL.revokeObjectURL(old.url); m.delete(id) }
        return m
      })
      if (bgUrl) { URL.revokeObjectURL(bgUrl); setBgUrl(null) }
      if (bakedUrl) { URL.revokeObjectURL(bakedUrl); setBakedUrl(null) }
      setEditingEntry(null)
    } catch (err) { console.error('Apply failed:', err) }
    setApplying(false)
  }

  // ── Remove background (server-side API, bakes in current transforms first) ─
  const removeBackground = async () => {
    if (!editingEntry) return
    setRemovingBg(true)
    try {
      // Bake rotation / flip / crop / filters into a PNG before sending to API
      // so the BG-removed result matches what the user sees on screen
      const { blob: imageBlob } = await renderToBlob()
      const file = new File([imageBlob], editingEntry.file.name.replace(/\.[^.]+$/, '.png'), { type: 'image/png' })

      const form = new FormData()
      form.append('image', file)

      const apiRes = await fetch('/api/remove-bg', { method: 'POST', body: form })
      if (!apiRes.ok) {
        const json = await apiRes.json().catch(() => ({ error: apiRes.statusText }))
        throw new Error(json.error ?? `Server error ${apiRes.status}`)
      }

      const resultBlob = await apiRes.blob()
      const url = URL.createObjectURL(resultBlob)
      setBgUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url })
      setBgDone(true)

      // All transforms/filters are baked into bgUrl — reset them so they don't double-apply
      if (bakedUrl) { URL.revokeObjectURL(bakedUrl); setBakedUrl(null) }
      setRotation(0); setFlipH(false); setFlipV(false)
      setCrop({ x: 0, y: 0, w: 1, h: 1 })
      setBrightness(100); setContrast(100); setSaturation(100); setBlur(0)
      setPreset('Normal')
    } catch (err) { console.error('Remove BG failed:', err) }
    setRemovingBg(false)
  }

  // ── Resize helpers ─────────────────────────────────────────────────────────
  const loadImages = useCallback((incoming: File[]) => {
    const valid = incoming.filter(f => f.type.startsWith('image/'))
    if (!valid.length) { setError('Please select image files (JPG, PNG, WebP, etc.)'); return }
    setError('')
    const pending: FileEntry[] = []
    let done = 0
    for (const file of valid) {
      const url = URL.createObjectURL(file)
      previewUrlsRef.current.push(url)
      const img = new Image()
      img.onload = () => {
        pending.push({ id: uid(), file, previewUrl: url, origW: img.naturalWidth, origH: img.naturalHeight })
        if (++done === valid.length) setFiles(prev => [...prev, ...pending])
      }
      img.onerror = () => { URL.revokeObjectURL(url); if (++done === valid.length) setFiles(prev => [...prev, ...pending]) }
      img.src = url
    }
  }, [])

  const removeFile = (id: string) => {
    setFiles(prev => { const e = prev.find(x => x.id === id); if (e) URL.revokeObjectURL(e.previewUrl); return prev.filter(x => x.id !== id) })
    setResults(prev => { const m = new Map(prev); const r = m.get(id); if (r) URL.revokeObjectURL(r.url); m.delete(id); return m })
    if (editingEntry?.id === id) cancelEditing()
  }

  const reset = () => {
    setFiles(prev => { prev.forEach(e => URL.revokeObjectURL(e.previewUrl)); return [] })
    setResults(prev => { prev.forEach(r => URL.revokeObjectURL(r.url)); return new Map() })
    blobUrlsRef.current = []; previewUrlsRef.current = []
    setError(''); setProgress(0); cancelEditing()
  }

  // px per unit at 96 DPI (screen standard)
  const UNIT_TO_PX: Record<ResizeUnit, number> = { px: 1, cm: 96 / 2.54, mm: 96 / 25.4, in: 96 }
  const toPx   = (v: number) => Math.round(v * UNIT_TO_PX[unit])
  const fromPx = (px: number) => unit === 'px' ? px : +(px / UNIT_TO_PX[unit]).toFixed(2)

  const getMime = (fileType: string): string => {
    if (outputFmt === 'jpg')  return 'image/jpeg'
    if (outputFmt === 'png')  return 'image/png'
    if (outputFmt === 'webp') return 'image/webp'
    return fileType === 'image/png' ? 'image/png' : fileType === 'image/webp' ? 'image/webp' : 'image/jpeg'
  }
  const getExt = (mime: string) => mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'

  const resizeOne = (entry: FileEntry): Promise<Result> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const nw = entry.origW, nh = entry.origH
        let dw: number, dh: number
        if (mode === 'percent') {
          const p = Math.max(1, Math.min(2000, Number(percent) || 50)) / 100
          dw = Math.round(nw * p); dh = Math.round(nh * p)
        } else if (lockAspect) {
          const w = toPx(Number(targetW)), h = toPx(Number(targetH))
          if (w) { dw = w; dh = Math.round(dw * nh / nw) }
          else if (h) { dh = h; dw = Math.round(dh * nw / nh) }
          else { dw = nw; dh = nh }
        } else {
          dw = Math.max(1, toPx(Number(targetW)) || nw); dh = Math.max(1, toPx(Number(targetH)) || nh)
        }
        const canvas = document.createElement('canvas')
        canvas.width = dw; canvas.height = dh
        const ctx = canvas.getContext('2d')!
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, dw, dh)
        const mime = getMime(entry.file.type), ext = getExt(mime)
        canvas.toBlob(blob => {
          canvas.width = 0; canvas.height = 0
          if (!blob) { reject(new Error(entry.file.name)); return }
          const url = URL.createObjectURL(blob)
          blobUrlsRef.current.push(url)
          resolve({ id: entry.id, url, blob, w: dw, h: dh, ext })
        }, mime, mime === 'image/png' ? undefined : quality / 100)
      }
      img.onerror = () => reject(new Error(entry.file.name))
      img.src = entry.previewUrl
    })

  const runResize = async () => {
    if (!files.length || processing) return
    blobUrlsRef.current.forEach(URL.revokeObjectURL); blobUrlsRef.current = []
    setResults(new Map()); setProcessing(true); setProgress(0); setError('')
    const map = new Map<string, Result>()
    for (let i = 0; i < files.length; i++) {
      try { const r = await resizeOne(files[i]); map.set(r.id, r); setResults(new Map(map)) } catch (e) { console.error(e) }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }
    setProcessing(false)
    if (!map.size) setError('Could not resize any images.')
  }

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    for (const entry of files) {
      const r = results.get(entry.id)
      if (r) zip.file(`${entry.file.name.replace(/\.[^.]+$/, '')}_resized.${r.ext}`, r.blob)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'resized_images.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    loadImages(Array.from(e.dataTransfer.files))
  }, [loadImages])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) loadImages(Array.from(e.target.files))
    e.target.value = ''
  }

  const doneCount = results.size
  const liveOut = (() => {
    if (!files.length || mode === 'percent') return null
    if (lockAspect) {
      const w = toPx(Number(targetW)), h = toPx(Number(targetH))
      if (files.length === 1) {
        const { origW: nw, origH: nh } = files[0]
        if (w) return `${w} × ${Math.round(w * nh / nw)} px`
        if (h) return `${Math.round(h * nw / nh)} × ${h} px`
      }
    } else {
      const w = toPx(Number(targetW)), h = toPx(Number(targetH))
      if (w && h) return `${w} × ${h} px`
    }
    return null
  })()

  const imgSrc = bgUrl || bakedUrl || editingEntry?.previewUrl || ''
  const cropW  = editingEntry ? Math.round(crop.w * editingEntry.origW) : 0
  const cropH  = editingEntry ? Math.round(crop.h * editingEntry.origH) : 0

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: 'calc(100vh - 57px)' }}
      onDrop={editingEntry ? undefined : onDrop}
      onDragOver={editingEntry ? undefined : (e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={editingEntry ? undefined : (e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />

      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR — switches between Resize mode and Edit mode
      ════════════════════════════════════════════════════════════════════════ */}
      <aside className="w-80 shrink-0 border-r border-line bg-white flex flex-col overflow-hidden">

        {editingEntry ? (
          /* ── EDIT SIDEBAR ─────────────────────────────────────────────── */
          <>
            {/* Edit header */}
            <div className="px-4 pt-3 pb-3 border-b border-line bg-gradient-to-b from-violet-50/60 to-white shrink-0">
              <button
                onClick={cancelEditing}
                className="flex items-center gap-1 text-[11px] font-semibold text-violet-500 hover:text-violet-700 transition-colors mb-3"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to resize
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-line bg-gray-50 shrink-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editingEntry.previewUrl} alt="" className="w-full h-full object-cover" draggable={false} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink text-sm truncate leading-tight" title={editingEntry.file.name}>
                    {editingEntry.file.name}
                  </p>
                  <p className="text-[11px] text-mute mt-0.5">{editingEntry.origW} × {editingEntry.origH} px</p>
                </div>
              </div>
            </div>

            {/* Tool tabs — segmented icon+label grid */}
            <div className="px-3 py-2.5 border-b border-line bg-gray-50/50 shrink-0">
              <div className="grid grid-cols-6 gap-0.5 bg-gray-200/60 rounded-xl p-1">
                {([
                  { id: 'adjust',    label: 'Adjust',  icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg> },
                  { id: 'filters',   label: 'Filter',  icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" /></svg> },
                  { id: 'crop',      label: 'Crop',    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> },
                  { id: 'transform', label: 'Rotate',  icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg> },
                  { id: 'blur',      label: 'Blur',    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2M3 12h2m14 0h2m-3.22-5.78-1.42 1.42M7.64 16.36l-1.42 1.42m0-11.56 1.42 1.42m9.54 9.54 1.42 1.42" /></svg> },
                  { id: 'removebg',  label: 'BG',      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg> },
                ] as { id: EditTool; label: string; icon: React.ReactNode }[]).map(t => (
                  <button
                    key={t.id}
                    onClick={() => t.id === 'crop' ? bakeAndEnterCrop() : setEditTool(t.id)}
                    disabled={baking && t.id === 'crop'}
                    className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[9px] font-bold transition-all leading-none ${
                      editTool === t.id
                        ? 'bg-white text-violet-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    {baking && t.id === 'crop'
                      ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                      : t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tool controls */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* ADJUST */}
              {editTool === 'adjust' && (
                <>
                  <p className="text-[11px] font-bold text-mute uppercase tracking-wider">Adjustments</p>
                  <Slider label="Brightness" value={brightness} min={0} max={200} unit="%" onChange={setBrightness} />
                  <Slider label="Contrast"   value={contrast}   min={0} max={200} unit="%" onChange={setContrast}   />
                  <Slider label="Saturation" value={saturation} min={0} max={200} unit="%" onChange={setSaturation} />
                  <Slider label="Blur"       value={blur}       min={0} max={20}  unit="px" onChange={setBlur}      />
                  <button
                    onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); setBlur(0) }}
                    className="w-full text-xs font-semibold text-mute hover:text-ink border border-line rounded-lg py-2 transition-colors"
                  >
                    Reset All
                  </button>
                </>
              )}

              {/* FILTERS */}
              {editTool === 'filters' && (
                <>
                  <p className="text-[11px] font-bold text-mute uppercase tracking-wider">Filter Presets</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FILTER_PRESETS.map(fp => (
                      <button
                        key={fp.name}
                        onClick={() => setPreset(fp.name)}
                        className={`flex flex-col gap-1.5 rounded-xl p-1.5 border-2 transition-all ${preset === fp.name ? 'border-violet-500' : 'border-transparent hover:border-gray-200'}`}
                      >
                        <div className="rounded-lg overflow-hidden aspect-square bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editingEntry.previewUrl}
                            alt={fp.name}
                            className="w-full h-full object-cover"
                            style={{ filter: [fp.f, adjustCSS].filter(Boolean).join(' ') || 'none' }}
                            draggable={false}
                          />
                        </div>
                        <span className={`text-[10px] font-semibold text-center leading-none ${preset === fp.name ? 'text-violet-600' : 'text-mute'}`}>
                          {fp.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* CROP */}
              {editTool === 'crop' && (
                <>
                  <p className="text-[11px] font-bold text-mute uppercase tracking-wider">Crop</p>
                  <p className="text-xs text-mute">Drag the handles on the image to set your crop area.</p>

                  <div>
                    <p className="text-[11px] font-semibold text-mute mb-2">Aspect Ratio</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([['Free', 0, 0], ['1:1', 1, 1], ['4:3', 4, 3], ['16:9', 16, 9], ['3:2', 3, 2], ['2:3', 2, 3]] as [string, number, number][]).map(([label, rw, rh]) => (
                        <button
                          key={label}
                          onClick={() => {
                            if (!rw || !rh || !editingEntry) return
                            const ratio = rw / rh
                            const iRatio = editingEntry.origW / editingEntry.origH
                            let nw = crop.w, nh = crop.h
                            if (ratio > iRatio) { nw = Math.min(1, crop.h * ratio * editingEntry.origH / editingEntry.origW); nh = nw / ratio * editingEntry.origW / editingEntry.origH }
                            else { nh = Math.min(1, crop.w / ratio * editingEntry.origW / editingEntry.origH); nw = nh * ratio * editingEntry.origH / editingEntry.origW }
                            setCrop({ x: Math.max(0, 0.5 - nw / 2), y: Math.max(0, 0.5 - nh / 2), w: nw, h: nh })
                          }}
                          className="text-xs font-semibold border border-line rounded-lg py-1.5 text-mute hover:text-ink hover:border-violet-300 transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <p className="text-[11px] font-bold text-mute uppercase tracking-wider">Output Size</p>
                    <p className="text-sm font-bold text-ink">{cropW} × {cropH} px</p>
                  </div>

                  <button
                    onClick={() => setCrop({ x: 0, y: 0, w: 1, h: 1 })}
                    className="w-full text-xs font-semibold text-mute hover:text-ink border border-line rounded-lg py-2 transition-colors"
                  >
                    Reset Crop
                  </button>
                </>
              )}

              {/* TRANSFORM */}
              {editTool === 'transform' && (
                <>
                  {/* Rotation */}
                  <div className="bg-gray-50 rounded-2xl p-3 space-y-3">
                    <p className="text-[10px] font-bold text-mute uppercase tracking-widest">Rotate</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                        className="flex flex-col items-center gap-2 border border-line rounded-2xl py-4 text-xs font-semibold text-gray-600 bg-white hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/40 transition-all shadow-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                        Left 90°
                      </button>
                      <button onClick={() => setRotation(r => (r + 90) % 360)}
                        className="flex flex-col items-center gap-2 border border-line rounded-2xl py-4 text-xs font-semibold text-gray-600 bg-white hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/40 transition-all shadow-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" /></svg>
                        Right 90°
                      </button>
                    </div>
                    {rotation !== 0 && (
                      <div className="flex items-center justify-center gap-2 bg-violet-100 rounded-xl py-2">
                        <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                        <span className="text-xs font-bold text-violet-700">Rotated {rotation}°</span>
                      </div>
                    )}
                  </div>

                  {/* Flip */}
                  <div className="bg-gray-50 rounded-2xl p-3 space-y-3">
                    <p className="text-[10px] font-bold text-mute uppercase tracking-widest">Flip</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setFlipH(v => !v)}
                        className={`flex flex-col items-center gap-2 rounded-2xl py-4 text-xs font-semibold transition-all shadow-sm border ${flipH ? 'border-violet-400 bg-violet-600 text-white' : 'border-line bg-white text-gray-600 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/40'}`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 12m0 0 4.5-9M3 12h18m-4.5 9L21 12m0 0-4.5-9" /></svg>
                        Flip H
                      </button>
                      <button onClick={() => setFlipV(v => !v)}
                        className={`flex flex-col items-center gap-2 rounded-2xl py-4 text-xs font-semibold transition-all shadow-sm border ${flipV ? 'border-violet-400 bg-violet-600 text-white' : 'border-line bg-white text-gray-600 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/40'}`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 12 3m0 0 9 4.5M12 3v18m9-13.5L12 21M3 16.5l9 4.5" /></svg>
                        Flip V
                      </button>
                    </div>
                  </div>

                  {(rotation !== 0 || flipH || flipV) && (
                    <button
                      onClick={() => { setRotation(0); setFlipH(false); setFlipV(false) }}
                      className="w-full text-xs font-semibold text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 rounded-xl py-2.5 transition-colors bg-red-50 hover:bg-red-100"
                    >
                      Reset Transform
                    </button>
                  )}
                </>
              )}

              {/* BLUR */}
              {editTool === 'blur' && (
                <>
                  <p className="text-[11px] font-bold text-mute uppercase tracking-wider">Blur Intensity</p>

                  {/* Quick presets */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {BLUR_PRESETS.map(p => (
                      <button key={p.label} onClick={() => setBlur(p.value)}
                        className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${blur === p.value ? 'bg-violet-600 text-white border-violet-600' : 'text-mute border-line hover:border-violet-300'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Fine slider */}
                  <Slider label="Blur radius" value={blur} min={0} max={40} unit="px" onChange={setBlur} />

                  {/* Live thumbnail preview */}
                  <div className="rounded-xl overflow-hidden border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bgUrl || editingEntry?.previewUrl}
                      alt="blur preview"
                      className="w-full object-cover max-h-40"
                      style={{ filter: blur > 0 ? `blur(${blur}px)` : 'none', transition: 'filter 0.2s' }}
                      draggable={false}
                    />
                  </div>

                  <button
                    onClick={() => setBlur(0)}
                    className="w-full text-xs font-semibold text-mute hover:text-ink border border-line rounded-lg py-2 transition-colors"
                  >
                    Reset Blur
                  </button>
                </>
              )}

              {/* REMOVE BG */}
              {editTool === 'removebg' && (
                <>
                  <p className="text-[11px] font-bold text-mute uppercase tracking-wider">Remove Background</p>
                  <p className="text-xs text-mute leading-relaxed">AI-powered. This step processes your image on our server and discards it immediately — every other tool on this page stays in your browser.</p>
                  {!bgDone ? (
                    <button
                      onClick={removeBackground}
                      disabled={removingBg}
                      className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {removingBg ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                          </svg>
                          Processing (~10s)…
                        </>
                      ) : 'Remove Background'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                        <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        <span className="text-sm font-semibold text-green-700">Background removed!</span>
                      </div>
                      <button
                        onClick={() => { setBgDone(false); if (bgUrl) { URL.revokeObjectURL(bgUrl); setBgUrl(null) } }}
                        className="w-full text-xs font-semibold text-mute hover:text-ink border border-line rounded-lg py-2 transition-colors"
                      >
                        Revert to Original
                      </button>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 leading-relaxed">
                    <strong>Tip:</strong> Output is PNG with transparent background. You can combine with crop or filters.
                  </div>
                </>
              )}
            </div>

            {/* Apply / Cancel */}
            <div className="p-4 border-t border-line space-y-2 bg-gray-50/40">
              <button
                onClick={applyEdit}
                disabled={applying || baking}
                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 disabled:from-violet-300 disabled:to-violet-300 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {applying ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    Applying…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Apply Changes
                  </>
                )}
              </button>
              <button
                onClick={cancelEditing}
                className="w-full text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-xl py-2.5 transition-colors bg-white"
              >
                Discard &amp; Close
              </button>
            </div>
          </>
        ) : (
          /* ── RESIZE SIDEBAR ───────────────────────────────────────────── */
          <>
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-line flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()} title="Add images"
                className="w-9 h-9 rounded-lg border border-line flex items-center justify-center text-mute hover:text-ink hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </button>
              <button onClick={reset} title="Remove all"
                className="w-9 h-9 rounded-lg border border-line flex items-center justify-center text-mute hover:text-red-500 hover:border-red-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m19 7-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" /></svg>
              </button>
              <span className="text-xs text-mute ml-auto">Max file size: 10 MB</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-5">

                <div>
                  <p className="font-display font-bold text-ink text-sm mb-3">Resize Settings</p>

                  {/* Mode toggle + unit selector */}
                  <div className="flex gap-2 mb-3 items-stretch">
                    <div className="flex flex-1 rounded-lg border border-line overflow-hidden">
                      <button onClick={() => setMode('pixels')}
                        className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${mode === 'pixels' ? 'bg-violet-600 text-white' : 'text-mute hover:bg-gray-50'}`}>
                        Dimensions
                      </button>
                      <button onClick={() => setMode('percent')}
                        className={`flex-1 py-1.5 text-xs font-semibold transition-colors border-l border-line ${mode === 'percent' ? 'bg-violet-600 text-white' : 'text-mute hover:bg-gray-50'}`}>
                        Percent
                      </button>
                    </div>
                    {mode === 'pixels' && (
                      <select
                        value={unit}
                        onChange={e => { setUnit(e.target.value as ResizeUnit); setTargetW(''); setTargetH('') }}
                        className="border border-line rounded-lg px-2.5 text-xs font-bold text-ink bg-white focus:outline-none focus:border-violet-400 cursor-pointer min-w-[52px]"
                      >
                        <option value="px">px</option>
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                        <option value="in">in</option>
                      </select>
                    )}
                  </div>

                  {mode === 'pixels' && (
                    <>
                      <div className="flex gap-2 items-end">
                        {/* Width */}
                        <div className="flex-1">
                          <label className="text-[11px] font-semibold text-mute block mb-1">Width</label>
                          <div className="relative">
                            <input type="number" min={0.01} step={unit === 'px' ? 1 : 0.01} value={targetW} placeholder="Auto"
                              onChange={e => setTargetW(e.target.value)}
                              className="w-full border border-line rounded-lg pl-2.5 pr-8 py-2 text-sm text-ink placeholder:text-gray-300 focus:outline-none focus:border-violet-400" />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none select-none">{unit}</span>
                          </div>
                        </div>
                        {/* Lock aspect ratio */}
                        <button onClick={() => setLockAspect(v => !v)} title={lockAspect ? 'Unlock' : 'Lock'}
                          className={`w-8 h-8 mb-0.5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${lockAspect ? 'border-violet-300 bg-violet-50 text-violet-600' : 'border-line text-gray-300 hover:text-gray-500'}`}>
                          {lockAspect
                            ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                            : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 0 1 4.5-4.5 4.5 4.5 0 0 1 4.5 4.5v3.75M3.75 10.5H20.25a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H3.75a2.25 2.25 0 0 1-2.25-2.25v-6.75a2.25 2.25 0 0 1 2.25-2.25Z" /></svg>
                          }
                        </button>
                        {/* Height */}
                        <div className="flex-1">
                          <label className="text-[11px] font-semibold text-mute block mb-1">Height</label>
                          <div className="relative">
                            <input type="number" min={0.01} step={unit === 'px' ? 1 : 0.01} value={targetH}
                              placeholder="Auto"
                              disabled={lockAspect && !!targetW && !targetH}
                              onChange={e => setTargetH(e.target.value)}
                              className="w-full border border-line rounded-lg pl-2.5 pr-8 py-2 text-sm text-ink placeholder:text-gray-300 focus:outline-none focus:border-violet-400 disabled:bg-gray-50 disabled:text-gray-300" />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none select-none">{unit}</span>
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
                        <input type="checkbox" checked={lockAspect} onChange={e => setLockAspect(e.target.checked)} className="w-4 h-4 accent-violet-600 rounded" />
                        <span className="text-sm text-ink">Lock Aspect Ratio</span>
                      </label>
                      {liveOut && (
                        <p className="mt-2 text-xs text-mute bg-violet-50 border border-violet-100 rounded-lg px-2.5 py-1.5">
                          Output: <span className="font-bold text-violet-600">{liveOut}</span>
                        </p>
                      )}
                      <div className="relative mt-3" ref={presetsRef}>
                        <button onClick={() => setShowPresets(v => !v)}
                          className="w-full flex items-center justify-between border border-line rounded-lg px-3 py-2 text-sm text-mute hover:text-ink hover:border-gray-300 transition-colors">
                          <span>Social Media Presets</span>
                          <svg className={`w-3.5 h-3.5 transition-transform ${showPresets ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                        </button>
                        {showPresets && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-lg py-1 z-20 max-h-56 overflow-y-auto">
                            {RESIZE_PRESETS.map(p => (
                              <button key={p.label}
                                onClick={() => { setTargetW(String(fromPx(p.w))); setTargetH(String(fromPx(p.h))); setLockAspect(false); setShowPresets(false) }}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                                <span className="text-ink font-medium">{p.label}</span>
                                <span className="text-mute text-xs">{fromPx(p.w)}×{fromPx(p.h)} {unit}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {mode === 'percent' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-mute">Scale</label>
                        <span className="text-violet-600 font-bold text-sm">{percent}%</span>
                      </div>
                      <input type="range" min={1} max={200} step={1} value={percent}
                        onChange={e => setPercent(e.target.value)}
                        className="w-full accent-violet-600" />
                      <div className="flex justify-between text-xs text-mute mt-0.5">
                        <span>1%</span><span>100%</span><span>200%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-line" />

                <div>
                  <button onClick={() => setExportOpen(v => !v)} className="w-full flex items-center justify-between mb-3">
                    <p className="font-display font-bold text-ink text-sm">Export Settings</p>
                    <svg className={`w-4 h-4 text-mute transition-transform ${exportOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {exportOpen && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-semibold text-mute block mb-1.5">Output Format</label>
                        <div className="grid grid-cols-4 gap-1">
                          {(['original', 'jpg', 'png', 'webp'] as OutputFmt[]).map(f => (
                            <button key={f} onClick={() => setOutputFmt(f)}
                              className={`py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${outputFmt === f ? 'bg-ink text-white border-ink' : 'border-line text-mute hover:border-gray-400 hover:text-ink'}`}>
                              {f === 'original' ? 'Auto' : f}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className={outputFmt === 'png' ? 'opacity-40 pointer-events-none' : ''}>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-mute">Quality</label>
                          <span className="text-violet-600 font-bold text-xs">{quality}%</span>
                        </div>
                        <input type="range" min={1} max={100} value={quality}
                          onChange={e => setQuality(Number(e.target.value))}
                          className="w-full accent-violet-600" />
                        <div className="flex justify-between text-xs text-mute mt-0.5">
                          <span>Smaller</span><span>Best</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-700 text-xs">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom actions */}
            <div className="p-4 border-t border-line space-y-2">
              {processing && (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              )}
              <button onClick={runResize} disabled={processing || !files.length}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {processing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                    Resizing… {progress}%
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                    {files.length ? `Resize ${files.length} Image${files.length > 1 ? 's' : ''}` : 'Resize Images'}
                  </>
                )}
              </button>
              {doneCount > 1 && !processing && (
                <button onClick={downloadAll}
                  className="w-full border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download All (ZIP)
                </button>
              )}
              <AdSlot position="footer" />
            </div>
          </>
        )}
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          RIGHT PANEL — switches between Image Grid and Edit Preview
      ════════════════════════════════════════════════════════════════════════ */}
      {editingEntry ? (
        /* ── EDIT PREVIEW ─────────────────────────────────────────────────── */
        <div
          className="flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden p-6 relative"
          onPointerMove={cropDrag ? onCropMove : undefined}
          onPointerUp={cropDrag ? onCropUp : undefined}
          onPointerLeave={cropDrag ? onCropUp : undefined}
        >
          {/* Floating download button — downloads the current state with edits applied */}
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <a
              href={bgUrl || editingEntry.previewUrl}
              download={editingEntry.file.name.replace(/\.[^.]+$/, '') + '-edited.png'}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl backdrop-blur-sm border border-white/10 transition-all"
              title="Download current image"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
          <div ref={cropContainerRef} className="relative select-none" style={{ display: 'inline-block' }}>
            {/* Checkerboard for bg-removed images */}
            {bgDone && (
              <div className="absolute inset-0 rounded" style={{
                backgroundImage: 'linear-gradient(45deg,#888 25%,transparent 25%),linear-gradient(-45deg,#888 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#888 75%),linear-gradient(-45deg,transparent 75%,#888 75%)',
                backgroundSize: '16px 16px', backgroundPosition: '0 0,0 8px,8px -8px,-8px 0px', zIndex: 0,
              }} />
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt=""
              className="relative z-10 block"
              style={{
                maxWidth: 'min(calc(100vw - 420px), 1000px)',
                maxHeight: 'calc(100vh - 120px)',
                filter: filterCSS !== 'none' ? filterCSS : undefined,
                transform: editTool === 'crop' ? undefined : transformCSS,
              }}
              draggable={false}
            />

            {/* Crop overlay */}
            {editTool === 'crop' && (
              <div className="absolute inset-0 z-20" style={{ userSelect: 'none' }}>
                {/* Dark masks outside crop */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${crop.y * 100}%`, background: 'rgba(0,0,0,0.55)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(1 - crop.y - crop.h) * 100}%`, background: 'rgba(0,0,0,0.55)' }} />
                <div style={{ position: 'absolute', top: `${crop.y * 100}%`, left: 0, width: `${crop.x * 100}%`, height: `${crop.h * 100}%`, background: 'rgba(0,0,0,0.55)' }} />
                <div style={{ position: 'absolute', top: `${crop.y * 100}%`, right: 0, width: `${(1 - crop.x - crop.w) * 100}%`, height: `${crop.h * 100}%`, background: 'rgba(0,0,0,0.55)' }} />
                {/* Border + rule-of-thirds */}
                <div style={{
                  position: 'absolute', left: `${crop.x * 100}%`, top: `${crop.y * 100}%`,
                  width: `${crop.w * 100}%`, height: `${crop.h * 100}%`,
                  border: '2px solid white', boxSizing: 'border-box',
                  backgroundImage: 'linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)',
                  backgroundSize: `${crop.w * 100 / 3}% ${crop.h * 100 / 3}%`,
                }} />
                {/* Move target */}
                <div style={{ position: 'absolute', left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%`, cursor: 'move' }}
                  onPointerDown={e => startCropDrag(e, 'move')} />
                {/* Corner handles */}
                {([['nw',0,0],['ne',0,1],['sw',1,0],['se',1,1]] as [CropHandle,number,number][]).map(([h,r,c]) => (
                  <div key={h} style={{
                    position: 'absolute', zIndex: 30,
                    top: `${(crop.y + r * crop.h) * 100}%`, left: `${(crop.x + c * crop.w) * 100}%`,
                    transform: 'translate(-50%,-50%)', width: 14, height: 14,
                    background: 'white', border: '2.5px solid #7c3aed', borderRadius: 3, cursor: `${h}-resize`,
                  }} onPointerDown={e => startCropDrag(e, h)} />
                ))}
                {/* Edge handles */}
                {([['n',0,0.5],['s',1,0.5],['w',0.5,0],['e',0.5,1]] as [CropHandle,number,number][]).map(([h,r,c]) => (
                  <div key={h} style={{
                    position: 'absolute', zIndex: 30,
                    top: `${(crop.y + r * crop.h) * 100}%`, left: `${(crop.x + c * crop.w) * 100}%`,
                    transform: 'translate(-50%,-50%)', width: 10, height: 10,
                    background: 'white', border: '2px solid #7c3aed', borderRadius: 2, cursor: `${h}-resize`,
                  }} onPointerDown={e => startCropDrag(e, h)} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── IMAGE GRID / DROP ZONE ───────────────────────────────────────── */
        <div className={`flex-1 min-w-0 overflow-y-auto transition-colors ${dragging ? 'bg-violet-50' : 'bg-gray-50'}`}>
          {files.length === 0 ? (
            <div onClick={() => fileInputRef.current?.click()} className="h-full flex flex-col items-center justify-center cursor-pointer p-8">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-5 transition-colors ${dragging ? 'bg-violet-100' : 'bg-white border-2 border-dashed border-line'}`}>
                <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="font-display font-bold text-ink text-xl mb-1">{dragging ? 'Drop to add images' : 'Drop images here'}</p>
              <p className="text-mute text-sm mb-5">JPG, PNG, WebP, GIF — multiple files supported</p>
              <button onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                Choose Images
              </button>
              <p className="mt-4 text-xs text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1 inline-flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                Private by default — only Remove Background uploads to our server
              </p>
              <div className="mt-6 w-full max-w-lg"><AdSlot position="header" /></div>
            </div>
          ) : (
            <div className="p-5">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {files.map(entry => {
                  const result = results.get(entry.id)
                  const saved = result ? Math.round((1 - result.blob.size / entry.file.size) * 100) : 0
                  return (
                    <div key={entry.id} className="group bg-white rounded-2xl overflow-hidden border border-line shadow-sm hover:shadow-lg transition-all">
                      {/* Big image preview */}
                      <div className="relative bg-gray-50 overflow-hidden" style={{ height: 220 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={result ? result.url : entry.previewUrl} alt=""
                          className="w-full h-full object-contain p-2" />

                        {/* Done badge */}
                        {result && (
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            Done
                          </div>
                        )}

                        {/* Hover overlay: remove button */}
                        <button onClick={() => removeFile(entry.id)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                          title="Remove">
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>

                        {/* Size badge */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <span className="text-[10px] font-medium bg-black/40 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">{entry.origW}×{entry.origH}</span>
                          {result && saved > 0 && (
                            <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">-{saved}%</span>
                          )}
                        </div>
                      </div>

                      {/* Info + actions */}
                      <div className="p-3">
                        <p className="text-xs font-semibold text-ink truncate mb-0.5" title={entry.file.name}>{entry.file.name}</p>
                        <p className="text-[10px] text-mute mb-2.5">
                          {result
                            ? <><span className="font-semibold text-violet-600">{result.w}×{result.h}</span> · {fmtSize(result.blob.size)}</>
                            : fmtSize(entry.file.size)
                          }
                        </p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => startEditing(entry)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-colors border border-violet-100"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                            </svg>
                            Edit
                          </button>
                          <a
                            href={result ? result.url : entry.previewUrl}
                            download={result
                              ? `${entry.file.name.replace(/\.[^.]+$/, '')}_resized.${result.ext}`
                              : entry.file.name}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold transition-colors border border-line"
                            title="Download"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            DL
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Add more card */}
                <div onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-line flex flex-col items-center justify-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/40 transition-colors gap-3 p-8"
                  style={{ minHeight: 220 }}>
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </div>
                  <span className="text-sm text-mute font-semibold">Add More</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
