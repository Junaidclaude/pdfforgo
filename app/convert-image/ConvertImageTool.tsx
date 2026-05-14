'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import AdSlot from '@/components/AdSlot'

type OutputFormat = 'jpg' | 'png' | 'webp'
type Rotation = 0 | 90 | 180 | 270
type Status = 'idle' | 'processing' | 'done' | 'error'

interface Result { name: string; url: string; blob: Blob; ext: OutputFormat }

export default function ConvertImageTool() {
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpg')
  const [rotation, setRotation] = useState<Rotation>(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const urlsRef = useRef<string[]>([])

  useEffect(() => () => { urlsRef.current.forEach(URL.revokeObjectURL) }, [])

  const transformOne = (file: File, fmt: OutputFormat, rot: Rotation, fH: boolean, fV: boolean): Promise<Result> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      const objUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objUrl)
        const iw = img.naturalWidth, ih = img.naturalHeight
        const rotated = rot === 90 || rot === 270
        const cw = rotated ? ih : iw
        const ch = rotated ? iw : ih

        const canvas = document.createElement('canvas')
        canvas.width = cw; canvas.height = ch
        const ctx = canvas.getContext('2d')!

        if (fmt === 'jpg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch) }

        ctx.save()
        ctx.translate(cw / 2, ch / 2)
        ctx.rotate((rot * Math.PI) / 180)
        if (fH) ctx.scale(-1, 1)
        if (fV) ctx.scale(1, -1)
        ctx.drawImage(img, -iw / 2, -ih / 2)
        ctx.restore()

        const mime = fmt === 'jpg' ? 'image/jpeg' : fmt === 'png' ? 'image/png' : 'image/webp'
        canvas.toBlob((blob) => {
          canvas.width = 0; canvas.height = 0
          if (!blob) { reject(new Error(`Failed: ${file.name}`)); return }
          const url = URL.createObjectURL(blob)
          urlsRef.current.push(url)
          resolve({ name: file.name, url, blob, ext: fmt })
        }, mime, 0.92)
      }
      img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error(`Cannot load ${file.name}`)) }
      img.src = objUrl
    })

  const process = useCallback(async (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith('image/'))
    if (!valid.length) { setError('Please upload image files.'); return }
    urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []
    setStatus('processing'); setError(''); setResults([]); setProgress(0)

    const out: Result[] = []
    for (let i = 0; i < valid.length; i++) {
      try { out.push(await transformOne(valid[i], outputFormat, rotation, flipH, flipV)) } catch (e) { console.error(e) }
      setProgress(Math.round(((i + 1) / valid.length) * 100))
    }
    setResults(out); setStatus(out.length ? 'done' : 'error')
    if (!out.length) setError('Could not process any of the provided files.')
  }, [outputFormat, rotation, flipH, flipV])

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
    for (const r of results) zip.file(`${r.name.replace(/\.[^.]+$/, '')}_converted.${r.ext}`, r.blob)
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'converted_images.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []
    setStatus('idle'); setResults([]); setError(''); setProgress(0)
  }

  const rotate = (dir: 'cw' | 'ccw') =>
    setRotation((r) => (((dir === 'cw' ? r + 90 : r - 90) % 360 + 360) % 360) as Rotation)

  const previewStyle: React.CSSProperties = {
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    transition: 'transform 0.2s ease',
    display: 'block',
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <AdSlot position="header" />

      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
        {/* Output format */}
        <div>
          <p className="font-syne font-bold text-dark text-sm mb-3">Output Format</p>
          <div className="flex gap-2">
            {(['jpg', 'png', 'webp'] as OutputFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setOutputFormat(f)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide border transition-all ${
                  outputFormat === f ? 'bg-pink-500 text-white border-pink-500' : 'text-gray-600 border-gray-200 hover:border-pink-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Rotate */}
        <div>
          <p className="font-syne font-bold text-dark text-sm mb-3">Rotate</p>
          <div className="flex gap-2">
            <button onClick={() => rotate('ccw')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-pink-300 text-sm font-medium transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
              90° CCW
            </button>
            <button onClick={() => setRotation(0)} className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${rotation === 0 ? 'bg-gray-100 text-dark border-gray-300' : 'text-gray-600 border-gray-200 hover:border-pink-300'}`}>
              {rotation}°
            </button>
            <button onClick={() => rotate('cw')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-pink-300 text-sm font-medium transition-all">
              90° CW
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15 21 9m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" /></svg>
            </button>
          </div>
        </div>

        {/* Flip */}
        <div>
          <p className="font-syne font-bold text-dark text-sm mb-3">Flip</p>
          <div className="flex gap-2">
            <button onClick={() => setFlipH((v) => !v)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${flipH ? 'bg-pink-50 border-pink-400 text-pink-600' : 'text-gray-600 border-gray-200 hover:border-pink-300'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
              Flip Horizontal
            </button>
            <button onClick={() => setFlipV((v) => !v)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${flipV ? 'bg-pink-50 border-pink-400 text-pink-600' : 'text-gray-600 border-gray-200 hover:border-pink-300'}`}>
              <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
              Flip Vertical
            </button>
          </div>
        </div>

        {/* Transform preview */}
        {(rotation !== 0 || flipH || flipV) && (
          <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center h-20 overflow-hidden">
            <span className="text-2xl" style={previewStyle}>🖼</span>
            <p className="text-xs text-gray-400 ml-3">Preview of transform</p>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
          dragging ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-white hover:border-pink-300'
        }`}
      >
        <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={onFileChange} disabled={status === 'processing'} />
        <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
        <p className="font-syne font-bold text-dark text-lg mb-1">Drop images here</p>
        <p className="text-gray-400 text-sm">JPG, PNG, WebP · Multiple files supported</p>
        <p className="text-gray-300 text-xs mt-3">Your files never leave your browser</p>
      </div>

      {status === 'processing' && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark">Processing images…</span>
            <span className="text-sm text-pink-500 font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4"><p className="text-red-700 text-sm">{error}</p></div>}

      {status === 'done' && results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="bg-pink-50 border-b border-pink-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <span className="font-syne font-bold text-dark">{results.length} image{results.length > 1 ? 's' : ''} converted</span>
            <div className="flex gap-2">
              {results.length > 1 && (
                <button onClick={downloadAll} className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">Download All ZIP</button>
              )}
              <button onClick={reset} className="bg-gray-100 hover:bg-gray-200 text-dark text-sm font-semibold px-4 py-2 rounded-xl transition-colors">New Files</button>
            </div>
          </div>

          <AdSlot position="pre_download" className="px-6 py-2" />

          <ul className="divide-y divide-gray-100">
            {results.map((r, i) => (
              <li key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark truncate">{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">→ .{r.ext.toUpperCase()}</p>
                </div>
                <a href={r.url} download={`${r.name.replace(/\.[^.]+$/, '')}_converted.${r.ext}`} className="shrink-0 text-pink-500 hover:text-pink-700 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
