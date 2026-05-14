'use client'

import { useState, useRef, useCallback, DragEvent } from 'react'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'

type Status = 'idle' | 'loading' | 'ready' | 'compressing' | 'done' | 'error'
type QualityId = 'lossless' | 'balanced' | 'maximum'

interface QualityOption {
  id: QualityId
  label: string
  badge: string
  desc: string
  hint?: string
  scale: number
  jpegQuality: number
}

const QUALITY_OPTIONS: QualityOption[] = [
  {
    id: 'lossless',
    label: 'Lossless',
    badge: 'Preserves text',
    desc: 'Re-saves the PDF, removing redundant data and compressing the structure. Text stays searchable. Best for unoptimized PDFs.',
    scale: 1,
    jpegQuality: 1,
  },
  {
    id: 'balanced',
    label: 'Balanced',
    badge: 'Recommended',
    desc: 'Renders each page as a compressed JPEG image at 108 DPI. Significant file size reduction with good visual quality.',
    hint: 'Text will not be selectable in the output PDF.',
    scale: 1.5,
    jpegQuality: 0.72,
  },
  {
    id: 'maximum',
    label: 'Maximum',
    badge: 'Smallest file',
    desc: 'Renders each page as a highly compressed JPEG at 72 DPI. Smallest possible file size.',
    hint: 'Text will not be selectable. Quality may be lower.',
    scale: 1.0,
    jpegQuality: 0.48,
  },
]

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [quality, setQuality] = useState<QualityId>('balanced')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    blob: Blob
    originalSize: number
  } | null>(null)
  const [zoneDragging, setZoneDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // ── Load file & read page count ─────────────────────────────
  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.')
      return
    }
    setStatus('loading')
    setError(null)
    setResult(null)
    setFile(f)

    try {
      const { PDFDocument } = await import('pdf-lib')
      const bytes = await f.arrayBuffer()
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setPageCount(doc.getPageCount())
      setStatus('ready')
    } catch {
      setError(
        'Could not read this PDF. It may be corrupted or fully password-protected.'
      )
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

  // ── Compress ────────────────────────────────────────────────
  const compress = async () => {
    if (!file) return
    setStatus('compressing')
    setProgress(0)
    setError(null)

    const opt = QUALITY_OPTIONS.find((o) => o.id === quality)!

    try {
      if (quality === 'lossless') {
        // ── Lossless: pdf-lib re-save only ──────────
        setProgressLabel('Optimizing PDF structure…')
        const { PDFDocument } = await import('pdf-lib')
        const bytes = await file.arrayBuffer()
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
        setProgress(60)
        setProgressLabel('Saving…')
        const out = await doc.save({ useObjectStreams: true })
        setProgress(100)
        setResult({
          blob: new Blob([new Uint8Array(out)], { type: 'application/pdf' }),
          originalSize: file.size,
        })
      } else {
        // ── Image-based compression (pdfjs + pdf-lib) ─
        setProgressLabel('Initialising PDF renderer…')
        const pdfjs = await getPdfjs()

        const srcBytes = await file.arrayBuffer()
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(srcBytes) })
        const srcPdf = await loadingTask.promise

        const { PDFDocument } = await import('pdf-lib')
        const outDoc = await PDFDocument.create()

        for (let i = 0; i < srcPdf.numPages; i++) {
          setProgressLabel(
            `Compressing page ${i + 1} of ${srcPdf.numPages}…`
          )
          setProgress(Math.round(((i) / srcPdf.numPages) * 90))

          const page = await srcPdf.getPage(i + 1)

          // Get original page dimensions (in PDF points at scale=1)
          const origViewport = page.getViewport({ scale: 1.0 })

          // Render at compression scale
          const renderViewport = page.getViewport({ scale: opt.scale })
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(renderViewport.width)
          canvas.height = Math.round(renderViewport.height)

          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('Canvas 2D context not available.')

          await page.render({ canvasContext: ctx, viewport: renderViewport })
            .promise

          // Get JPEG data URI
          const dataUri = canvas.toDataURL('image/jpeg', opt.jpegQuality)

          // Free canvas memory immediately
          canvas.width = 0
          canvas.height = 0

          // Decode base64 → Uint8Array
          const base64 = dataUri.split(',')[1]
          const binary = atob(base64)
          const jpegBytes = new Uint8Array(binary.length)
          for (let b = 0; b < binary.length; b++) {
            jpegBytes[b] = binary.charCodeAt(b)
          }

          // Embed JPEG and draw on a page matching the original dimensions
          const embedded = await outDoc.embedJpg(jpegBytes)
          const outPage = outDoc.addPage([
            origViewport.width,
            origViewport.height,
          ])
          outPage.drawImage(embedded, {
            x: 0,
            y: 0,
            width: origViewport.width,
            height: origViewport.height,
          })
        }

        setProgressLabel('Saving compressed PDF…')
        const out = await outDoc.save({ useObjectStreams: true })
        setProgress(100)

        setResult({
          blob: new Blob([new Uint8Array(out)], { type: 'application/pdf' }),
          originalSize: file.size,
        })
      }

      setStatus('done')
      setProgressLabel('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Compression failed. Please try a different quality setting or file.'
      )
      setStatus('error')
      setProgressLabel('')
    }
  }

  const download = () => {
    if (!result || !file) return
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compressed_${file.name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setFile(null)
    setPageCount(0)
    setStatus('idle')
    setProgress(0)
    setProgressLabel('')
    setError(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const reduction = result
    ? Math.max(0, Math.round((1 - result.blob.size / result.originalSize) * 100))
    : 0

  const selectedOpt = QUALITY_OPTIONS.find((o) => o.id === quality)!

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
                    'focus-visible:ring-2 focus-visible:ring-blue-400',
                    zoneDragging
                      ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                      : 'border-gray-200 bg-white hover:border-blue-400/50 hover:bg-blue-50/30',
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
                      <SpinnerSvg size={40} />
                      <p className="text-gray-500 text-sm">Reading PDF…</p>
                    </div>
                  ) : (
                    <>
                      <CompressIcon dragging={zoneDragging} />
                      <p className="mt-4 font-syne font-bold text-dark text-xl">
                        Drop a PDF to compress
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        or{' '}
                        <span className="text-blue-500 underline">
                          click to browse
                        </span>
                      </p>
                      <p className="text-gray-300 text-xs mt-3">
                        PDF only · Max 500 MB
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

            {/* ── Configure + Process ─────────────────────── */}
            {(status === 'ready' ||
              status === 'compressing' ||
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
                    {(status === 'ready' || status === 'error') && (
                      <button
                        onClick={reset}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors shrink-0"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {/* Quality selector */}
                  {status === 'ready' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-4">
                      <h2 className="font-syne font-bold text-dark text-lg">
                        Compression Level
                      </h2>

                      <div className="space-y-3">
                        {QUALITY_OPTIONS.map((opt) => (
                          <label
                            key={opt.id}
                            className={[
                              'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                              quality === opt.id
                                ? 'border-blue-400 bg-blue-50/40'
                                : 'border-gray-100 hover:border-gray-200 bg-white',
                            ].join(' ')}
                          >
                            <input
                              type="radio"
                              name="quality"
                              value={opt.id}
                              checked={quality === opt.id}
                              onChange={() => setQuality(opt.id)}
                              className="mt-1 accent-blue-500 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span
                                  className={`font-semibold text-sm ${quality === opt.id ? 'text-blue-600' : 'text-dark'}`}
                                >
                                  {opt.label}
                                </span>
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                    opt.id === 'balanced'
                                      ? 'bg-blue-100 text-blue-600'
                                      : opt.id === 'maximum'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {opt.badge}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed">
                                {opt.desc}
                              </p>
                              {opt.hint && quality === opt.id && (
                                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                                  <span aria-hidden="true">⚠️</span>
                                  {opt.hint}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>

                      <button
                        onClick={compress}
                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
                      >
                        Compress PDF →
                      </button>
                    </div>
                  )}

                  {/* Progress */}
                  {status === 'compressing' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>{progressLabel || 'Processing…'}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-3 text-center flex items-center justify-center gap-1.5">
                        <LockSvg /> Processing locally — no file upload
                      </p>
                    </div>
                  )}

                  {/* Result */}
                  {status === 'done' && result && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-5">
                      <h2 className="font-syne font-bold text-dark text-lg flex items-center gap-2">
                        <span className="text-green-500">✓</span> Compression
                        Complete
                      </h2>

                      {/* Size comparison */}
                      <div className="grid grid-cols-3 items-center gap-2 p-4 bg-gray-50 rounded-xl">
                        <div className="text-center">
                          <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wide">
                            Original
                          </p>
                          <p className="font-semibold text-dark text-sm">
                            {fmtSize(result.originalSize)}
                          </p>
                        </div>
                        <div className="text-center flex flex-col items-center gap-1">
                          <ArrowRightSvg />
                          <span
                            className={`text-sm font-bold ${reduction > 0 ? 'text-green-500' : 'text-gray-400'}`}
                          >
                            {reduction > 0 ? `−${reduction}%` : 'No change'}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wide">
                            Compressed
                          </p>
                          <p className="font-semibold text-dark text-sm">
                            {fmtSize(result.blob.size)}
                          </p>
                        </div>
                      </div>

                      {reduction === 0 && selectedOpt.id === 'lossless' && (
                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                          ℹ️ This PDF is already well-optimized. Try{' '}
                          <button
                            onClick={() => {
                              setQuality('balanced')
                              setStatus('ready')
                              setResult(null)
                            }}
                            className="underline font-medium"
                          >
                            Balanced
                          </button>{' '}
                          or{' '}
                          <button
                            onClick={() => {
                              setQuality('maximum')
                              setStatus('ready')
                              setResult(null)
                            }}
                            className="underline font-medium"
                          >
                            Maximum
                          </button>{' '}
                          compression for a smaller file.
                        </p>
                      )}

                      {/* AD_SLOT: pre_download_interstitial */}
                      <AdSlot position="pre_download" />

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={download}
                          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                        >
                          <DownloadSvg /> Download Compressed PDF
                        </button>
                        <button onClick={reset} className="btn-secondary">
                          Compress Another
                        </button>
                      </div>
                    </div>
                  )}

                  {status === 'error' && error && (
                    <div
                      className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2"
                      role="alert"
                    >
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span className="flex-1">{error}</span>
                      <button
                        onClick={() => setStatus('ready')}
                        className="text-xs underline shrink-0"
                      >
                        Try again
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

function CompressIcon({ dragging }: { dragging: boolean }) {
  return (
    <svg
      className={`mx-auto transition-transform duration-200 ${dragging ? 'scale-110' : ''}`}
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={dragging ? '#3B82F6' : '#CBD5E1'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="8 17 12 13 16 17" />
      <line x1="12" y1="13" x2="12" y2="20" />
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
      stroke="#3B82F6"
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
      width="16"
      height="16"
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

function ArrowRightSvg() {
  return (
    <svg
      width="28"
      height="12"
      viewBox="0 0 28 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 6h24M20 2l6 4-6 4"
        stroke="#CBD5E1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SpinnerSvg({ size = 24 }: { size?: number }) {
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
        stroke="#3B82F6"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="#3B82F6"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
