'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import AdSlot from '@/components/AdSlot'

type DragMode = 'none' | 'new' | 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
interface Crop { x: number; y: number; w: number; h: number }

const HANDLES: { pos: DragMode; cursor: string; style: React.CSSProperties }[] = [
  { pos: 'nw', cursor: 'nw-resize', style: { top: 0, left: 0, transform: 'translate(-50%,-50%)' } },
  { pos: 'n',  cursor: 'n-resize',  style: { top: 0, left: '50%', transform: 'translate(-50%,-50%)' } },
  { pos: 'ne', cursor: 'ne-resize', style: { top: 0, right: 0, transform: 'translate(50%,-50%)' } },
  { pos: 'e',  cursor: 'e-resize',  style: { top: '50%', right: 0, transform: 'translate(50%,-50%)' } },
  { pos: 'se', cursor: 'se-resize', style: { bottom: 0, right: 0, transform: 'translate(50%,50%)' } },
  { pos: 's',  cursor: 's-resize',  style: { bottom: 0, left: '50%', transform: 'translate(-50%,50%)' } },
  { pos: 'sw', cursor: 'sw-resize', style: { bottom: 0, left: 0, transform: 'translate(-50%,50%)' } },
  { pos: 'w',  cursor: 'w-resize',  style: { top: '50%', left: 0, transform: 'translate(-50%,-50%)' } },
]

