'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'processing' | 'done' | 'error'

type PageSize = 'fit' | 'a4' | 'letter'
type Orientation = 'portrait' | 'landscape'
type MarginSize = 'none' | 'small' | 'medium' | 'large'

interface ImageItem {
  id: string
  file: File
  previewUrl: string
  name: string
}

const MARGIN_MAP: Record<MarginSize, number> = {
  none: 0,
  small: 18,    // 0.25 inch in points
  medium: 36,   // 0.5 inch
  large: 72,    // 1 inch
}

const PAGE_SIZE_MAP: Record<PageSize, [number, number] | null> = {
  fit: null,
  a4: [595.28, 841.89],
  letter: [612, 792],
}

export default function JpgToPdfTool() {
  const [items, setItems] = useState<ImageItem[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [outputSize, setOutputSize] = useState(0)

  const [pageSize, setPageSize] = useState<PageSize>('fit')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [margin, setMargin] = useState<MarginSize>('none')

  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const dragFromRef = useRef<number | null>(null)
  const downloadRef = useRef<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      if (downloadRef.current) URL.revokeObjectURL(downloadRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    )
    if (!arr.length) return
    const newItems: ImageItem[] = arr.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      name: f.name,
    }))
    setItems((prev) => [...prev, ...newItems])
    setStatus('idle')
    if (downloadRef.current) {
      URL.revokeObjectURL(downloadRef.current)
      downloadRef.current = ''
      setDownloadUrl('')
    }
  }, [])

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files)
      e.target.value = ''
    }
  }

  const onDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
  }

  // Drag-to-reorder
  const onDragStart = (index: number) => { dragFromRef.current = index }
  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    const from = dragFromRef.current
    if (from === null || from === index) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(index, 0, moved)
      dragFromRef.current = index
      return next
    })
  }

  const convert = async () => {
    if (!items.length) return
    setStatus('processing')
    setProgress(0)
    setErrorMsg('')

    try {
      const { PDFDocument } = await import('pdf-lib')
      const pdfDoc = await PDFDocument.create()
      const marginPt = MARGIN_MAP[margin]
      const fixedSize = PAGE_SIZE_MAP[pageSize]

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        setProgress(Math.round(((i + 1) / items.length) * 90))

        const arrayBuffer = await item.file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)

        let embeddedImage
        const type = item.file.type
        if (type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(bytes)
        } else {
          embeddedImage = await pdfDoc.embedJpg(bytes)
        }

        const imgW = embeddedImage.width
        const imgH = embeddedImage.height
        const isLandscapeImg = imgW > imgH

        let pageW: number
        let pageH: number

        if (fixedSize) {
          const [fw, fh] = fixedSize
          if (orientation === 'landscape' || (orientation === 'portrait' && isLandscapeImg && pageSize === 'fit')) {
            pageW = fh
            pageH = fw
          } else {
            pageW = fw
            pageH = fh
          }
        } else {
          // fit: page matches image dimensions
          if (orientation === 'landscape' && imgH > imgW) {
            pageW = imgH
            pageH = imgW
          } else if (orientation === 'portrait' && imgW > imgH) {
            pageW = imgH
            pageH = imgW
          } else {
            pageW = imgW
            pageH = imgH
          }
        }

        const page = pdfDoc.addPage([pageW, pageH])

        const drawW = pageW - marginPt * 2
        const drawH = pageH - marginPt * 2

        // Scale image to fit within draw area while preserving aspect ratio
        const scale = Math.min(drawW / imgW, drawH / imgH)
        const scaledW = imgW * scale
        const scaledH = imgH * scale
        const x = marginPt + (drawW - scaledW) / 2
        const y = marginPt + (drawH - scaledH) / 2

        page.drawImage(embeddedImage, { x, y, width: scaledW, height: scaledH })
      }

      setProgress(95)
      const pdfBytes = await pdfDoc.save()
      setProgress(100)

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      if (downloadRef.current) URL.revokeObjectURL(downloadRef.current)
      const url = URL.createObjectURL(blob)
      downloadRef.current = url
      setDownloadUrl(url)
      setOutputSize(pdfBytes.length)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Conversion failed. Please try again.')
      setStatus('error')
    }
  }

  const reset = () => {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    if (downloadRef.current) {
      URL.revokeObjectURL(downloadRef.current)
      downloadRef.current = ''
    }
    setItems([])
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
    setDownloadUrl('')
    setOutputSize(0)
  }

  const totalSizeKb = items.reduce((sum, i) => sum + i.file.size, 0) / 1024

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* AD_SLOT: header_banner */}
      <AdSlot position="header" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Main column ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Drop zone (always visible to add more) */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={onDropZoneDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-6 ${
              isDraggingOver
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFileInputChange}
            />
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            {items.length === 0 ? (
              <>
                <p className="font-syne font-bold text-dark text-lg mb-1">
                  Drop images here
                </p>
                <p className="text-gray-500 text-sm">
                  JPG, PNG, WebP, GIF, BMP · Click to browse · Multiple files OK
                </p>
              </>
            ) : (
              <p className="text-indigo-600 font-semibold text-sm">
                + Add more images
              </p>
            )}
          </div>

          {/* Image list */}
          {items.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <span className="font-syne font-bold text-dark text-sm">
                  {items.length} image{items.length !== 1 ? 's' : ''} · {totalSizeKb < 1024 ? `${totalSizeKb.toFixed(0)} KB` : `${(totalSizeKb / 1024).toFixed(1)} MB`}
                </span>
                <button
                  onClick={reset}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    className="relative group cursor-grab active:cursor-grabbing"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold rounded-md px-1.5 py-0.5">
                      {index + 1}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold hidden group-hover:flex items-center justify-center"
                    >
                      ×
                    </button>
                    <p className="text-[10px] text-gray-400 truncate mt-1 text-center">{item.name}</p>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-gray-400 pb-3">
                Drag to reorder · Pages will appear in this order
              </p>
            </div>
          )}

          {/* Progress bar */}
          {status === 'processing' && (
            <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-dark">Converting images…</span>
                <span className="text-sm text-indigo-500 font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Your files never leave your browser
              </p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 text-red-700 text-sm">
              <strong className="font-semibold">Error:</strong> {errorMsg}
            </div>
          )}

          {/* Done */}
          {status === 'done' && downloadUrl && (
            <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-syne font-bold text-dark">PDF ready!</p>
                  <p className="text-sm text-gray-500">
                    {items.length} page{items.length !== 1 ? 's' : ''} ·{' '}
                    {outputSize < 1024 * 1024
                      ? `${(outputSize / 1024).toFixed(0)} KB`
                      : `${(outputSize / (1024 * 1024)).toFixed(1)} MB`}
                  </p>
                </div>
              </div>

              {/* AD_SLOT: pre_download_interstitial */}
              <AdSlot position="pre_download" />

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <a
                  href={downloadUrl}
                  download="images-to-pdf.pdf"
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors"
                >
                  Download PDF
                </a>
                <button
                  onClick={reset}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Convert More
                </button>
              </div>
            </div>
          )}

          {/* Convert button */}
          {items.length > 0 && status !== 'processing' && status !== 'done' && (
            <button
              onClick={convert}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-syne font-bold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg"
            >
              Convert to PDF
            </button>
          )}

          {/* Privacy badge */}
          <p className="text-center text-xs text-gray-400 mt-4">
            🔒 Your files never leave your browser — 100% private
          </p>
        </div>

        {/* ── Sidebar ──────────────────────────────────── */}
        <div className="lg:w-72 flex-shrink-0 space-y-5">
          {/* Options panel */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-syne font-bold text-dark mb-4 text-base">PDF Options</h2>

            {/* Page size */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Page Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['fit', 'a4', 'letter'] as PageSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPageSize(s)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                      pageSize === s
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {s === 'fit' ? 'Fit Image' : s.toUpperCase()}
                  </button>
                ))}
              </div>
              {pageSize === 'fit' && (
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Each page matches the image dimensions exactly.
                </p>
              )}
            </div>

            {/* Orientation (only relevant for A4/Letter) */}
            {pageSize !== 'fit' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Orientation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['portrait', 'landscape'] as Orientation[]).map((o) => (
                    <button
                      key={o}
                      onClick={() => setOrientation(o)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                        orientation === o
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {o === 'portrait' ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 10 14" fill="currentColor"><rect x="1" y="1" width="8" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                      ) : (
                        <svg className="w-4 h-3" viewBox="0 0 14 10" fill="currentColor"><rect x="1" y="1" width="12" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                      )}
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Margin */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Margin
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([['none', 'None'], ['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']] as [MarginSize, string][]).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => setMargin(m)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                      margin === m
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-sm">
            <p className="font-syne font-bold text-dark mb-2 text-sm">Tips</p>
            <ul className="space-y-1.5 text-gray-600 text-xs leading-relaxed">
              <li>• Drag images in the grid to reorder pages</li>
              <li>• Use &quot;Fit Image&quot; to preserve original dimensions</li>
              <li>• A4 / Letter are standard document sizes</li>
              <li>• PNG images preserve transparency (shown as white)</li>
            </ul>
          </div>

          {/* AD_SLOT: sidebar_right */}
          <AdSlot position="sidebar" />
        </div>
      </div>
    </div>
  )
}
