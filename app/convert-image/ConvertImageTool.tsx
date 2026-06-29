'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import AdSlot from '@/components/AdSlot'

type OutputFormat = 'jpg' | 'png' | 'webp'
type Rotation = 0 | 90 | 180 | 270
type Status = 'idle' | 'processing' | 'done' | 'error'

interface Result { name: string; url: string; blob: Blob; ext: OutputFormat }

const FILTERS: { label: string; value: string; css: string }[] = [
  { label: 'None',      value: 'none',       css: '' },
  { label: 'Grayscale', value: 'grayscale',  css: 'grayscale(100%)' },
  { label: 'Sepia',     value: 'sepia',      css: 'sepia(100%)' },
  { label: 'Vivid',     value: 'vivid',      css: 'saturate(1.8) contrast(1.1)' },
  { label: 'Warm',      value: 'warm',       css: 'sepia(35%) saturate(1.4) brightness(1.05)' },
  { label: 'Cool',      value: 'cool',       css: 'hue-rotate(180deg) saturate(1.2)' },
  { label: 'Bright',    value: 'bright',     css: 'brightness(1.35) contrast(1.05)' },
  { label: 'Vintage',   value: 'vintage',    css: 'sepia(60%) contrast(1.1) brightness(1.1) saturate(0.8)' },
]

