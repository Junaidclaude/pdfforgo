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

// Computes where to draw/position a "cover"-fit background image within a
// container, as fractions of the container size — used identically for both
// the live preview (as %-based CSS) and the exported canvas, so what you see
// is exactly what you get regardless of on-screen pixel size.
function coverLayout(containerAspect: number, imgAspect: number, scale: number, offXPct: number, offYPct: number) {
  let width: number, height: number
  if (imgAspect > containerAspect) { height = 1; width = imgAspect / containerAspect }
  else { width = 1; height = containerAspect / imgAspect }
  width *= scale; height *= scale
  return {
    left: (1 - width) / 2 + offXPct / 100,
    top: (1 - height) / 2 + offYPct / 100,
    width,
    height,
  }
}

function buildFilterCSS(brightness: number, contrast: number, saturation: number, blur: number) {
  const parts = [
    brightness !== 100 ? `brightness(${brightness}%)` : '',
    contrast   !== 100 ? `contrast(${contrast}%)`     : '',
    saturation !== 100 ? `saturate(${saturation}%)`   : '',
    blur       > 0     ? `blur(${blur}px)`            : '',
  ].filter(Boolean)
  return parts.length ? parts.join(' ') : 'none'
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

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

  // Custom uploaded background image + its position/zoom within the frame
  const [bgImage,     setBgImage]     = useState<string | null>(null)
  const [bgImageDims, setBgImageDims] = useState<{ w: number; h: number } | null>(null)
  const [bgScale,     setBgScale]     = useState(1)
  const [bgOffsetX,   setBgOffsetX]   = useState(0) // percent, clamped to available pan range
  const [bgOffsetY,   setBgOffsetY]   = useState(0)

  // Toolbar above the image: which panel is expanded
  const [activeTab, setActiveTab] = useState<'background' | 'effects' | 'design' | null>(null)

  // Effects applied to the cutout (foreground) image
  const [brightness, setBrightness] = useState(100)
  const [contrast,   setContrast]   = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [fgBlur,      setFgBlur]     = useState(0)

  const urlsRef      = useRef<string[]>([])
  const inputRef      = useRef<HTMLInputElement>(null)
  const bgImageInputRef = useRef<HTMLInputElement>(null)
  const bgImageUrlRef  = useRef<string | null>(null)
  const compareRef    = useRef<HTMLDivElement>(null)

  useEffect(() => () => {
    urlsRef.current.forEach(URL.revokeObjectURL)
    if (bgImageUrlRef.current) URL.revokeObjectURL(bgImageUrlRef.current)
  }, [])

  const clearBgImage = useCallback(() => {
    if (bgImageUrlRef.current) URL.revokeObjectURL(bgImageUrlRef.current)
    bgImageUrlRef.current = null
    setBgImage(null); setBgImageDims(null); setBgScale(1); setBgOffsetX(0); setBgOffsetY(0)
  }, [])

  const onBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    if (bgImageUrlRef.current) URL.revokeObjectURL(bgImageUrlRef.current)
    const url = URL.createObjectURL(file)
    bgImageUrlRef.current = url
    const img = new Image()
    img.onload = () => {
      setBgImageDims({ w: img.naturalWidth, h: img.naturalHeight })
      setBgImage(url)
      setBgScale(1); setBgOffsetX(0); setBgOffsetY(0)
    }
    img.src = url
  }

  // Max pan range grows with zoom — at scale 1 there's no extra room to pan
  const maxBgOffsetPct = Math.max(0, (bgScale - 1) * 50)

  const onBgScaleChange = (v: number) => {
    setBgScale(v)
    const m = Math.max(0, (v - 1) * 50)
    setBgOffsetX(x => Math.max(-m, Math.min(m, x)))
    setBgOffsetY(y => Math.max(-m, Math.min(m, y)))
  }

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

  // ── Compositing (shared by download + "open in Photopea") ──────────────────
  const compositeCanvas = async (r: ImgResult): Promise<HTMLCanvasElement> => {
    const effectiveBg = bgColor === 'custom' ? customBg : bgColor
    const useImageBg = !!(bgImage && bgImageDims)

    const canvas = document.createElement('canvas'); canvas.width = r.w; canvas.height = r.h
    const ctx = canvas.getContext('2d')!

    if (useImageBg) {
      const bg = await loadImg(bgImage!)
      const l = coverLayout(r.w / r.h, bgImageDims!.w / bgImageDims!.h, bgScale, bgOffsetX, bgOffsetY)
      ctx.drawImage(bg, l.left * r.w, l.top * r.h, l.width * r.w, l.height * r.h)
    } else if (effectiveBg !== 'transparent') {
      ctx.fillStyle = effectiveBg; ctx.fillRect(0, 0, r.w, r.h)
    }

    const fg = await loadImg(r.resultUrl)
    ctx.filter = effectsCSS
    ctx.drawImage(fg, 0, 0)
    ctx.filter = 'none'
    return canvas
  }

  // ── Download ───────────────────────────────────────────────────────────────
  const download = async (r: ImgResult) => {
    const effectiveBg = bgColor === 'custom' ? customBg : bgColor
    const useImageBg = !!(bgImage && bgImageDims)
    const hasEffects = effectsCSS !== 'none'

    if (!useImageBg && !hasEffects && effectiveBg === 'transparent') {
      const a = document.createElement('a'); a.href = r.resultUrl; a.download = r.name.replace(/\.[^.]+$/, '') + '-no-bg.png'; a.click(); return
    }

    const canvas = await compositeCanvas(r)
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = r.name.replace(/\.[^.]+$/, '') + '-no-bg.png'; a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5_000)
    }, 'image/png')
  }

  // ── Continue editing in Photopea (free, no signup/API key) ─────────────────
  const openInPhotopea = async () => {
    if (!active) return
    const canvas = await compositeCanvas(active)
    const dataUrl = canvas.toDataURL('image/png')
    const config = { files: [dataUrl] }
    window.open(`https://www.photopea.com/#${encodeURIComponent(JSON.stringify(config))}`, '_blank', 'noopener,noreferrer')
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

  const active      = results[activeIdx]
  const effectiveBg = bgColor === 'custom' ? customBg : bgColor
  const effectsCSS  = buildFilterCSS(brightness, contrast, saturation, fgBlur)
  const resetEffects = () => { setBrightness(100); setContrast(100); setSaturation(100); setFgBlur(0) }

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

              {/* Toolbar: Background / Effects / Design — sits just above the image */}
              <div className="flex items-center justify-center gap-2 mb-3">
                {([
                  { key: 'background', label: 'Background' },
                  { key: 'effects', label: 'Effects' },
                  { key: 'design', label: 'Design' },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(t => t === tab.key ? null : tab.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${activeTab === tab.key ? 'bg-green-50 text-green-700 border-green-300' : 'bg-white text-mute border-gray-200 hover:border-gray-300'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab && (
                <div className="mb-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-4">

                  {/* ── Background panel ── */}
                  {activeTab === 'background' && (
                    <div>
                      <div className="grid grid-cols-10 gap-1.5 mb-3">
                        {BG_COLORS.map(c => (
                          <button
                            key={c.value}
                            title={c.label}
                            onClick={() => { setBgColor(c.value); clearBgImage() }}
                            className={`w-full aspect-square rounded-lg border-2 transition-all ${!bgImage && bgColor === c.value ? 'border-green-500 scale-110 shadow' : 'border-transparent hover:border-gray-300'}`}
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
                            onChange={e => { setCustomBg(e.target.value); setBgColor('custom'); clearBgImage() }}
                            onClick={() => { setBgColor('custom'); clearBgImage() }}
                            title="Custom color"
                            className={`absolute inset-0 w-full h-full rounded-lg border-2 cursor-pointer opacity-100 ${!bgImage && bgColor === 'custom' ? 'border-green-500 scale-110 shadow' : 'border-transparent hover:border-gray-300'}`}
                            style={{ padding: '2px' }}
                          />
                        </div>
                        {/* Upload image as background */}
                        <button
                          type="button"
                          title="Upload background image"
                          onClick={() => bgImageInputRef.current?.click()}
                          className={`relative w-full aspect-square rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${bgImage ? 'border-green-500 scale-110 shadow' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
                        >
                          {bgImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          )}
                        </button>
                        <input
                          ref={bgImageInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={e => { onBgImageChange(e); setActiveTab('design') }}
                        />
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <div className="w-5 h-5 rounded flex-shrink-0 border border-gray-200 bg-cover bg-center"
                          style={bgImage ? { backgroundImage: `url(${bgImage})` } : effectiveBg === 'transparent' ? { background: CHECKER_SM } : { background: effectiveBg }} />
                        <span className="text-xs font-semibold text-ink">
                          {bgImage ? 'Custom image' : bgColor === 'transparent' ? 'Transparent (PNG)' : bgColor === 'custom' ? `Custom (${customBg})` : BG_COLORS.find(c => c.value === bgColor)?.label ?? bgColor}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── Effects panel ── */}
                  {activeTab === 'effects' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-mute uppercase tracking-wider">Effects</p>
                        <button onClick={resetEffects} className="text-xs text-gray-400 hover:text-red-500 font-semibold">
                          Reset
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-mute mb-1.5">
                            <span>Brightness</span><span>{brightness}%</span>
                          </div>
                          <input type="range" min={0} max={200} value={brightness}
                            onChange={e => setBrightness(Number(e.target.value))}
                            className="w-full accent-green-500" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-mute mb-1.5">
                            <span>Contrast</span><span>{contrast}%</span>
                          </div>
                          <input type="range" min={0} max={200} value={contrast}
                            onChange={e => setContrast(Number(e.target.value))}
                            className="w-full accent-green-500" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-mute mb-1.5">
                            <span>Saturation</span><span>{saturation}%</span>
                          </div>
                          <input type="range" min={0} max={200} value={saturation}
                            onChange={e => setSaturation(Number(e.target.value))}
                            className="w-full accent-green-500" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-mute mb-1.5">
                            <span>Blur</span><span>{fgBlur}px</span>
                          </div>
                          <input type="range" min={0} max={20} value={fgBlur}
                            onChange={e => setFgBlur(Number(e.target.value))}
                            className="w-full accent-green-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Design panel — position/zoom the uploaded background image ── */}
                  {activeTab === 'design' && (
                    <div className="space-y-4">
                    {bgImage ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-mute uppercase tracking-wider">Design</p>
                          <button onClick={clearBgImage} className="text-xs text-gray-400 hover:text-red-500 font-semibold">
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <div className="flex justify-between text-xs font-semibold text-mute mb-1.5">
                              <span>Zoom</span><span>{Math.round(bgScale * 100)}%</span>
                            </div>
                            <input
                              type="range" min={1} max={2.5} step={0.01} value={bgScale}
                              onChange={e => onBgScaleChange(parseFloat(e.target.value))}
                              className="w-full accent-green-500"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-mute mb-1.5">Horizontal position</p>
                            <input
                              type="range" min={-maxBgOffsetPct} max={maxBgOffsetPct} step={0.5}
                              value={Math.max(-maxBgOffsetPct, Math.min(maxBgOffsetPct, bgOffsetX))}
                              onChange={e => setBgOffsetX(parseFloat(e.target.value))}
                              disabled={maxBgOffsetPct === 0}
                              className="w-full accent-green-500 disabled:opacity-40"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-mute mb-1.5">Vertical position</p>
                            <input
                              type="range" min={-maxBgOffsetPct} max={maxBgOffsetPct} step={0.5}
                              value={Math.max(-maxBgOffsetPct, Math.min(maxBgOffsetPct, bgOffsetY))}
                              onChange={e => setBgOffsetY(parseFloat(e.target.value))}
                              disabled={maxBgOffsetPct === 0}
                              className="w-full accent-green-500 disabled:opacity-40"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => { setBgScale(1); setBgOffsetX(0); setBgOffsetY(0) }}
                          className="text-xs font-semibold text-gray-500 hover:text-ink border border-gray-200 rounded-lg py-2 px-4 transition-colors"
                        >
                          Reset position
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-mute text-center py-2">
                        Upload a background image in the <button onClick={() => setActiveTab('background')} className="text-green-600 font-semibold hover:underline">Background</button> tab to reposition and zoom it.
                      </p>
                    )}

                    <div className="border-t border-gray-100 pt-4">
                      <button
                        onClick={openInPhotopea}
                        className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-ink font-semibold py-2.5 rounded-xl text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Continue editing in Photopea
                      </button>
                      <p className="text-[11px] text-mute text-center mt-1.5">Free online editor · opens in a new tab · no account needed</p>
                    </div>
                    </div>
                  )}
                </div>
              )}

              {/* Comparison drag area */}
              <div
                ref={compareRef}
                className="relative overflow-hidden rounded-2xl shadow-xl select-none cursor-col-resize mx-auto"
                style={{
                  background: CHECKER,
                  aspectRatio: `${active.w} / ${active.h}`,
                  // Fit within both available width and viewport height while
                  // keeping the box's aspect exactly equal to the image's —
                  // block-level `aspect-ratio` doesn't shrink width to match
                  // a max-height clamp on its own, so compute it directly.
                  width: `min(100%, calc((100vh - 200px) * ${active.w / active.h}))`,
                }}
                onPointerDown={onSliderDown}
                onPointerMove={onSliderMove}
                onPointerUp={onSliderUp}
                onPointerLeave={onSliderUp}
              >
                {/* Result layer (right side) */}
                {bgImage && bgImageDims ? (
                  <div className="absolute inset-0 overflow-hidden">
                    {(() => {
                      const l = coverLayout(active.w / active.h, bgImageDims.w / bgImageDims.h, bgScale, bgOffsetX, bgOffsetY)
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bgImage}
                          alt=""
                          draggable={false}
                          className="absolute"
                          style={{
                            left: `${l.left * 100}%`, top: `${l.top * 100}%`,
                            width: `${l.width * 100}%`, height: `${l.height * 100}%`,
                            // Tailwind Preflight sets `img { max-width: 100% }` globally,
                            // which would clamp this any time the layout math scales
                            // the image above the container's own width.
                            maxWidth: 'none',
                          }}
                        />
                      )
                    })()}
                  </div>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: effectiveBg === 'transparent' ? CHECKER : effectiveBg }}
                  />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.resultUrl}
                  alt="result"
                  className="relative block w-full h-full object-cover"
                  style={{ filter: effectsCSS }}
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
                {bgImage ? (
                  <p className="text-[11px] text-mute text-center mt-1.5">PNG with custom image background</p>
                ) : effectiveBg !== 'transparent' ? (
                  <p className="text-[11px] text-mute text-center mt-1.5">PNG with {effectiveBg} background</p>
                ) : (
                  <p className="text-[11px] text-mute text-center mt-1.5">PNG with transparent background</p>
                )}
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
