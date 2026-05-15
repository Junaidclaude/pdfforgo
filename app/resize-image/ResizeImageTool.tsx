'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import AdSlot from '@/components/AdSlot'

type Mode = 'pixels' | 'percent'
type OutputFmt = 'original' | 'jpg' | 'png' | 'webp'
type Status = 'idle' | 'processing' | 'done' | 'error'

interface Result {
  name: string
  url: string
  blob: Blob
  origW: number
  origH: number
  w: number
  h: number
  ext: string
  sizeKb: number
}

interface PreviewInfo {
  url: string
  w: number
  h: number
  sizeKb: number
  name: string
  count: number
}

const PRESETS: { label: string; w: number; h: number; sub?: string }[] = [
  { label: 'Custom',     w: 0,    h: 0    },
  { label: 'HD',         w: 1280, h: 720,  sub: '1280×720'  },
  { label: 'Full HD',    w: 1920, h: 1080, sub: '1920×1080' },
  { label: '2K',         w: 2048, h: 1080, sub: '2048×1080' },
  { label: '4K',         w: 3840, h: 2160, sub: '3840×2160' },
  { label: 'Profile',    w: 400,  h: 400,  sub: '400×400'   },
  { label: 'Thumbnail',  w: 150,  h: 150,  sub: '150×150'   },
  { label: 'Instagram',  w: 1080, h: 1080, sub: '1080×1080' },
  { label: 'Twitter',    w: 1200, h: 675,  sub: '1200×675'  },
  { label: 'Facebook',   w: 1200, h: 630,  sub: '1200×630'  },
]

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function ResizeImageTool() {
  const [mode, setMode] = useState<Mode>('pixels')
  const [preset, setPreset] = useState('Custom')
  const [targetW, setTargetW] = useState('1280')
  const [targetH, setTargetH] = useState('720')
  const [percent, setPercent] = useState('50')
  const [lockAspect, setLockAspect] = useState(true)
  const [quality, setQuality] = useState(85)
  const [outputFmt, setOutputFmt] = useState<OutputFmt>('original')
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<PreviewInfo | null>(null)
  const urlsRef = useRef<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string>('')

  useEffect(() => () => {
    urlsRef.current.forEach(URL.revokeObjectURL)
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  const applyPreset = (p: typeof PRESETS[0]) => {
    setPreset(p.label)
    if (p.w === 0) return
    setMode('pixels')
    setTargetW(String(p.w))
    setTargetH(String(p.h))
    setLockAspect(false)
  }

  const getOutputMime = (fileType: string): string => {
    if (outputFmt === 'jpg') return 'image/jpeg'
    if (outputFmt === 'png') return 'image/png'
    if (outputFmt === 'webp') return 'image/webp'
    return fileType === 'image/png' ? 'image/png' : fileType === 'image/webp' ? 'image/webp' : 'image/jpeg'
  }

  const getExt = (mime: string) =>
    mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'

  const resizeOne = (file: File): Promise<Result> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      const objUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objUrl)
        const nw = img.naturalWidth, nh = img.naturalHeight
        let dw: number, dh: number

        if (mode === 'percent') {
          const p = Math.max(1, Math.min(2000, Number(percent) || 50)) / 100
          dw = Math.round(nw * p)
          dh = Math.round(nh * p)
        } else if (lockAspect) {
          dw = Math.max(1, Number(targetW) || nw)
          dh = Math.round(dw * nh / nw)
        } else {
          dw = Math.max(1, Number(targetW) || nw)
          dh = Math.max(1, Number(targetH) || nh)
        }

        const canvas = document.createElement('canvas')
        canvas.width = dw; canvas.height = dh
        const ctx = canvas.getContext('2d')!
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, dw, dh)

        const mime = getOutputMime(file.type)
        const ext = getExt(mime)
        const q = mime === 'image/png' ? undefined : quality / 100

        canvas.toBlob((blob) => {
          canvas.width = 0; canvas.height = 0
          if (!blob) { reject(new Error(`Failed: ${file.name}`)); return }
          const url = URL.createObjectURL(blob)
          urlsRef.current.push(url)
          resolve({ name: file.name, url, blob, origW: nw, origH: nh, w: dw, h: dh, ext, sizeKb: Math.round(blob.size / 1024) })
        }, mime, q)
      }
      img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error(`Cannot load ${file.name}`)) }
      img.src = objUrl
    })

  const buildPreview = (files: File[]) => {
    const first = files[0]
    if (!first || !first.type.startsWith('image/')) return
    const url = URL.createObjectURL(first)
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = url
    const img = new Image()
    img.onload = () => {
      setPreview({ url, w: img.naturalWidth, h: img.naturalHeight, sizeKb: Math.round(first.size / 1024), name: first.name, count: files.length })
    }
    img.src = url
  }

  const process = useCallback(async (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith('image/'))
    if (!valid.length) { setError('Please upload image files (JPG, PNG, WebP, etc.)'); return }
    buildPreview(valid)
    urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []
    setStatus('processing'); setError(''); setResults([]); setProgress(0)

    const out: Result[] = []
    for (let i = 0; i < valid.length; i++) {
      try { out.push(await resizeOne(valid[i])) } catch (e) { console.error(e) }
      setProgress(Math.round(((i + 1) / valid.length) * 100))
    }
    setResults(out)
    setStatus(out.length ? 'done' : 'error')
    if (!out.length) setError('Could not resize any of the provided files.')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, targetW, targetH, percent, lockAspect, quality, outputFmt])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    process(Array.from(e.dataTransfer.files))
  }, [process])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) process(Array.from(e.target.files))
    e.target.value = ''
  }

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    for (const r of results) {
      zip.file(`${r.name.replace(/\.[^.]+$/, '')}_resized.${r.ext}`, r.blob)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'resized_images.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []
    if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = '' }
    setStatus('idle'); setResults([]); setError(''); setProgress(0); setPreview(null)
  }

  const showQuality = outputFmt !== 'png' && (outputFmt === 'jpg' || outputFmt === 'webp' || outputFmt === 'original')

  return (
    <section className="max-w-4xl mx-auto px-4 py-8 space-y-5">
      <AdSlot position="header" />

      {/* ── Settings card ── */}
      <div className="bg-white rounded-2xl border border-line p-6 space-y-5">

        {/* Mode toggle */}
        <div className="flex gap-2">
          {(['pixels', 'percent'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setPreset('Custom') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                mode === m
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'text-mute border-line hover:border-violet-300 hover:text-ink'
              }`}
            >
              {m === 'pixels' ? 'By Pixels' : 'By Percentage'}
            </button>
          ))}
        </div>

        {/* Presets (pixels mode only) */}
        {mode === 'pixels' && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-mute mb-2.5">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    preset === p.label
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'border-line text-mute hover:border-violet-300 hover:text-violet-600'
                  }`}
                >
                  <span>{p.label}</span>
                  {p.sub && <span className="ml-1 opacity-70 font-normal">{p.sub}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pixel dimensions */}
        {mode === 'pixels' && (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-mute block mb-1.5">Width (px)</label>
              <input
                type="number" min={1} max={9999}
                value={targetW}
                onChange={(e) => { setTargetW(e.target.value); setPreset('Custom') }}
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm font-medium text-ink focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Lock button */}
            <button
              onClick={() => setLockAspect((v) => !v)}
              title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              className={`mb-0.5 p-2.5 rounded-xl border transition-all ${
                lockAspect
                  ? 'bg-violet-50 border-violet-300 text-violet-600'
                  : 'border-line text-mute hover:border-gray-300'
              }`}
            >
              {lockAspect ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 0 1 4.5-4.5 4.5 4.5 0 0 1 4.5 4.5v3.75M3.75 10.5H20.25a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H3.75a2.25 2.25 0 0 1-2.25-2.25v-6.75a2.25 2.25 0 0 1 2.25-2.25Z" />
                </svg>
              )}
            </button>

            <div className="flex-1">
              <label className="text-xs font-semibold text-mute block mb-1.5">
                Height (px) {lockAspect && <span className="font-normal opacity-60">— auto</span>}
              </label>
              <input
                type="number" min={1} max={9999}
                value={lockAspect ? '' : targetH}
                placeholder={lockAspect ? 'auto' : ''}
                onChange={(e) => { setTargetH(e.target.value); setPreset('Custom') }}
                disabled={lockAspect}
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm font-medium text-ink focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>
        )}

        {/* Percent mode */}
        {mode === 'percent' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-mute">Scale</label>
              <span className="text-violet-600 font-bold text-sm">{percent}%</span>
            </div>
            <input
              type="range" min={1} max={200} step={1}
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-xs text-mute mt-1">
              <span>1% (tiny)</span>
              <span>100% (original)</span>
              <span>200% (2×)</span>
            </div>
          </div>
        )}

        {/* Quality + Format row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-line">
          {/* Output format */}
          <div>
            <label className="text-xs font-semibold text-mute block mb-1.5">Output Format</label>
            <div className="flex gap-1.5">
              {(['original', 'jpg', 'png', 'webp'] as OutputFmt[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setOutputFmt(f)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                    outputFmt === f
                      ? 'bg-ink text-white border-ink'
                      : 'border-line text-mute hover:border-gray-400 hover:text-ink'
                  }`}
                >
                  {f === 'original' ? 'Auto' : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className={!showQuality ? 'opacity-40 pointer-events-none' : ''}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-mute">
                Quality {outputFmt === 'png' ? '(lossless)' : ''}
              </label>
              <span className="text-violet-600 font-bold text-xs">{quality}%</span>
            </div>
            <input
              type="range" min={1} max={100} step={1}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-xs text-mute mt-0.5">
              <span>Smaller file</span>
              <span>Best quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drop zone / preview ── */}
      {status !== 'done' && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[200px] flex items-center justify-center overflow-hidden ${
            dragging
              ? 'border-violet-400 bg-violet-50'
              : 'border-line bg-white hover:border-violet-300 hover:bg-violet-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileChange}
            disabled={status === 'processing'}
          />

          {preview ? (
            /* Show image preview */
            <div className="w-full p-6 flex flex-col sm:flex-row items-center gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt="preview"
                className="w-36 h-36 object-contain rounded-xl border border-line bg-gray-50 shrink-0"
              />
              <div className="flex-1 text-left">
                <p className="font-display font-bold text-ink text-lg leading-tight mb-1 truncate">{preview.name}</p>
                {preview.count > 1 && (
                  <p className="text-sm text-violet-600 font-semibold mb-1">+{preview.count - 1} more image{preview.count > 2 ? 's' : ''}</p>
                )}
                <p className="text-mute text-sm">
                  Original: <span className="font-semibold text-ink">{preview.w} × {preview.h} px</span>
                  {' · '}
                  <span className="font-semibold text-ink">{fmtSize(preview.sizeKb * 1024)}</span>
                </p>
                {status === 'processing' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-mute">Resizing…</span>
                      <span className="text-xs font-bold text-violet-600">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                {status === 'idle' && (
                  <p className="text-xs text-mute mt-2">Click or drop to replace · Your settings above will be applied</p>
                )}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </div>
              <p className="font-display font-bold text-ink text-lg mb-1">Drop images here</p>
              <p className="text-mute text-sm">JPG, PNG, WebP, GIF · Multiple files supported</p>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1 text-xs text-green-700">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Your files never leave your browser
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* ── Results ── */}
      {status === 'done' && results.length > 0 && (
        <div className="bg-white rounded-2xl border border-line overflow-hidden">
          {/* Result header */}
          <div className="bg-violet-50 border-b border-violet-100 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <span className="font-display font-bold text-ink">
                {results.length} image{results.length > 1 ? 's' : ''} resized
              </span>
            </div>
            <div className="flex gap-2">
              {results.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download All (ZIP)
                </button>
              )}
              <button
                onClick={reset}
                className="bg-white border border-line hover:bg-gray-50 text-ink text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                New Files
              </button>
            </div>
          </div>

          <AdSlot position="pre_download" className="px-5 py-2" />

          <ul className="divide-y divide-line">
            {results.map((r, i) => (
              <li key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{r.name.replace(/\.[^.]+$/, '')}.{r.ext}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-mute line-through">{r.origW}×{r.origH}</span>
                    <svg className="w-3 h-3 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                    <span className="text-xs font-semibold text-violet-600">{r.w}×{r.h} px</span>
                    <span className="text-xs text-mute">·</span>
                    <span className="text-xs text-mute">{fmtSize(r.sizeKb * 1024)}</span>
                  </div>
                </div>
                <a
                  href={r.url}
                  download={`${r.name.replace(/\.[^.]+$/, '')}_resized.${r.ext}`}
                  className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AdSlot position="footer" />
    </section>
  )
}
