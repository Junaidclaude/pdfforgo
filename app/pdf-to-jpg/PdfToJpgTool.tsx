'use client'

import { useState, useRef, useCallback, useEffect, DragEvent } from 'react'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'

type Status = 'idle' | 'loading' | 'ready' | 'converting' | 'done' | 'error'
type ImageFormat = 'jpg' | 'png'
type DpiPreset = 'screen' | 'standard' | 'high'

interface ConvertedImage {
  pageNum: number
  name: string
  blob: Blob
  url: string
  size: number
}

const DPI_OPTIONS: {
  id: DpiPreset
  label: string
  sub: string
  scale: number
  jpegQuality: number
}[] = [
  {
    id: 'screen',
    label: 'Web / Email',
    sub: '72 DPI · Smallest files',
    scale: 1.0,
    jpegQuality: 0.82,
  },
  {
    id: 'standard',
    label: 'Standard',
    sub: '150 DPI · Balanced quality',
    scale: 150 / 72,
    jpegQuality: 0.88,
  },
  {
    id: 'high',
    label: 'Print Quality',
    sub: '300 DPI · Largest files',
    scale: 300 / 72,
    jpegQuality: 0.92,
  },
]

export default function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [format, setFormat] = useState<ImageFormat>('jpg')
  const [dpi, setDpi] = useState<DpiPreset>('standard')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<ConvertedImage[]>([])
  const [zoneDragging, setZoneDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const urlsRef = useRef<string[]>([])

  // Revoke all object URLs (called on reset + unmount)
  const revokeAllUrls = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    urlsRef.current = []
  }, [])

  useEffect(() => () => revokeAllUrls(), [revokeAllUrls])

  // ── Load PDF ──────────────────────────────────────────────────
  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.')
      return
    }
    setStatus('loading')
    setError(null)
    setImages([])
    setFile(f)

    try {
      const { PDFDocument } = await import('pdf-lib')
      const bytes = await f.arrayBuffer()
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setPageCount(doc.getPageCount())
      setStatus('ready')
    } catch {
      setError('Could not read this PDF. It may be corrupted or encrypted.')
      setStatus('error')
      setFile(null)
    }
  }, [])

  const onZoneDrop = (e: DragEvent) => {
    e.preventDefault()
    setZoneDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) loadFile(f)
  }

  // ── Convert ───────────────────────────────────────────────────
  const convert = async () => {
    if (!file) return
    setStatus('converting')
    setProgress(0)
    setError(null)
    revokeAllUrls()

    const opt = DPI_OPTIONS.find((o) => o.id === dpi)!
    const baseName = file.name.replace(/\.pdf$/i, '')
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
    const ext = format

    try {
      setProgressLabel('Initialising renderer…')
      const pdfjs = await getPdfjs()
      const srcBytes = await file.arrayBuffer()
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(srcBytes) })
      const pdfDoc = await loadingTask.promise

      const results: ConvertedImage[] = []

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        setProgressLabel(`Converting page ${i} of ${pdfDoc.numPages}…`)
        setProgress(Math.round(((i - 1) / pdfDoc.numPages) * 95))

        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: opt.scale })

        const canvas = document.createElement('canvas')
        canvas.width = Math.round(viewport.width)
        canvas.height = Math.round(viewport.height)

        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context unavailable.')

        await page.render({ canvasContext: ctx, viewport }).promise

        // toBlob is async + more memory-efficient than toDataURL
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) =>
              b ? resolve(b) : reject(new Error('Canvas toBlob failed.')),
            mimeType,
            format === 'jpg' ? opt.jpegQuality : undefined
          )
        })

        // Free canvas memory immediately
        canvas.width = 0
        canvas.height = 0

        const url = URL.createObjectURL(blob)
        urlsRef.current.push(url)

        results.push({
          pageNum: i,
          name: `${baseName}_page_${String(i).padStart(2, '0')}.${ext}`,
          blob,
          url,
          size: blob.size,
        })
      }

      setProgress(100)
      setImages(results)
      setStatus('done')
      setProgressLabel('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Conversion failed. Please try again.'
      )
      setStatus('error')
      setProgressLabel('')
    }
  }

  // ── Download ──────────────────────────────────────────────────
  const downloadOne = (img: ConvertedImage) => {
    const a = document.createElement('a')
    a.href = img.url
    a.download = img.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadAllZip = async () => {
    if (images.length === 1) {
      downloadOne(images[0])
      return
    }
    setProgressLabel('Creating ZIP…')
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    images.forEach((img) => zip.file(img.name, img.blob))
    const content = await zip.generateAsync({ type: 'blob' })
    setProgressLabel('')
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file?.name.replace(/\.pdf$/i, '') ?? 'pages'}_images.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    revokeAllUrls()
    setFile(null)
    setPageCount(0)
    setStatus('idle')
    setProgress(0)
    setProgressLabel('')
    setError(null)
    setImages([])
    if (inputRef.current) inputRef.current.value = ''
  }

  const selectedDpi = DPI_OPTIONS.find((o) => o.id === dpi)!
  const showPngWarning = format === 'png' && dpi === 'high'
  const totalSize = images.reduce((s, i) => s + i.size, 0)

  return (
    <div>
      {/* AD_SLOT: header_banner */}
      <div className="bg-bg-dark border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <AdSlot position="header" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex gap-8 items-start">
          {/* ── Main column ────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── Upload ─────────────────────────────────── */}
            {(status === 'idle' ||
              status === 'loading' ||
              status === 'error') && (
              <div>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Drop a PDF or click to upload"
                  onKeyDown={(e) =>
                    e.key === 'Enter' && inputRef.current?.click()
                  }
                  onDragOver={(e) => {
                    e.preventDefault()
                    setZoneDragging(true)
                  }}
                  onDragLeave={() => setZoneDragging(false)}
                  onDrop={onZoneDrop}
                  onClick={() => inputRef.current?.click()}
                  className={[
                    'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer',
                    'transition-all duration-200 select-none outline-none',
                    'focus-visible:ring-2 focus-visible:ring-purple-400',
                    zoneDragging
                      ? 'border-purple-400 bg-purple-50 scale-[1.01]'
                      : 'border-gray-200 bg-white hover:border-purple-400/50 hover:bg-purple-50/20',
                  ].join(' ')}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) loadFile(f)
                      e.target.value = ''
                    }}
                  />

                  {status === 'loading' ? (
                    <div className="flex flex-col items-center gap-3">
                      <SpinnerSvg />
                      <p className="text-gray-500 text-sm">Reading PDF…</p>
                    </div>
                  ) : (
                    <>
                      <ImageConvertSvg dragging={zoneDragging} />
                      <p className="mt-4 font-syne font-bold text-dark text-xl">
                        Drop a PDF to convert
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        or{' '}
                        <span className="text-purple-500 underline">
                          click to browse
                        </span>
                      </p>
                      <p className="text-gray-300 text-xs mt-3">
                        PDF only · single file
                      </p>
                    </>
                  )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1.5">
                  <LockSvg /> Your file never leaves your browser — 100%
                  private
                </p>

                {error && (
                  <div
                    className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2"
                    role="alert"
                  >
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* ── Configure ──────────────────────────────── */}
            {(status === 'ready' ||
              status === 'converting' ||
              status === 'done' ||
              status === 'error') &&
              file && (
                <>
                  {/* File chip */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-card">
                    <PdfFileSvg />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark truncate text-sm">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmtSize(file.size)} &middot; {pageCount} page
                        {pageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {status === 'ready' && (
                      <button
                        onClick={reset}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors shrink-0"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {/* Options */}
                  {status === 'ready' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-6">
                      {/* Format */}
                      <div>
                        <h2 className="font-syne font-bold text-dark text-base mb-3">
                          Image Format
                        </h2>
                        <div className="flex gap-2">
                          {(['jpg', 'png'] as ImageFormat[]).map((f) => (
                            <button
                              key={f}
                              onClick={() => setFormat(f)}
                              className={[
                                'flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                                format === f
                                  ? 'border-purple-400 bg-purple-50 text-purple-700'
                                  : 'border-gray-100 text-gray-600 hover:border-gray-300',
                              ].join(' ')}
                            >
                              {f.toUpperCase()}
                              <span className="block text-xs font-normal mt-0.5 text-gray-400">
                                {f === 'jpg'
                                  ? 'Smaller files'
                                  : 'Lossless quality'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Resolution */}
                      <div>
                        <h2 className="font-syne font-bold text-dark text-base mb-3">
                          Resolution
                        </h2>
                        <div className="grid grid-cols-3 gap-2">
                          {DPI_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setDpi(opt.id)}
                              className={[
                                'py-3 px-2 rounded-xl border-2 text-center transition-all',
                                dpi === opt.id
                                  ? 'border-purple-400 bg-purple-50'
                                  : 'border-gray-100 hover:border-gray-300 bg-white',
                              ].join(' ')}
                            >
                              <span
                                className={`block text-sm font-semibold ${dpi === opt.id ? 'text-purple-700' : 'text-dark'}`}
                              >
                                {opt.label}
                              </span>
                              <span className="block text-[11px] text-gray-400 mt-0.5 leading-snug">
                                {opt.sub}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Warnings */}
                      {showPngWarning && (
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex items-start gap-2">
                          <span className="shrink-0 mt-0.5">⚠️</span>
                          PNG + 300 DPI produces very large files. A single
                          letter-size page can exceed 10 MB. Consider JPG for
                          smaller output.
                        </div>
                      )}

                      {dpi === 'high' && pageCount > 20 && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                          <span className="shrink-0 mt-0.5">ℹ️</span>
                          {pageCount} pages at 300 DPI may take a minute. Your
                          browser will remain responsive during conversion.
                        </div>
                      )}

                      <button
                        onClick={convert}
                        className="w-full inline-flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                      >
                        Convert {pageCount} Page{pageCount !== 1 ? 's' : ''} to{' '}
                        {format.toUpperCase()} →
                      </button>
                    </div>
                  )}

                  {/* Progress */}
                  {status === 'converting' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{progressLabel || 'Converting…'}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
                        <LockSvg /> Processing locally — no file upload
                      </p>
                    </div>
                  )}

                  {/* Error during conversion */}
                  {status === 'error' && error && (
                    <div
                      className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2"
                      role="alert"
                    >
                      <span className="shrink-0">⚠️</span>
                      <span className="flex-1">{error}</span>
                      <button
                        onClick={() => setStatus('ready')}
                        className="text-xs underline shrink-0"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {/* Results */}
                  {status === 'done' && images.length > 0 && (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h2 className="font-syne font-bold text-dark text-lg">
                            {images.length} Image
                            {images.length !== 1 ? 's' : ''} Ready
                          </h2>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Total size: {fmtSize(totalSize)}
                          </p>
                        </div>
                        <button
                          onClick={downloadAllZip}
                          className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2.5 px-5 rounded-xl transition-colors text-sm"
                        >
                          <DownloadSvg />
                          {images.length === 1
                            ? 'Download Image'
                            : 'Download All as ZIP'}
                        </button>
                      </div>

                      {/* AD_SLOT: pre_download_interstitial */}
                      <AdSlot position="pre_download" />

                      {/* Preview grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {images.slice(0, 8).map((img) => (
                          <div
                            key={img.pageNum}
                            className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 aspect-[3/4]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={`Page ${img.pageNum}`}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                              <span className="text-white text-xs font-medium">
                                Page {img.pageNum}
                              </span>
                              <button
                                onClick={() => downloadOne(img)}
                                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <DownloadSvg /> Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {images.length > 8 && (
                        <p className="text-xs text-gray-400 text-center">
                          Showing 8 of {images.length} pages. Download the ZIP
                          to get all images.
                        </p>
                      )}

                      {/* Individual download list */}
                      {images.length > 1 && (
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card">
                          <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Individual Downloads
                            </p>
                          </div>
                          <ul className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                            {images.map((img) => (
                              <li
                                key={img.pageNum}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                              >
                                <span className="text-xs text-gray-400 w-12 shrink-0">
                                  Page {img.pageNum}
                                </span>
                                <span className="text-xs text-gray-400 flex-1">
                                  {fmtSize(img.size)}
                                </span>
                                <button
                                  onClick={() => downloadOne(img)}
                                  className="text-xs font-semibold text-purple-500 hover:text-purple-700 transition-colors flex items-center gap-1"
                                >
                                  <DownloadSvg /> Download
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button onClick={reset} className="btn-secondary w-full justify-center text-sm">
                        Convert Another PDF
                      </button>
                    </div>
                  )}
                </>
              )}
          </div>

          {/* AD_SLOT: sidebar_right (desktop) */}
          <aside className="hidden lg:block w-[300px] shrink-0">
            <div className="sticky top-24">
              <AdSlot position="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

// ── SVG atoms ──────────────────────────────────────────────────────────────

function ImageConvertSvg({ dragging }: { dragging: boolean }) {
  const color = dragging ? '#A855F7' : '#CBD5E1'
  return (
    <svg
      className={`mx-auto transition-transform duration-200 ${dragging ? 'scale-110' : ''}`}
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function LockSvg() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function PdfFileSvg() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A855F7"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function DownloadSvg() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function SpinnerSvg({ size = 40 }: { size?: number }) {
  return (
    <svg
      style={{ width: size, height: size }}
      className="animate-spin mx-auto"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="#A855F7"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="#A855F7"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