export default function ConvertImageTool() {
  const [files,        setFiles]        = useState<File[]>([])
  const [previewUrl,   setPreviewUrl]   = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpg')
  const [rotation,     setRotation]     = useState<Rotation>(0)
  const [flipH,        setFlipH]        = useState(false)
  const [flipV,        setFlipV]        = useState(false)
  const [filter,       setFilter]       = useState('none')
  const [status,       setStatus]       = useState<Status>('idle')
  const [progress,     setProgress]     = useState(0)
  const [results,      setResults]      = useState<Result[]>([])
  const [dragging,     setDragging]     = useState(false)
  const [error,        setError]        = useState('')

  const urlsRef   = useRef<string[]>([])
  const inputRef  = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string | null>(null)

  useEffect(() => () => {
    urlsRef.current.forEach(URL.revokeObjectURL)
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  const loadFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(f => f.type.startsWith('image/'))
    if (!valid.length) { setError('Please upload image files.'); return }
    setError('')
    if (previewRef.current) { URL.revokeObjectURL(previewRef.current); previewRef.current = null }
    const url = URL.createObjectURL(valid[0])
    previewRef.current = url
    setFiles(valid)
    setPreviewUrl(url)
    setStatus('idle')
    setResults([])
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    loadFiles(Array.from(e.dataTransfer.files))
  }, [loadFiles])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) loadFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const filterCss = FILTERS.find(f => f.value === filter)?.css ?? ''

  const transformOne = (file: File): Promise<Result> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      const objUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objUrl)
        const iw = img.naturalWidth, ih = img.naturalHeight
        const rotated = rotation === 90 || rotation === 270
        const cw = rotated ? ih : iw
        const ch = rotated ? iw : ih

        const canvas = document.createElement('canvas')
        canvas.width = cw; canvas.height = ch
        const ctx = canvas.getContext('2d')!

        if (outputFormat === 'jpg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch) }

        ctx.save()
        ctx.translate(cw / 2, ch / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        if (flipH) ctx.scale(-1, 1)
        if (flipV) ctx.scale(1, -1)
        if (filterCss) ctx.filter = filterCss
        ctx.drawImage(img, -iw / 2, -ih / 2)
        ctx.restore()

        const mime = outputFormat === 'jpg' ? 'image/jpeg' : outputFormat === 'png' ? 'image/png' : 'image/webp'
        canvas.toBlob((blob) => {
          canvas.width = 0; canvas.height = 0
          if (!blob) { reject(new Error(`Failed: ${file.name}`)); return }
          const url = URL.createObjectURL(blob)
          urlsRef.current.push(url)
          resolve({ name: file.name, url, blob, ext: outputFormat })
        }, mime, 0.92)
      }
      img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error(`Cannot load ${file.name}`)) }
      img.src = objUrl
    })

  const convert = useCallback(async () => {
    if (!files.length) return
    urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []
    setStatus('processing'); setError(''); setResults([]); setProgress(0)

    const out: Result[] = []
    for (let i = 0; i < files.length; i++) {
      try { out.push(await transformOne(files[i])) } catch (e) { console.error(e) }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }
    setResults(out); setStatus(out.length ? 'done' : 'error')
    if (!out.length) setError('Could not process any of the provided files.')
  }, [files, outputFormat, rotation, flipH, flipV, filterCss]) // eslint-disable-line react-hooks/exhaustive-deps

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    for (const r of results) zip.file(`${r.name.replace(/\.[^.]+$/, '')}_converted.${r.ext}`, r.blob)
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'converted_images.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []
    if (previewRef.current) { URL.revokeObjectURL(previewRef.current); previewRef.current = null }
    setFiles([]); setPreviewUrl(null); setStatus('idle'); setResults([]); setError(''); setProgress(0)
    setRotation(0); setFlipH(false); setFlipV(false); setFilter('none')
  }

  const rotate = (dir: 'cw' | 'ccw') =>
    setRotation(r => (((dir === 'cw' ? r + 90 : r - 90) % 360 + 360) % 360) as Rotation)

  // ── Preview CSS transform
  const previewTransform = `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`

  // ─────────────────────────────────────────────────────────────────────────
  // IDLE — Upload screen
  // ─────────────────────────────────────────────────────────────────────────
  if (!previewUrl) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <AdSlot position="header" />

        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-14 text-center transition-colors cursor-pointer select-none
            ${dragging ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-white hover:border-pink-300'}`}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
          <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <p className="font-syne font-bold text-dark text-lg mb-1">Drop images here</p>
          <p className="text-gray-400 text-sm">JPG, PNG, WebP · Multiple files supported</p>
          <p className="text-gray-300 text-xs mt-3">Your files never leave your browser</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4"><p className="text-red-700 text-sm">{error}</p></div>}
      </section>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EDITOR — Live preview + controls
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── LEFT: Live preview ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-syne font-bold text-dark text-sm">Preview</span>
              {files.length > 1 && (
                <span className="text-xs bg-pink-100 text-pink-600 font-semibold px-2 py-0.5 rounded-full">
                  +{files.length - 1} more file{files.length > 2 ? 's' : ''}
                </span>
              )}
            </div>
            {/* Change image button */}
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-pink-600 border border-gray-200 hover:border-pink-300 rounded-lg px-3 py-1.5 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Change Image
            </button>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
          </div>

          {/* Image preview with live transform */}
          <div className="p-6 flex items-center justify-center bg-[repeating-conic-gradient(#f0f0f0_0%_25%,#ffffff_0%_50%)_0_0/20px_20px] min-h-[320px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="preview"
              className="max-w-full max-h-[480px] object-contain rounded shadow-sm"
              style={{
                transform: previewTransform,
                filter: filterCss || undefined,
                transition: 'transform 0.25s ease, filter 0.2s ease',
              }}
            />
          </div>

          {/* File name */}
          <div className="px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400 truncate">
            {files[0]?.name}{files.length > 1 ? ` and ${files.length - 1} other${files.length > 2 ? 's' : ''}` : ''}
          </div>
        </div>

        {/* ── RIGHT: Controls ── */}
        <div className="space-y-4">

          {/* Output format */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="font-syne font-bold text-dark text-xs uppercase tracking-widest mb-3">Output Format</p>
            <div className="flex gap-2">
              {(['jpg', 'png', 'webp'] as OutputFormat[]).map(f => (
                <button key={f} onClick={() => setOutputFormat(f)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide border transition-all ${
                    outputFormat === f ? 'bg-pink-500 text-white border-pink-500' : 'text-gray-600 border-gray-200 hover:border-pink-300'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Rotate & Flip */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="font-syne font-bold text-dark text-xs uppercase tracking-widest">Rotate & Flip</p>
            <div className="flex gap-2">
              <button onClick={() => rotate('ccw')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-pink-300 text-sm font-medium transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                CCW
              </button>
              <button onClick={() => setRotation(0)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all min-w-[56px] ${rotation !== 0 ? 'bg-pink-50 text-pink-600 border-pink-200' : 'text-gray-400 border-gray-200'}`}>
                {rotation}°
              </button>
              <button onClick={() => rotate('cw')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-pink-300 text-sm font-medium transition-all">
                CW
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15 21 9m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" /></svg>
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFlipH(v => !v)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${flipH ? 'bg-pink-50 text-pink-600 border-pink-300' : 'text-gray-500 border-gray-200 hover:border-pink-200'}`}>
                ↔ Flip H
              </button>
              <button onClick={() => setFlipV(v => !v)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${flipV ? 'bg-pink-50 text-pink-600 border-pink-300' : 'text-gray-500 border-gray-200 hover:border-pink-200'}`}>
                ↕ Flip V
              </button>
              <button onClick={() => { setRotation(0); setFlipH(false); setFlipV(false) }}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all">
                Reset
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="font-syne font-bold text-dark text-xs uppercase tracking-widest mb-3">Filter</p>
            <div className="grid grid-cols-3 gap-2">
              {FILTERS.map(f => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className={`flex flex-col gap-1.5 rounded-xl p-1.5 border-2 transition-all ${
                    filter === f.value ? 'border-pink-500' : 'border-transparent hover:border-gray-200'
                  }`}>
                  <div className="rounded-lg overflow-hidden aspect-square bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl!} alt={f.label}
                      className="w-full h-full object-cover"
                      style={{ filter: f.css || 'none' }}
                      draggable={false} />
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-none ${filter === f.value ? 'text-pink-600' : 'text-gray-400'}`}>
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Convert button */}
          <button
            onClick={convert}
            disabled={status === 'processing'}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {status === 'processing' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Converting… {progress}%
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Convert & Download
              </>
            )}
          </button>

          <button onClick={reset} className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors">
            Start over
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {status === 'done' && results.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-pink-50 border-b border-pink-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <span className="font-syne font-bold text-dark">{results.length} image{results.length > 1 ? 's' : ''} converted ✓</span>
            <div className="flex gap-2">
              {results.length > 1 && (
                <button onClick={downloadAll} className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Download All ZIP
                </button>
              )}
            </div>
          </div>

          <AdSlot position="pre_download" className="px-6 py-2" />

          <ul className="divide-y divide-gray-100">
            {results.map((r, i) => (
              <li key={i} className="px-6 py-4 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt={r.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark truncate">{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    → .{r.ext.toUpperCase()}
                    {filter !== 'none' && ` · ${FILTERS.find(f => f.value === filter)?.label} filter`}
                    {rotation !== 0 && ` · ${rotation}° rotated`}
                  </p>
                </div>
                <a href={r.url} download={`${r.name.replace(/\.[^.]+$/, '')}_converted.${r.ext}`}
                  className="shrink-0 text-pink-500 hover:text-pink-700 text-sm font-semibold flex items-center gap-1.5 border border-pink-200 hover:border-pink-400 rounded-xl px-3 py-2 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4"><p className="text-red-700 text-sm">{error}</p></div>}
    </section>
  )
}
