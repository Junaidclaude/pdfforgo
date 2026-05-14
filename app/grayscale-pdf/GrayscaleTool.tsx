'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'

type Status = 'idle' | 'processing' | 'done' | 'error'

export default function GrayscaleTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [outputSize, setOutputSize] = useState(0)
  const [originalSize, setOriginalSize] = useState(0)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }
  }, [])

  const reset = () => {
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null }
    setOutputUrl(null); setStatus('idle'); setProgress(0)
    setError(''); setFileName(''); setOriginalSize(0); setOutputSize(0)
  }

  const process = useCallback(async (file: File) => {
    setFileName(file.name)
    setOriginalSize(file.size)
    setStatus('processing')
    setProgress(0)
    setError('')

    try {
      const pdfjs = await getPdfjs()
      const { PDFDocument } = await import('pdf-lib')

      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
      const numPages = pdfDoc.numPages
      const newDoc = await PDFDocument.create()

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport1x = page.getViewport({ scale: 1.0 })
        const viewport2x = page.getViewport({ scale: 2.0 })

        const canvas = document.createElement('canvas')
        canvas.width = Math.round(viewport2x.width)
        canvas.height = Math.round(viewport2x.height)
        const ctx = canvas.getContext('2d')!

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        await page.render({ canvasContext: ctx, viewport: viewport2x }).promise

        // Luminance-weighted grayscale conversion
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const d = imgData.data
        for (let p = 0; p < d.length; p += 4) {
          const g = Math.round(0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2])
          d[p] = d[p + 1] = d[p + 2] = g
        }
        ctx.putImageData(imgData, 0, 0)

        const jpegBytes = await new Promise<Uint8Array>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error('Canvas export failed')); return }
              blob.arrayBuffer().then((ab) => resolve(new Uint8Array(ab))).catch(reject)
            },
            'image/jpeg',
            0.92
          )
        })

        canvas.width = 0; canvas.height = 0

        const img = await newDoc.embedJpg(jpegBytes)
        const w = viewport1x.width
        const h = viewport1x.height
        const newPage = newDoc.addPage([w, h])
        newPage.drawImage(img, { x: 0, y: 0, width: w, height: h })

        setProgress(Math.round((i / numPages) * 100))
      }

      const outBytes = await newDoc.save()
      const blob = new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' })
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = URL.createObjectURL(blob)
      setOutputUrl(urlRef.current)
      setOutputSize(outBytes.length)
      setStatus('done')
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Failed to convert PDF to grayscale.')
      setStatus('error')
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') process(file)
  }, [process])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) process(file)
    e.target.value = ''
  }

  const outName = fileName.replace(/\.pdf$/i, '') + '_grayscale.pdf'
  const savedBytes = originalSize - outputSize
  const savedPct = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0

  if (status === 'done' && outputUrl) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-syne font-extrabold text-dark text-xl mb-1">Conversion Complete</h2>
          <p className="text-gray-500 text-sm mb-1">
            {(outputSize / 1024 / 1024).toFixed(2)} MB
            {savedBytes > 0 && (
              <span className="ml-2 text-green-600 font-medium">({savedPct}% smaller)</span>
            )}
          </p>
          <AdSlot position="pre_download" className="my-4" />
          <a
            href={outputUrl}
            download={outName}
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-syne font-bold px-8 py-3 rounded-xl transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Grayscale PDF
          </a>
          <div>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors">
              Convert another file
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
          dragging ? 'border-gray-500 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          accept="application/pdf"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          onChange={onFileChange}
          disabled={status === 'processing'}
        />
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="font-syne font-bold text-dark text-lg mb-1">Drop your PDF here</p>
        <p className="text-gray-400 text-sm">or click to browse</p>
        <p className="text-gray-300 text-xs mt-3">Your file never leaves your browser</p>
      </div>

      {status === 'processing' && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark truncate max-w-[200px]">{fileName}</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-700 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Converting pages to grayscale…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <p className="text-red-700 font-medium text-sm">{error}</p>
          <button onClick={reset} className="mt-3 text-sm text-red-500 underline hover:text-red-700">
            Try again
          </button>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
        <h3 className="font-syne font-bold text-dark text-sm mb-2">About Grayscale Conversion</h3>
        <ul className="text-gray-600 text-sm space-y-1">
          <li>• Uses luminance-weighted formula (ITU-R BT.601) for natural-looking results</li>
          <li>• Each page is rendered at 144 DPI before grayscale conversion</li>
          <li>• Color PDFs typically shrink 30–60% after grayscale conversion</li>
          <li>• Ideal for print, archiving, and accessibility compliance</li>
        </ul>
      </div>
    </section>
  )
}
