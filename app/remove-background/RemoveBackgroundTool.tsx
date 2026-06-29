'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'processing' | 'done' | 'error'

interface ImgResult {
  name: string
  originalUrl: string
  resultUrl: string
  blob: Blob
  w: number
  h: number
}

const BG_COLORS = [
  { value: 'transparent', label: 'None'    },
  { value: '#ffffff',     label: 'White'   },
  { value: '#000000',     label: 'Black'   },
  { value: '#f3f4f6',     label: 'Gray'    },
  { value: '#fef9c3',     label: 'Yellow'  },
  { value: '#fde68a',     label: 'Amber'   },
  { value: '#bbf7d0',     label: 'Mint'    },
  { value: '#22c55e',     label: 'Green'   },
  { value: '#bfdbfe',     label: 'Sky'     },
  { value: '#3b82f6',     label: 'Blue'    },
  { value: '#e9d5ff',     label: 'Lavender'},
  { value: '#a855f7',     label: 'Purple'  },
  { value: '#fce7f3',     label: 'Pink'    },
  { value: '#ef4444',     label: 'Red'     },
]

const CHECKER = 'repeating-conic-gradient(#d1d5db 0% 25%,#ffffff 0% 50%) 0 0/20px 20px'
const CHECKER_SM = 'repeating-conic-gradient(#d1d5db 0% 25%,#ffffff 0% 50%) 0 0/10px 10px'

function fmt(b: number) { return b >= 1_048_576 ? (b / 1_048_576).toFixed(1) + ' MB' : (b / 1024).toFixed(0) + ' KB' }

