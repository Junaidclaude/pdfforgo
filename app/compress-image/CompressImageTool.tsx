'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import AdSlot from '@/components/AdSlot'

type OutputFormat = 'original' | 'jpg' | 'webp'
type Status = 'idle' | 'processing' | 'done' | 'error'

interface Result {
  name: string
  originalSize: number
  compressedSize: number
  url: string
  blob: Blob
  ext: string
}

const fmt = (b: number) =>
  b >= 1_048_576 ? (b / 1_048_576).toFixed(2) + ' MB' : (b / 1024).toFixed(1) + ' KB'

export default function CompressImageTool() {
  const [quality, setQuality] = useState(80)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('original')
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const urlsRef = useRef<string[]>([])

  useEffect(() => () => { urlsRef.current.forEach(URL.revokeObjectURL) }, [])

  const compressOne = (file: File, fmt: OutputFormat, q: number): Promise<Result> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      const objUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objUrl)
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!
        if (fmt === 'jpg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height) }
        ctx.drawImage(img, 0, 0)

        const mime =
          fmt === 'jpg' ? 'image/jpeg'
          : fmt === 'webp' ? 'image/webp'
          : file.type === 'image/png' ? 'image/png'
          : 'image/jpeg'
        const qVal = mime === 'image/png' ? undefined : q / 100
        const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png'

        canvas.toBlob((blob) => {
          canvas.width = 0; canvas.height = 0
          if (!blob) { reject(new Error(`Failed to compress ${file.name}`)); return }
          const url = URL.createObjectURL(blob)
          urlsRef.current.push(url)
          resolve({ name: file.name, originalSize: file.size, compressedSize: blob.size, url, blob, ext })
        }, mime, qVal)
      }
      img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error(`Cannot load ${file.name}`)) }
      img.src = objUrl
    })

  const process = useCallback(async (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith('image/'))
    if (!valid.length) { setError('Please upload image files (JPG, PNG, WebP, GIF).'); return }
    urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []
    setStatus('processing'); setError(''); setResults([]); setProgress(0)

    const out: Result[] = []
    for (let i = 0; i < valid.length; i++) {
      try {
        out.push(await compressOne(valid[i], outputFormat, quality))
      } catch (e) { console.error(e) }
      setProgress(Math.round(((i + 1) / valid.length) * 100))
    }
    setResults(out)
    setStatus(out.length ? 'done' : 'error')
    if (!out.length) setError('Could not compress any of the provided files.')
  }, [outputFormat, quality])

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
      zip.file(`${r.name.replace(/\.[^.]+$/, '')}_compressed.${r.ext}`, r.blob)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'compressed_images.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []
    setStatus('idle'); setResults([]); setError(''); setProgress(0)
  }

  const totalOrig = results.reduce((s, r) => s + r.originalSize, 0)
  const totalComp = results.reduce((s, r) => s + r.compressedSize, 0)
  const totalSaved = totalOrig > 0 ? Math.round(((totalOrig - totalComp) / totalOrig) * 100) : 0

  return (
    <section className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <AdSlot position="header" />

      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
        <div>
          <p className="font-syne font-bold text-dark text-sm mb-3">Output Format</p>
          <div className="flex gap-2">
            {(['original', 'jpg', 'webp'] as OutputFormat[]).map((v) => (
              <button
                key={v}
                onClick={() => setOutputFormat(v)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                  outputFormat === v ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {v === 'original' ? 'Keep Original' : v === 'jpg' ? 'Convert to JPG' : 'Convert to WebP'}
              </button>
            ))}
          </div>
          {outputFormat === 'original' && (
            <p className="text-xs text-gray-400 mt-1.5">PNG is lossless — quality slider has no effect on PNG files.</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-syne font-bold text-dark text-sm">Quality</p>
            <span className="text-blue-500 font-bold text-sm">{quality}%</span>
          </div>
          <input
            type="range" min={10} max={100} step={1}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Smaller file</span><span>Better quality</span>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
          dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
        }`}
      >
        <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={onFileChange} disabled={status === 'processing'} />
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
            <span className="text-sm font-medium text-dark">Compressing images…</span>
            <span className="text-sm text-blue-500 font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4"><p className="text-red-700 text-sm">{error}</p></div>}

      {status === 'done' && results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-syne font-bold text-dark">{results.length} image{results.length > 1 ? 's' : ''} compressed</span>
              {totalSaved > 0 && (
                <span className="ml-2 text-green-600 text-sm font-medium">— {fmt(totalOrig - totalComp)} saved ({totalSaved}%)</span>
              )}
            </div>
            <div className="flex gap-2">
              {results.length > 1 && (
                <button onClick={downloadAll} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Download All ZIP
                </button>
              )}
              <button onClick={reset} className="bg-gray-100 hover:bg-gray-200 text-dark text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                New Files
              </button>
            </div>
          </div>

          <AdSlot position="pre_download" className="px-6 py-2" />

          <ul className="divide-y divide-gray-100">
            {results.map((r, i) => {
              const saved = r.originalSize - r.compressedSize
              const pct = Math.round((saved / r.originalSize) * 100)
              return (
                <li key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark truncate">{r.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {fmt(r.originalSize)} → <span className={pct > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}>{fmt(r.compressedSize)}</span>
                      {pct > 0 && <span className="ml-1 text-green-600">({pct}% smaller)</span>}
                      {pct <= 0 && <span className="ml-1 text-amber-500">(no reduction)</span>}
                    </p>
                  </div>
                  <a href={r.url} download={`${r.name.replace(/\.[^.]+$/, '')}_compressed.${r.ext}`} className="shrink-0 text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
