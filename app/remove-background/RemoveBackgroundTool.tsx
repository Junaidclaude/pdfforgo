'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'loading-model' | 'processing' | 'done' | 'error'

interface Result {
  name: string
  originalUrl: string
  resultUrl: string
  blob: Blob
  w: number
  h: number
}

const fmt = (b: number) =>
  b >= 1_048_576 ? (b / 1_048_576).toFixed(2) + ' MB' : (b / 1024).toFixed(1) + ' KB'

export default function RemoveBackgroundTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState<string>('transparent')
  const [activeResult, setActiveResult] = useState(0)
  const urlsRef = useRef<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => { urlsRef.current.forEach(URL.revokeObjectURL) }, [])

  const processFiles = useCallback(async (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/') && !f.type.includes('gif'))
    if (!valid.length) { setError('Please upload JPG, PNG, or WebP images.'); return }

    setStatus('loading-model')
    setError('')
    setResults([])
    setProgress(0)
    setActiveResult(0)

    // Show first image preview immediately
    const firstUrl = URL.createObjectURL(valid[0])
    urlsRef.current.push(firstUrl)
    setPreview(firstUrl)

    try {
      const { removeBackground } = await import('@imgly/background-removal')
      setStatus('processing')

      const out: Result[] = []
      for (let i = 0; i < valid.length; i++) {
        const file = valid[i]

        // Get original dimensions
        const origUrl = URL.createObjectURL(file)
        urlsRef.current.push(origUrl)
        const dims = await new Promise<{ w: number; h: number }>((res) => {
          const img = new Image()
          img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight })
          img.src = origUrl
        })

        const blob = await removeBackground(file, {
          publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/',
          progress: (key, current, total) => {
            const fileBase = (i / valid.length) * 100
            const fileChunk = (1 / valid.length) * 100
            const modelProgress = total > 0 ? (current / total) * fileChunk : 0
            setProgress(Math.round(fileBase + modelProgress))
          },
        })

        const resultUrl = URL.createObjectURL(blob)
        urlsRef.current.push(resultUrl)
        out.push({ name: file.name, originalUrl: origUrl, resultUrl, blob, ...dims })
        setProgress(Math.round(((i + 1) / valid.length) * 100))
      }

      setResults(out)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setError('Background removal failed. Please try a different image.')
      setStatus('error')
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
  }, [processFiles])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const download = async (result: Result) => {
    if (bgColor === 'transparent') {
      const a = document.createElement('a')
      a.href = result.resultUrl
      a.download = result.name.replace(/\.[^.]+$/, '') + '-no-bg.png'
      a.click()
      return
    }

    // Composite result onto chosen background colour
    const canvas = document.createElement('canvas')
    canvas.width = result.w
    canvas.height = result.h
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, result.w, result.h)
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.name.replace(/\.[^.]+$/, '') + '-no-bg.png'
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      }, 'image/png')
    }
    img.src = result.resultUrl
  }

  const reset = () => {
    urlsRef.current.forEach(URL.revokeObjectURL)
    urlsRef.current = []
    setStatus('idle')
    setResults([])
    setPreview(null)
    setError('')
    setProgress(0)
    setActiveResult(0)
  }

  const active = results[activeResult]

  // ── Idle / upload state ──────────────────────────────────────────────────
  if (status === 'idle' || status === 'error') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-14 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all select-none
            ${dragging ? 'border-green-400 bg-green-50 scale-[1.01]' : 'border-line hover:border-green-400 hover:bg-green-50/40 bg-white'}`}
        >
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onFileChange} />

          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="m21 15-5-5L5 21"/>
              <path d="M3 3l18 18" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-0"/>
            </svg>
          </div>

          <div className="text-center">
            <p className="font-display font-bold text-ink text-lg">Drop images here</p>
            <p className="text-mute text-sm mt-1">or click to browse · JPG, PNG, WebP · Batch supported</p>
          </div>

          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-2 text-xs text-green-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            100% private — AI runs in your browser, no uploads
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <AdSlot position="footer" />
      </div>
    )
  }

  // ── Loading / Processing state ───────────────────────────────────────────
  if (status === 'loading-model' || status === 'processing') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center gap-6">
        {preview && (
          <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-line shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-500 animate-spin" />
            </div>
          </div>
        )}
        <div className="text-center">
          <p className="font-display font-bold text-ink text-lg">
            {status === 'loading-model' ? 'Loading AI model…' : 'Removing background…'}
          </p>
          <p className="text-mute text-sm mt-1">
            {status === 'loading-model'
              ? 'Downloading the AI model once — cached for future use'
              : `${progress}% complete`}
          </p>
        </div>

        {status === 'processing' && (
          <div className="w-64 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {status === 'loading-model' && (
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Done state ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Thumbnail strip for batch */}
      {results.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {results.map((r, i) => (
            <button key={i} onClick={() => setActiveResult(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeResult ? 'border-green-500 shadow-md' : 'border-line hover:border-green-300'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.resultUrl} alt={r.name} className="w-full h-full object-cover" style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 12px 12px' }} />
            </button>
          ))}
        </div>
      )}

      {active && (
        <>
          {/* Before / After comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-line rounded-2xl overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-widest text-mute px-4 py-2.5 border-b border-line">Original</p>
              <div className="p-4 flex items-center justify-center min-h-[280px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={active.originalUrl} alt="original" className="max-w-full max-h-64 rounded-xl object-contain shadow-sm" />
              </div>
            </div>

            <div className="bg-white border border-green-200 rounded-2xl overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-widest text-green-600 px-4 py-2.5 border-b border-green-100">Background Removed</p>
              <div
                className="p-4 flex items-center justify-center min-h-[280px] rounded-b-2xl"
                style={{ background: bgColor === 'transparent' ? 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 16px 16px' : bgColor }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={active.resultUrl} alt="result" className="max-w-full max-h-64 rounded-xl object-contain" />
              </div>
            </div>
          </div>

          {/* Background colour picker */}
          <div className="bg-white border border-line rounded-2xl p-5 mb-5">
            <p className="text-sm font-semibold text-ink mb-3">Background colour</p>
            <div className="flex flex-wrap gap-2 items-center">
              {[
                { label: 'Transparent', value: 'transparent' },
                { label: 'White', value: '#ffffff' },
                { label: 'Black', value: '#000000' },
                { label: 'Red', value: '#ef4444' },
                { label: 'Blue', value: '#3b82f6' },
                { label: 'Green', value: '#22c55e' },
                { label: 'Yellow', value: '#facc15' },
              ].map(c => (
                <button key={c.value} onClick={() => setBgColor(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${bgColor === c.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-line text-mute hover:border-gray-300'}`}
                  style={c.value !== 'transparent' ? { background: c.value === bgColor ? undefined : c.value + '18' } : {}}>
                  {c.value === 'transparent' && <span className="inline-block w-3 h-3 mr-1.5 rounded-sm" style={{ background: 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px' }} />}
                  {c.label}
                </button>
              ))}
              <div className="flex items-center gap-2 ml-1">
                <label className="text-xs text-mute font-medium">Custom:</label>
                <input type="color" value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => download(active)}
              className="btn-royal flex items-center gap-2 px-6 py-3 rounded-xl font-semibold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PNG
            </button>

            {results.length > 1 && (
              <button onClick={async () => {
                const JSZip = (await import('jszip')).default
                const zip = new JSZip()
                for (const r of results) {
                  const resp = await fetch(r.resultUrl)
                  const blob = await resp.blob()
                  zip.file(r.name.replace(/\.[^.]+$/, '') + '-no-bg.png', blob)
                }
                const blob = await zip.generateAsync({ type: 'blob' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url; a.download = 'removed-backgrounds.zip'; a.click()
                setTimeout(() => URL.revokeObjectURL(url), 5000)
              }}
                className="btn-ghost flex items-center gap-2 px-6 py-3 rounded-xl font-semibold">
                Download All (.zip)
              </button>
            )}

            <button onClick={reset}
              className="px-6 py-3 rounded-xl border border-line text-mute hover:text-ink hover:border-gray-300 font-semibold text-sm transition-colors">
              Remove Another
            </button>
          </div>

          <p className="text-xs text-mute mt-3">
            {active.w} × {active.h}px · Output: PNG with{bgColor === 'transparent' ? ' transparent background' : ` ${bgColor} background`}
          </p>
        </>
      )}

      <div className="mt-8"><AdSlot position="footer" /></div>
    </div>
  )
}