const ASPECT_PRESETS = [
  { label: 'Free', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
  { label: '3:2', value: '3:2' },
  { label: '9:16', value: '9:16' },
]

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

export default function CropImageTool() {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [naturalW, setNaturalW] = useState(0)
  const [naturalH, setNaturalH] = useState(0)
  const [displayScale, setDisplayScale] = useState(1)
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, w: 0, h: 0 })
  const [aspectPreset, setAspectPreset] = useState('free')
  const [dragging, setDragging] = useState(false)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [outputExt, setOutputExt] = useState('jpg')

  // Refs for event handlers (avoid stale closures)
  const cropRef = useRef<Crop>({ x: 0, y: 0, w: 0, h: 0 })
  const naturalWRef = useRef(0)
  const naturalHRef = useRef(0)
  const displayScaleRef = useRef(1)
  const aspectPresetRef = useRef('free')
  const dragModeRef = useRef<DragMode>('none')
  const dragStartRef = useRef({ mx: 0, my: 0, crop: { x: 0, y: 0, w: 0, h: 0 } })
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const imgSrcRef = useRef<string | null>(null)
  const outputUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current)
      if (imgSrcRef.current?.startsWith('blob:')) URL.revokeObjectURL(imgSrcRef.current)
    }
  }, [])

  // Keep refs in sync with state
  useEffect(() => { cropRef.current = crop }, [crop])
  useEffect(() => { aspectPresetRef.current = aspectPreset }, [aspectPreset])
  useEffect(() => { displayScaleRef.current = displayScale }, [displayScale])

  const applyAspectRatio = useCallback((c: Crop, preset: string, nw: number, nh: number): Crop => {
    if (preset === 'free') return c
    const [aw, ah] = preset.split(':').map(Number)
    const ratio = aw / ah
    let newH = Math.round(c.w / ratio)
    if (c.y + newH > nh) newH = nh - c.y
    return { ...c, h: Math.max(1, newH) }
  }, [])

  useEffect(() => {
    if (aspectPreset === 'free' || !naturalW) return
    const newCrop = applyAspectRatio(crop, aspectPreset, naturalW, naturalH)
    setCrop(newCrop); cropRef.current = newCrop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectPreset])

  const computeNewCrop = (mode: DragMode, mx: number, my: number): Crop => {
    const ds = dragStartRef.current
    const dx = mx - ds.mx; const dy = my - ds.my
    const start = ds.crop
    const nw = naturalWRef.current; const nh = naturalHRef.current
    let nc: Crop

    if (mode === 'new') {
      nc = { x: Math.min(ds.mx, mx), y: Math.min(ds.my, my), w: Math.abs(mx - ds.mx), h: Math.abs(my - ds.my) }
    } else if (mode === 'move') {
      nc = { ...start, x: clamp(start.x + dx, 0, nw - start.w), y: clamp(start.y + dy, 0, nh - start.h) }
    } else if (mode === 'se') {
      nc = { ...start, w: Math.max(10, start.w + dx), h: Math.max(10, start.h + dy) }
    } else if (mode === 'sw') {
      const newW = Math.max(10, start.w - dx)
      nc = { ...start, x: start.x + start.w - newW, w: newW, h: Math.max(10, start.h + dy) }
    } else if (mode === 'ne') {
      const newH = Math.max(10, start.h - dy)
      nc = { ...start, y: start.y + start.h - newH, w: Math.max(10, start.w + dx), h: newH }
    } else if (mode === 'nw') {
      const newW = Math.max(10, start.w - dx); const newH = Math.max(10, start.h - dy)
      nc = { x: start.x + start.w - newW, y: start.y + start.h - newH, w: newW, h: newH }
    } else if (mode === 'n') {
      const newH = Math.max(10, start.h - dy)
      nc = { ...start, y: start.y + start.h - newH, h: newH }
    } else if (mode === 's') {
      nc = { ...start, h: Math.max(10, start.h + dy) }
    } else if (mode === 'e') {
      nc = { ...start, w: Math.max(10, start.w + dx) }
    } else {
      const newW = Math.max(10, start.w - dx)
      nc = { ...start, x: start.x + start.w - newW, w: newW }
    }

    // Apply aspect ratio
    const preset = aspectPresetRef.current
    if (preset !== 'free' && mode !== 'move') {
      const [aw, ah] = preset.split(':').map(Number)
      nc.h = Math.max(1, Math.round(nc.w / (aw / ah)))
    }

    // Clamp to image bounds
    nc.x = clamp(nc.x, 0, nw - 1); nc.y = clamp(nc.y, 0, nh - 1)
    nc.w = clamp(nc.w, 1, nw - nc.x); nc.h = clamp(nc.h, 1, nh - nc.y)
    return nc
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragModeRef.current === 'none' || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const s = displayScaleRef.current
      const mx = (e.clientX - rect.left) / s
      const my = (e.clientY - rect.top) / s
      const nc = computeNewCrop(dragModeRef.current, mx, my)
      cropRef.current = nc; setCrop(nc)
    }
    const onUp = () => { dragModeRef.current = 'none' }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onContainerMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !naturalWRef.current) return
    e.preventDefault()
    const rect = containerRef.current.getBoundingClientRect()
    const s = displayScaleRef.current
    const mx = (e.clientX - rect.left) / s
    const my = (e.clientY - rect.top) / s
    dragModeRef.current = 'new'
    dragStartRef.current = { mx, my, crop: { x: mx, y: my, w: 0, h: 0 } }
    setCrop({ x: mx, y: my, w: 0, h: 0 }); cropRef.current = { x: mx, y: my, w: 0, h: 0 }
    if (outputUrlRef.current) { URL.revokeObjectURL(outputUrlRef.current); outputUrlRef.current = null; setOutputUrl(null) }
  }

  const onBoxMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const s = displayScaleRef.current
    dragModeRef.current = 'move'
    dragStartRef.current = { mx: (e.clientX - rect.left) / s, my: (e.clientY - rect.top) / s, crop: { ...cropRef.current } }
  }

  const onHandleMouseDown = (e: React.MouseEvent, pos: DragMode) => {
    e.stopPropagation()
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const s = displayScaleRef.current
    dragModeRef.current = pos
    dragStartRef.current = { mx: (e.clientX - rect.left) / s, my: (e.clientY - rect.top) / s, crop: { ...cropRef.current } }
  }

  const onImageLoad = () => {
    const img = imgRef.current!
    const nw = img.naturalWidth, nh = img.naturalHeight
    setNaturalW(nw); setNaturalH(nh)
    naturalWRef.current = nw; naturalHRef.current = nh

    const maxW = containerRef.current?.clientWidth ?? 700
    const scale = nw > maxW ? maxW / nw : 1
    setDisplayScale(scale); displayScaleRef.current = scale

    const initCrop = { x: 0, y: 0, w: nw, h: nh }
    setCrop(initCrop); cropRef.current = initCrop
  }

  const onFileLoad = (file: File) => {
    if (imgSrcRef.current?.startsWith('blob:')) URL.revokeObjectURL(imgSrcRef.current)
    if (outputUrlRef.current) { URL.revokeObjectURL(outputUrlRef.current); outputUrlRef.current = null }
    const url = URL.createObjectURL(file)
    imgSrcRef.current = url
    setImgSrc(url); setFileName(file.name); setOutputUrl(null)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    setOutputExt(ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpg')
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) onFileLoad(file)
  }

  const doCrop = () => {
    if (!imgRef.current || crop.w < 1 || crop.h < 1) return
    const c = crop
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(c.w); canvas.height = Math.round(c.h)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(imgRef.current, Math.round(c.x), Math.round(c.y), Math.round(c.w), Math.round(c.h), 0, 0, Math.round(c.w), Math.round(c.h))
    const mime = outputExt === 'png' ? 'image/png' : outputExt === 'webp' ? 'image/webp' : 'image/jpeg'
    canvas.toBlob((blob) => {
      canvas.width = 0; canvas.height = 0
      if (!blob) return
      if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current)
      const url = URL.createObjectURL(blob)
      outputUrlRef.current = url; setOutputUrl(url)
    }, mime, 0.95)
  }

  const ds = displayScale
  const showBox = crop.w > 5 && crop.h > 5

  return (
    <section className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <AdSlot position="header" />

      {!imgSrc ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          className={`relative border-2 border-dashed rounded-2xl p-14 text-center transition-colors cursor-pointer ${
            dragging ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'
          }`}
        >
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileLoad(f); e.target.value = '' }} />
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <p className="font-syne font-bold text-dark text-lg mb-1">Drop an image here</p>
          <p className="text-gray-400 text-sm">JPG, PNG, WebP · Single file</p>
          <p className="text-gray-300 text-xs mt-3">Your file never leaves your browser</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Aspect ratio presets */}
          <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-500 shrink-0">Aspect ratio:</span>
            {ASPECT_PRESETS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setAspectPreset(value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  aspectPreset === value ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-600 border-gray-200 hover:border-orange-300'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { setImgSrc(null); setFileName(''); setOutputUrl(null) }}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Change image
            </button>
          </div>

          {/* Crop area */}
          <div
            ref={containerRef}
            className="relative bg-gray-900 rounded-2xl overflow-hidden select-none cursor-crosshair"
            onMouseDown={onContainerMouseDown}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imgSrc}
              alt="crop preview"
              onLoad={onImageLoad}
              draggable={false}
              style={{ width: Math.round(naturalW * ds), height: Math.round(naturalH * ds), display: 'block', maxWidth: '100%' }}
            />

            {showBox && (
              <div
                className="absolute border border-white"
                style={{
                  left: Math.round(crop.x * ds),
                  top: Math.round(crop.y * ds),
                  width: Math.round(crop.w * ds),
                  height: Math.round(crop.h * ds),
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                  cursor: 'move',
                }}
                onMouseDown={onBoxMouseDown}
              >
                {/* Rule of thirds guides */}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)', backgroundSize: '33.33% 33.33%' }} />

                {/* Resize handles */}
                {HANDLES.map(({ pos, cursor, style }) => (
                  <div
                    key={pos}
                    className="absolute w-3 h-3 bg-white border border-gray-300 rounded-sm"
                    style={{ ...style, cursor, position: 'absolute' }}
                    onMouseDown={(e) => onHandleMouseDown(e, pos)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Crop info + action */}
          <div className="bg-white rounded-2xl shadow-card p-5 flex flex-wrap items-center gap-4">
            <div className="text-sm text-gray-500 flex-1">
              {showBox ? (
                <span>
                  <span className="font-medium text-dark">{Math.round(crop.w)}</span> × <span className="font-medium text-dark">{Math.round(crop.h)}</span> px
                  <span className="ml-2 text-gray-400">at ({Math.round(crop.x)}, {Math.round(crop.y)})</span>
                </span>
              ) : (
                <span className="text-gray-400">Draw a selection on the image to crop</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">Output:</label>
              <select value={outputExt} onChange={(e) => setOutputExt(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-400">
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            <button
              onClick={doCrop}
              disabled={!showBox}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-syne font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              Crop Image
            </button>
          </div>

          {outputUrl && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <AdSlot position="pre_download" className="mb-4" />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm font-medium text-dark">
                  Cropped: <span className="text-gray-500">{Math.round(crop.w)} × {Math.round(crop.h)} px</span>
                </p>
                <a
                  href={outputUrl}
                  download={`${fileName.replace(/\.[^.]+$/, '')}_cropped.${outputExt}`}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-syne font-bold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