export default function RemoveBackgroundTool() {
  const [status,    setStatus]    = useState<Status>('idle')
  const [progress,  setProgress]  = useState(0)
  const [results,   setResults]   = useState<ImgResult[]>([])
  const [dragging,  setDragging]  = useState(false)
  const [error,     setError]     = useState('')
  const [preview,   setPreview]   = useState<string | null>(null)
  const [bgColor,   setBgColor]   = useState('transparent')
  const [customBg,  setCustomBg]  = useState('#ffffff')
  const [activeIdx, setActiveIdx] = useState(0)
  const [slider,    setSlider]    = useState(0.5)
  const [draggingSlider, setDraggingSlider] = useState(false)

  const urlsRef    = useRef<string[]>([])
  const inputRef   = useRef<HTMLInputElement>(null)
  const compareRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => { urlsRef.current.forEach(URL.revokeObjectURL) }, [])

  // ── Process files ──────────────────────────────────────────────────────────
  const processFiles = useCallback(async (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/') && !f.type.includes('gif'))
    if (!valid.length) { setError('Please upload JPG, PNG, or WebP images.'); return }

    setStatus('processing'); setError(''); setResults([]); setProgress(0); setActiveIdx(0); setSlider(0.5)

    const firstUrl = URL.createObjectURL(valid[0])
    urlsRef.current.push(firstUrl); setPreview(firstUrl)

    try {
      const out: ImgResult[] = []

      for (let i = 0; i < valid.length; i++) {
        const file = valid[i]
        const origUrl = URL.createObjectURL(file)
        urlsRef.current.push(origUrl)

        const dims = await new Promise<{ w: number; h: number }>(res => {
          const img = new Image(); img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight }); img.src = origUrl
        })

        const form = new FormData()
        form.append('image', file)

        const res = await fetch('/api/remove-bg', { method: 'POST', body: form })

        if (!res.ok) {
          const json = await res.json().catch(() => ({ error: res.statusText }))
          throw new Error(json.error ?? `Server error ${res.status}`)
        }

        const blob = await res.blob()
        const resultUrl = URL.createObjectURL(blob)
        urlsRef.current.push(resultUrl)
        out.push({ name: file.name, originalUrl: origUrl, resultUrl, blob, ...dims })
        setProgress(Math.round(((i + 1) / valid.length) * 100))
      }

      setResults(out); setStatus('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Background removal error:', msg, err)
      setError(`Background removal failed: ${msg.slice(0, 200)}`)
      setStatus('error')
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); processFiles(Array.from(e.dataTransfer.files))
  }, [processFiles])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(Array.from(e.target.files)); e.target.value = ''
  }

  // ── Comparison slider ──────────────────────────────────────────────────────
  const sliderPosFromEvent = (e: React.PointerEvent) => {
    if (!compareRef.current) return 0.5
    const r = compareRef.current.getBoundingClientRect()
    return Math.max(0.01, Math.min(0.99, (e.clientX - r.left) / r.width))
  }

  const onSliderDown = (e: React.PointerEvent) => {
    e.preventDefault(); setDraggingSlider(true); setSlider(sliderPosFromEvent(e))
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onSliderMove  = (e: React.PointerEvent) => { if (draggingSlider) setSlider(sliderPosFromEvent(e)) }
  const onSliderUp    = () => setDraggingSlider(false)

  // ── Download ───────────────────────────────────────────────────────────────
  const download = async (r: ImgResult) => {
    const effectiveBg = bgColor === 'custom' ? customBg : bgColor
    if (effectiveBg === 'transparent') {
      const a = document.createElement('a'); a.href = r.resultUrl; a.download = r.name.replace(/\.[^.]+$/, '') + '-no-bg.png'; a.click(); return
    }
    const canvas = document.createElement('canvas'); canvas.width = r.w; canvas.height = r.h
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = effectiveBg; ctx.fillRect(0, 0, r.w, r.h)
    const img = new Image(); img.onload = () => {
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = r.name.replace(/\.[^.]+$/, '') + '-no-bg.png'; a.click()
        setTimeout(() => URL.revokeObjectURL(url), 5_000)
      }, 'image/png')
    }; img.src = r.resultUrl
  }

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default; const zip = new JSZip()
    for (const r of results) { const res = await fetch(r.resultUrl); zip.file(r.name.replace(/\.[^.]+$/, '') + '-no-bg.png', await res.blob()) }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'removed-backgrounds.zip'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5_000)
  }

  const reset = () => {
    urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []
    setStatus('idle'); setResults([]); setPreview(null); setError(''); setProgress(0); setActiveIdx(0); setSlider(0.5)
  }

  const active     = results[activeIdx]
  const effectiveBg = bgColor === 'custom' ? customBg : bgColor

  // ═══════════════════════════════════════════════════════════════════════════
  // IDLE / ERROR — Upload screen
  // ═══════════════════════════════════════════════════════════════════════════
  if (status === 'idle' || status === 'error') {
    return (
      <div className="min-h-[calc(100vh-57px)] bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Hero text */}
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-3xl text-ink mb-2">Remove Image Background</h1>
            <p className="text-mute text-base">100% automatic · AI-powered · Free · No upload · Results in seconds</p>
          </div>

          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center gap-5 cursor-pointer transition-all select-none
              ${dragging ? 'border-green-400 bg-green-50 scale-[1.01]' : 'border-gray-200 hover:border-green-400 hover:bg-green-50/40 bg-white shadow-sm'}`}
          >
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onFileChange} />

            {/* Icon */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-green-100' : 'bg-green-50'}`}>
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            <div className="text-center">
              <p className="font-display font-bold text-xl text-ink">
                {dragging ? 'Drop to remove background' : 'Drop image here'}
              </p>
              <p className="text-mute text-sm mt-1.5">or click to browse · JPG, PNG, WebP · Batch supported</p>
            </div>

            <button
              onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
              className="mt-1 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-xl text-base transition-colors shadow-sm"
            >
              Upload Image
            </button>

            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-full px-4 py-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              AI-powered · Fast · Free · No sign-up required
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium text-center">{error}</div>
          )}

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['People & portraits', 'Products', 'Animals', 'Cars', 'Graphics & logos'].map(label => (
              <span key={label} className="text-xs font-semibold bg-white border border-gray-200 text-gray-600 rounded-full px-4 py-2 shadow-sm">{label}</span>
            ))}
          </div>
        </div>

        <div className="mt-10 w-full max-w-2xl"><AdSlot position="footer" /></div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING / PROCESSING
  // ═══════════════════════════════════════════════════════════════════════════
  if (status === 'processing') {
    return (
      <div className="min-h-[calc(100vh-57px)] bg-gray-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Image preview with spinner overlay */}
          {preview && (
            <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 backdrop-blur-[2px] bg-white/50 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full border-4 border-green-100 border-t-green-500 animate-spin" />
                {status === 'processing' && (
                  <span className="font-bold text-green-700 text-sm bg-white/90 px-3 py-1 rounded-full">{progress}%</span>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="font-display font-bold text-xl text-ink">Removing background…</p>
            <p className="text-mute text-sm mt-1">AI is processing your image — hang tight!</p>
          </div>

          <div className="w-72 bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress > 0 ? progress : 30}%` }} />
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DONE — Result view
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-[calc(100vh-57px)] bg-gray-50 flex flex-col">

      {/* Batch thumbnail strip */}
      {results.length > 1 && (
        <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
          {results.map((r, i) => (
            <button key={i} onClick={() => { setActiveIdx(i); setSlider(0.5) }}
              className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeIdx ? 'border-green-500 shadow' : 'border-gray-200 hover:border-green-300'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.resultUrl} alt={r.name} className="w-full h-full object-cover"
                style={{ background: CHECKER_SM }} />
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="flex flex-1 gap-0">

          {/* ── LEFT: Comparison viewer ── */}
          <div className="flex-1 flex items-center justify-center p-6 min-h-0">
            <div className="w-full max-w-3xl">

              {/* Comparison drag area */}
              <div
                ref={compareRef}
                className="relative overflow-hidden rounded-2xl shadow-xl select-none cursor-col-resize"
                style={{ background: CHECKER }}
                onPointerDown={onSliderDown}
                onPointerMove={onSliderMove}
                onPointerUp={onSliderUp}
                onPointerLeave={onSliderUp}
              >
                {/* Result layer (right side) */}
                <div
                  className="absolute inset-0"
                  style={{ background: effectiveBg === 'transparent' ? CHECKER : effectiveBg }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.resultUrl}
                  alt="result"
                  className="relative block w-full"
                  style={{ maxHeight: 'calc(100vh - 200px)', objectFit: 'contain' }}
                  draggable={false}
                />

                {/* Original image clipped to left of slider */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${(1 - slider) * 100}% 0 0)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={active.originalUrl}
                    alt="original"
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </div>

                {/* Slider line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)]"
                  style={{ left: `${slider * 100}%`, transform: 'translateX(-50%)' }}
                >
                  {/* Handle circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border border-gray-200">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  </div>
                </div>

                {/* Before / After labels */}
                <div className="absolute top-3 left-3 pointer-events-none"
                  style={{ opacity: slider > 0.12 ? 1 : 0, transition: 'opacity 0.2s' }}>
                  <span className="text-xs font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">Before</span>
                </div>
                <div className="absolute top-3 right-3 pointer-events-none"
                  style={{ opacity: slider < 0.88 ? 1 : 0, transition: 'opacity 0.2s' }}>
                  <span className="text-xs font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">After</span>
                </div>

                {/* Hint text */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
                  <span className="text-[11px] font-semibold text-white bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full whitespace-nowrap">
                    ← Drag to compare →
                  </span>
                </div>
              </div>

              {/* Image info */}
              <p className="text-xs text-mute text-center mt-3">
                {active.w} × {active.h} px · {active.name}
              </p>
            </div>
          </div>

          {/* ── RIGHT: Controls panel ── */}
          <div className="w-80 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-y-auto">
            <div className="p-5 space-y-6 flex-1">

              {/* Download */}
              <div>
                <button
                  onClick={() => download(active)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2.5 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </button>
                {effectiveBg !== 'transparent' && (
                  <p className="text-[11px] text-mute text-center mt-1.5">PNG with {effectiveBg} background</p>
                )}
                {effectiveBg === 'transparent' && (
                  <p className="text-[11px] text-mute text-center mt-1.5">PNG with transparent background</p>
                )}
              </div>

              {/* Background color */}
              <div>
                <p className="text-sm font-bold text-ink mb-3">Background</p>

                {/* Color grid */}
                <div className="grid grid-cols-7 gap-1.5 mb-3">
                  {BG_COLORS.map(c => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => setBgColor(c.value)}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${bgColor === c.value ? 'border-green-500 scale-110 shadow' : 'border-transparent hover:border-gray-300'}`}
                      style={c.value === 'transparent'
                        ? { background: CHECKER_SM }
                        : { background: c.value }
                      }
                    />
                  ))}
                  {/* Custom color swatch */}
                  <div className="relative w-full aspect-square">
                    <input
                      type="color"
                      value={customBg}
                      onChange={e => { setCustomBg(e.target.value); setBgColor('custom') }}
                      onClick={() => setBgColor('custom')}
                      title="Custom color"
                      className={`absolute inset-0 w-full h-full rounded-lg border-2 cursor-pointer opacity-100 ${bgColor === 'custom' ? 'border-green-500 scale-110 shadow' : 'border-transparent hover:border-gray-300'}`}
                      style={{ padding: '2px' }}
                    />
                  </div>
                </div>

                {/* Selected background label */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <div className="w-5 h-5 rounded flex-shrink-0 border border-gray-200"
                    style={effectiveBg === 'transparent' ? { background: CHECKER_SM } : { background: effectiveBg }} />
                  <span className="text-xs font-semibold text-ink">
                    {bgColor === 'transparent' ? 'Transparent (PNG)' : bgColor === 'custom' ? `Custom (${customBg})` : BG_COLORS.find(c => c.value === bgColor)?.label ?? bgColor}
                  </span>
                </div>
              </div>

              {/* Image size info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-mute uppercase tracking-wider">Image Info</p>
                <div className="flex justify-between text-xs">
                  <span className="text-mute">Dimensions</span>
                  <span className="font-semibold text-ink">{active.w} × {active.h} px</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-mute">Format</span>
                  <span className="font-semibold text-ink">PNG (lossless)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-mute">File size</span>
                  <span className="font-semibold text-ink">{fmt(active.blob.size)}</span>
                </div>
              </div>

              {/* Download all (batch) */}
              {results.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="w-full border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download All ({results.length}) as ZIP
                </button>
              )}

              {/* New image */}
              <button
                onClick={reset}
                className="w-full border border-gray-200 text-gray-600 hover:text-ink hover:border-gray-300 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Remove Another Background
              </button>
            </div>

            <div className="p-4 border-t border-gray-100">
              <AdSlot position="footer" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
