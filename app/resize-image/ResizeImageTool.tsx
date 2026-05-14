'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import AdSlot from '@/components/AdSlot'

type Mode = 'pixels' | 'percent'
type Status = 'idle' | 'processing' | 'done' | 'error'

interface Result { name: string; url: string; blob: Blob; w: number; h: number; ext: string }

export default function ResizeImageTool() {
  const [mode, setMode] = useState<Mode>('pixels')
  const [targetW, setTargetW] = useState<string>('800')
  const [targetH, setTargetH] = useState<string>('600')
  const [percent, setPercent] = useState<string>('50')
  const [lockAspect, setLockAspect] = useState(true)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const urlsRef = useRef<string[]>([])

  useEffect(() => () => { urlsRef.current.forEach(URL.revokeObjectURL) }, [])

  const resizeOne = (file: File): Promise<Result> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      const objUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objUrl)
        const nw = img.naturalWidth, nh = img.naturalHeight
        let dw: number, dh: number

        if (mode === 'percent') {
          const p = Math.max(1, Math.min(1000, Number(percent) || 50)) / 100
          dw = Math.round(nw * p); dh = Math.round(nh * p)
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
        ctx.drawImage(img, 0, 0, dw, dh)

        const mime = file.type === 'image/png' ? 'image/png' : file.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
        const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png'

        canvas.toBlob((blob) => {
          canvas.width = 0; canvas.height = 0
          if (!blob) { reject(new Error(`Failed: ${file.name}`)); return }
          const url = URL.createObjectURL(blob)
          urlsRef.current.push(url)
          resolve({ name: file.name, url, blob, w: dw, h: dh, ext })
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
      try { out.push(await resizeOne(valid[i])) } catch (e) { console.error(e) }
      setProgress(Math.round(((i + 1) / valid.length) * 100))
    }
    setResults(out); setStatus(out.length ? 'done' : 'error')
    if (!out.length) setError('Could not resize any of the provided files.')
  }, [mode, targetW, targetH, percent, lockAspect])

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
    for (const r of results) zip.file(`${r.name.replace(/\.[^.]+$/, '')}_resized.${r.ext}`, r.blob)
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'resized_images.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []
    setStatus('idle'); setResults([]); setError(''); setProgress(0)
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <AdSlot position="header" />

      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
        {/* Mode */}
        <div className="flex gap-2">
          {(['pixels', 'percent'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                mode === m ? 'bg-violet-500 text-white border-violet-500' : 'text-gray-600 border-gray-200 hover:border-violet-300'
              }`}
            >
              {m === 'pixels' ? 'By Pixels' : 'By Percentage'}
            </button>
          ))}
        </div>

        {mode === 'pixels' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 font-medium block mb-1">Width (px)</label>
                <input
                  type="number" min={1} max={9999}
                  value={targetW}
                  onChange={(e) => setTargetW(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
              <button
                onClick={() => setLockAspect((v) => !v)}
                className={`mt-5 p-2.5 rounded-xl border transition-colors ${lockAspect ? 'bg-violet-50 border-violet-300 text-violet-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
              >
                {lockAspect ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 0 1 4.5-4.5 4.5 4.5 0 0 1 4.5 4.5v3.75m-9 0H3.75A2.25 2.25 0 0 0 1.5 12.75v6.75A2.25 2.25 0 0 0 3.75 21.75H16.5a2.25 2.25 0 0 0 2.25-2.25V12.75a2.25 2.25 0 0 0-2.25-2.25H13.5Z" /></svg>
                )}
              </button>
              <div className="flex-1">
                <label className="text-xs text-gray-500 font-medium block mb-1">Height (px)</label>
                <input
                  type="number" min={1} max={9999}
                  value={lockAspect ? 'auto' : targetH}
                  onChange={(e) => setTargetH(e.target.value)}
                  disabled={lockAspect}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {lockAspect && <p className="text-xs text-gray-400">Height is calculated automatically from each image&apos;s aspect ratio.</p>}
          </div>
        )}

        {mode === 'percent' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-syne font-bold text-dark text-sm">Scale</p>
              <span className="text-violet-500 font-bold text-sm">{percent}%</span>
            </div>
            <input
              type="range" min={1} max={200} step={1}
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1%</span><span>200%</span></div>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
          dragging ? 'border-violet-400 bg-violet-50' : 'border-gray-200 bg-white hover:border-violet-300'
        }`}
      >
        <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={onFileChange} disabled={status === 'processing'} />
        <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </div>
        <p className="font-syne font-bold text-dark text-lg mb-1">Drop images here</p>
        <p className="text-gray-400 text-sm">JPG, PNG, WebP · Multiple files supported</p>
        <p className="text-gray-300 text-xs mt-3">Your files never leave your browser</p>
      </div>

      {status === 'processing' && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark">Resizing images…</span>
            <span className="text-sm text-violet-500 font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4"><p className="text-red-700 text-sm">{error}</p></div>}

      {status === 'done' && results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="bg-violet-50 border-b border-violet-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <span className="font-syne font-bold text-dark">{results.length} image{results.length > 1 ? 's' : ''} resized</span>
            <div className="flex gap-2">
              {results.length > 1 && (
                <button onClick={downloadAll} className="bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">Download All ZIP</button>
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
                  <p className="text-xs text-gray-400 mt-0.5">{r.w} × {r.h} px</p>
                </div>
                <a href={r.url} download={`${r.name.replace(/\.[^.]+$/, '')}_resized.${r.ext}`} className="shrink-0 text-violet-500 hover:text-violet-700 text-sm font-medium flex items-center gap-1">
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
