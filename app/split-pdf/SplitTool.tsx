'use client'

import { useState, useRef, useCallback, DragEvent } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'loading' | 'ready' | 'splitting' | 'done' | 'error'
type SplitMode = 'range' | 'every' | 'individual'

interface SplitResult {
  name: string
  blob: Blob
  pageCount: number
}

const MODES: { id: SplitMode; label: string; desc: string }[] = [
  {
    id: 'range',
    label: 'By Page Range',
    desc: 'Define custom ranges — each becomes a separate PDF.',
  },
  {
    id: 'every',
    label: 'Every N Pages',
    desc: 'Automatically split into equal-sized chunks.',
  },
  {
    id: 'individual',
    label: 'Individual Pages',
    desc: 'One PDF file per page.',
  },
]

export default function SplitTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [mode, setMode] = useState<SplitMode>('range')
  const [rangeInput, setRangeInput] = useState('')
  const [everyN, setEveryN] = useState(2)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SplitResult[]>([])
  const [zoneDragging, setZoneDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // ── Load file & read page count ──────────────────────────────
  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.')
      return
    }
    setStatus('loading')
    setError(null)
    setResults([])
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

  // ── Parse "1-3, 5, 7-9" → [[0,1,2],[4],[6,7,8]] (0-indexed) ─
  const parseRanges = useCallback(
    (input: string): number[][] => {
      const parts = input.split(',').map((s) => s.trim()).filter(Boolean)
      const result: number[][] = []

      for (const part of parts) {
        if (part.includes('-')) {
          const [rawA, rawB] = part.split('-')
          const a = parseInt(rawA.trim(), 10)
          const b = parseInt(rawB?.trim() ?? '', 10)
          if (isNaN(a) || isNaN(b) || a > b) continue
          const indices: number[] = []
          for (
            let i = Math.max(1, a);
            i <= Math.min(b, pageCount);
            i++
          ) {
            indices.push(i - 1)
          }
          if (indices.length) result.push(indices)
        } else {
          const n = parseInt(part, 10)
          if (!isNaN(n) && n >= 1 && n <= pageCount) result.push([n - 1])
        }
      }
      return result
    },
    [pageCount]
  )

  const buildRanges = useCallback((): number[][] => {
    switch (mode) {
      case 'range':
        return parseRanges(rangeInput)

      case 'every': {
        const n = Math.max(1, everyN)
        return Array.from({ length: Math.ceil(pageCount / n) }, (_, i) =>
          Array.from(
            { length: Math.min(n, pageCount - i * n) },
            (__, j) => i * n + j
          )
        )
      }

      case 'individual':
        return Array.from({ length: pageCount }, (_, i) => [i])
    }
  }, [mode, rangeInput, everyN, pageCount, parseRanges])

  // ── Split ─────────────────────────────────────────────────────
  const split = async () => {
    if (!file) return

    const ranges = buildRanges()
    if (ranges.length === 0) {
      setError('Enter valid page ranges. Example: 1-3, 5, 7-10')
      return
    }

    setStatus('splitting')
    setProgress(0)
    setError(null)

    try {
      const { PDFDocument } = await import('pdf-lib')
      const srcBytes = await file.arrayBuffer()
      const srcDoc = await PDFDocument.load(srcBytes, {
        ignoreEncryption: true,
      })
      const outputs: SplitResult[] = []
      const baseName = file.name.replace(/\.pdf$/i, '')

      for (let i = 0; i < ranges.length; i++) {
        const newDoc = await PDFDocument.create()
        const copied = await newDoc.copyPages(srcDoc, ranges[i])
        copied.forEach((p) => newDoc.addPage(p))
        const outBytes = await newDoc.save()

        const label =
          ranges.length === 1
            ? 'split'
            : `part-${String(i + 1).padStart(2, '0')}`

        outputs.push({
          name: `${baseName}_${label}.pdf`,
          blob: new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }),
          pageCount: ranges[i].length,
        })

        setProgress(Math.round(((i + 1) / ranges.length) * 100))
      }

      setResults(outputs)
      setStatus('done')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to split PDF. Please try again.'
      )
      setStatus('error')
    }
  }

  // ── Download helpers ──────────────────────────────────────────
  const downloadOne = (result: SplitResult) => {
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAllZip = async () => {
    if (results.length === 1) {
      downloadOne(results[0])
      return
    }
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    results.forEach((r) => zip.file(r.name, r.blob))
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file?.name.replace(/\.pdf$/i, '') ?? 'split'}_parts.zip`
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
    setError(null)
    setResults([])
    setRangeInput('')
    setEveryN(2)
    if (inputRef.current) inputRef.current.value = ''
  }

  // Preview what will be generated
  const previewRanges = status === 'ready' ? buildRanges() : []
  const outputCount = previewRanges.length

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

            {/* ── Step 1: Upload ─────────────────────────── */}
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
                    'focus-visible:ring-2 focus-visible:ring-primary',
                    zoneDragging
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/[0.02]',
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
                      <UploadSvg dragging={zoneDragging} />
                      <p className="mt-4 font-syne font-bold text-dark text-xl">
                        Drop a PDF to split
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        or{' '}
                        <span className="text-primary underline">
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

            {/* ── Step 2 & 3: Configure + Results ───────── */}
            {(status === 'ready' ||
              status === 'splitting' ||
              status === 'done') &&
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

                  {/* ── Configure (only in ready state) ──── */}
                  {status === 'ready' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-5">
                      <h2 className="font-syne font-bold text-dark text-lg">
                        Split Options
                      </h2>

                      {/* Mode selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {MODES.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setMode(m.id)
                              setError(null)
                            }}
                            className={[
                              'text-left p-3 rounded-xl border-2 transition-all text-sm',
                              mode === m.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-100 hover:border-gray-300 bg-white',
                            ].join(' ')}
                          >
                            <span
                              className={`font-semibold block mb-0.5 ${mode === m.id ? 'text-primary' : 'text-dark'}`}
                            >
                              {m.label}
                            </span>
                            <span className="text-xs text-gray-400 leading-snug">
                              {m.desc}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Mode-specific input */}
                      {mode === 'range' && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">
                            Page ranges{' '}
                            <span className="text-gray-400 font-normal">
                              (comma-separated)
                            </span>
                          </label>
                          <input
                            type="text"
                            value={rangeInput}
                            onChange={(e) => setRangeInput(e.target.value)}
                            placeholder={`e.g. 1-3, 4-7, 8-${pageCount}`}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                          />
                          <p className="text-xs text-gray-400 mt-1.5">
                            Each range creates a separate PDF. Pages can
                            overlap between ranges.
                          </p>
                        </div>
                      )}

                      {mode === 'every' && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">
                            Pages per file
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min={1}
                              max={pageCount - 1}
                              value={everyN}
                              onChange={(e) =>
                                setEveryN(
                                  Math.max(
                                    1,
                                    parseInt(e.target.value, 10) || 1
                                  )
                                )
                              }
                              className="w-24 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition"
                            />
                            <span className="text-gray-500 text-sm">
                              pages per file
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1.5">
                            Creates{' '}
                            <strong>
                              {Math.ceil(pageCount / Math.max(1, everyN))}
                            </strong>{' '}
                            PDF file
                            {Math.ceil(pageCount / Math.max(1, everyN)) !== 1
                              ? 's'
                              : ''}
                            .
                          </p>
                        </div>
                      )}

                      {mode === 'individual' && (
                        <div
                          className={`p-4 rounded-xl text-sm flex items-start gap-2 ${pageCount > 30 ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'bg-orange-50 text-orange-700'}`}
                        >
                          <span className="shrink-0 mt-0.5">ℹ️</span>
                          <span>
                            This will create{' '}
                            <strong>{pageCount} separate PDF files</strong>,
                            one per page.
                            {pageCount > 30 &&
                              ' They will be bundled into a ZIP for download.'}
                          </span>
                        </div>
                      )}

                      {/* Output preview chips */}
                      {outputCount > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Output preview — {outputCount} file
                            {outputCount !== 1 ? 's' : ''}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {previewRanges.slice(0, 12).map((r, i) => (
                              <span
                                key={i}
                                className="text-xs bg-orange-50 text-orange-600 border border-orange-100 rounded-lg px-2.5 py-1"
                              >
                                {r.length === 1
                                  ? `p.${r[0] + 1}`
                                  : `p.${r[0] + 1}–${r[r.length - 1] + 1}`}
                              </span>
                            ))}
                            {outputCount > 12 && (
                              <span className="text-xs text-gray-400 px-2 py-1">
                                +{outputCount - 12} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {error && status === 'ready' && (
                    <div
                      className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2"
                      role="alert"
                    >
                      <span className="shrink-0">⚠️</span>
                      {error}
                    </div>
                  )}

                  {/* Split button */}
                  {status === 'ready' && (
                    <button
                      onClick={split}
                      disabled={mode === 'range' && !rangeInput.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Split PDF →
                    </button>
                  )}

                  {/* Splitting progress */}
                  {status === 'splitting' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Splitting in your browser…</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {status === 'done' && results.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h2 className="font-syne font-bold text-dark text-lg">
                          {results.length} File
                          {results.length !== 1 ? 's' : ''} Ready
                        </h2>
                        {results.length > 1 && (
                          <button
                            onClick={downloadAllZip}
                            className="btn-primary text-sm py-2 px-4"
                          >
                            <DownloadSvg /> Download All as ZIP
                          </button>
                        )}
                      </div>

                      {/* AD_SLOT: pre_download_interstitial */}
                      <AdSlot position="pre_download" className="mb-4" />

                      <ul className="space-y-2">
                        {results.map((r, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
                          >
                            <PdfFileSvg />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-dark truncate">
                                {r.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {r.pageCount} page
                                {r.pageCount !== 1 ? 's' : ''} &middot;{' '}
                                {fmtSize(r.blob.size)}
                              </p>
                            </div>
                            <button
                              onClick={() => downloadOne(r)}
                              className="shrink-0 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                            >
                              <DownloadSvg /> Download
                            </button>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={reset}
                        className="btn-secondary mt-5 w-full justify-center text-sm"
                      >
                        Split Another PDF
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

function UploadSvg({ dragging }: { dragging: boolean }) {
  return (
    <svg
      className={`mx-auto transition-transform duration-200 ${dragging ? 'scale-110' : ''}`}
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={dragging ? '#F97316' : '#CBD5E1'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
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
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F97316"
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
        stroke="#F97316"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="#F97316"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
