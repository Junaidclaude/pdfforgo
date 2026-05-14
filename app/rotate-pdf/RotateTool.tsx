'use client'

import { useState, useRef, useCallback, DragEvent } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'loading' | 'ready' | 'rotating' | 'done' | 'error'
type PageTarget = 'all' | 'odd' | 'even' | 'custom'

// Delta = degrees added to current rotation (PDF Rotate is clockwise)
// Right (+90): 90° CW, Left (+270): 90° CCW, Flip (+180): 180°
type RotationDelta = 90 | 180 | 270

const ROTATION_BUTTONS: {
  delta: RotationDelta
  label: string
  type: 'left' | 'flip' | 'right'
}[] = [
  { delta: 270, label: '90° Left', type: 'left' },
  { delta: 180, label: '180°', type: 'flip' },
  { delta: 90, label: '90° Right', type: 'right' },
]

const PAGE_TARGETS: { id: PageTarget; label: string }[] = [
  { id: 'all', label: 'All pages' },
  { id: 'odd', label: 'Odd pages' },
  { id: 'even', label: 'Even pages' },
  { id: 'custom', label: 'Custom' },
]

export default function RotateTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [rotation, setRotation] = useState<RotationDelta>(90)
  const [pageTarget, setPageTarget] = useState<PageTarget>('all')
  const [customInput, setCustomInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [zoneDragging, setZoneDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // ── Load PDF ──────────────────────────────────────────────────
  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.')
      return
    }
    setStatus('loading')
    setError(null)
    setDownloadUrl(null)
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

  // ── Build page index list ─────────────────────────────────────
  const getTargetIndices = useCallback((): number[] => {
    const all = Array.from({ length: pageCount }, (_, i) => i)

    switch (pageTarget) {
      case 'all':
        return all
      case 'odd':
        return all.filter((i) => i % 2 === 0) // 0,2,4… = pages 1,3,5…
      case 'even':
        return all.filter((i) => i % 2 === 1) // 1,3,5… = pages 2,4,6…
      case 'custom': {
        const set = new Set<number>()
        const parts = customInput.split(',').map((s) => s.trim()).filter(Boolean)
        for (const part of parts) {
          if (part.includes('-')) {
            const [rawA, rawB] = part.split('-')
            const a = parseInt(rawA.trim(), 10)
            const b = parseInt(rawB?.trim() ?? '', 10)
            if (isNaN(a) || isNaN(b)) continue
            for (let i = Math.max(1, a); i <= Math.min(b, pageCount); i++) {
              set.add(i - 1)
            }
          } else {
            const n = parseInt(part, 10)
            if (!isNaN(n) && n >= 1 && n <= pageCount) set.add(n - 1)
          }
        }
        return Array.from(set).sort((a, b) => a - b)
      }
    }
  }, [pageCount, pageTarget, customInput])

  // ── Rotate ────────────────────────────────────────────────────
  const rotate = async () => {
    if (!file) return

    const indices = getTargetIndices()
    if (indices.length === 0) {
      setError(
        pageTarget === 'custom'
          ? 'Enter valid page numbers. Example: 1, 3, 5-8'
          : 'No pages matched your selection.'
      )
      return
    }

    setStatus('rotating')
    setError(null)

    try {
      const { PDFDocument, degrees } = await import('pdf-lib')
      const bytes = await file.arrayBuffer()
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const pages = doc.getPages()
      const targetSet = new Set(indices)

      pages.forEach((page, i) => {
        if (!targetSet.has(i)) return
        const current = page.getRotation().angle
        page.setRotation(degrees((current + rotation) % 360))
      })

      const out = await doc.save()

      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      const blob = new Blob([new Uint8Array(out)], { type: 'application/pdf' })
      setDownloadUrl(URL.createObjectURL(blob))
      setStatus('done')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to rotate PDF. Please try again.'
      )
      setStatus('error')
    }
  }

  const triggerDownload = () => {
    if (!downloadUrl || !file) return
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `rotated_${file.name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const reset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setFile(null)
    setPageCount(0)
    setStatus('idle')
    setError(null)
    setDownloadUrl(null)
    setCustomInput('')
    setPageTarget('all')
    setRotation(90)
    if (inputRef.current) inputRef.current.value = ''
  }

  const previewCount = status === 'ready' ? getTargetIndices().length : 0

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
                    'focus-visible:ring-2 focus-visible:ring-yellow-400',
                    zoneDragging
                      ? 'border-yellow-400 bg-yellow-50 scale-[1.01]'
                      : 'border-gray-200 bg-white hover:border-yellow-400/50 hover:bg-yellow-50/20',
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
                      <UploadRotateSvg dragging={zoneDragging} />
                      <p className="mt-4 font-syne font-bold text-dark text-xl">
                        Drop a PDF to rotate
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        or{' '}
                        <span className="text-yellow-500 underline">
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

            {/* ── Configure + Results ─────────────────────── */}
            {(status === 'ready' ||
              status === 'rotating' ||
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

                  {/* Config panel */}
                  {status === 'ready' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-7">
                      {/* Rotation angle */}
                      <div>
                        <h2 className="font-syne font-bold text-dark text-base mb-4">
                          Rotation Angle
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                          {ROTATION_BUTTONS.map((btn) => (
                            <button
                              key={btn.delta}
                              onClick={() => setRotation(btn.delta)}
                              className={[
                                'flex flex-col items-center gap-2.5 py-5 px-3 rounded-2xl border-2 transition-all',
                                rotation === btn.delta
                                  ? 'border-yellow-400 bg-yellow-50'
                                  : 'border-gray-100 hover:border-gray-300 bg-white',
                              ].join(' ')}
                            >
                              <RotationArrow
                                type={btn.type}
                                active={rotation === btn.delta}
                              />
                              <span
                                className={`text-sm font-semibold ${
                                  rotation === btn.delta
                                    ? 'text-yellow-700'
                                    : 'text-gray-600'
                                }`}
                              >
                                {btn.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Page target */}
                      <div>
                        <h2 className="font-syne font-bold text-dark text-base mb-3">
                          Pages to Rotate
                        </h2>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {PAGE_TARGETS.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setPageTarget(opt.id)
                                setError(null)
                              }}
                              className={[
                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                                pageTarget === opt.id
                                  ? 'bg-yellow-400 border-yellow-400 text-dark'
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white',
                              ].join(' ')}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {pageTarget === 'custom' && (
                          <div>
                            <input
                              type="text"
                              value={customInput}
                              onChange={(e) => {
                                setCustomInput(e.target.value)
                                setError(null)
                              }}
                              placeholder={`e.g. 1, 3, 5-${pageCount}`}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                            />
                            <p className="text-xs text-gray-400 mt-1.5">
                              Enter page numbers and ranges, comma-separated.
                            </p>
                          </div>
                        )}

                        {previewCount > 0 && (
                          <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 mt-3">
                            {previewCount} page{previewCount !== 1 ? 's' : ''}{' '}
                            will be rotated{' '}
                            {rotation === 180
                              ? '180°'
                              : rotation === 90
                                ? '90° clockwise'
                                : '90° counterclockwise'}
                            .
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {error && status === 'ready' && (
                    <div
                      className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2"
                      role="alert"
                    >
                      <span className="shrink-0">⚠️</span>
                      {error}
                    </div>
                  )}

                  {status === 'ready' && (
                    <button
                      onClick={rotate}
                      disabled={
                        pageTarget === 'custom' && !customInput.trim()
                      }
                      className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-dark font-semibold py-3 px-7 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Rotate PDF →
                    </button>
                  )}

                  {/* Rotating spinner */}
                  {status === 'rotating' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-card flex flex-col items-center gap-4">
                      <SpinnerSvg size={40} />
                      <p className="text-gray-600 font-medium text-sm">
                        Rotating pages…
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <LockSvg /> Processing in your browser
                      </p>
                    </div>
                  )}

                  {/* Done */}
                  {status === 'done' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-4">
                      <h2 className="font-syne font-bold text-dark text-lg flex items-center gap-2">
                        <span className="text-green-500">✓</span> Rotation
                        Applied
                      </h2>

                      {/* AD_SLOT: pre_download_interstitial */}
                      <AdSlot position="pre_download" />

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={triggerDownload}
                          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-dark font-semibold py-3 px-6 rounded-xl transition-colors"
                        >
                          <DownloadSvg /> Download Rotated PDF
                        </button>
                        <button onClick={reset} className="btn-secondary">
                          Rotate Another
                        </button>
                      </div>
                    </div>
                  )}

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

function UploadRotateSvg({ dragging }: { dragging: boolean }) {
  const color = dragging ? '#EAB308' : '#CBD5E1'
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
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )
}

function RotationArrow({
  type,
  active,
}: {
  type: 'left' | 'flip' | 'right'
  active: boolean
}) {
  const color = active ? '#A16207' : '#9CA3AF'
  const shared = {
    width: 32,
    height: 32,
    viewBox: '0 0 24 24' as const,
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  if (type === 'left') {
    return (
      <svg {...shared}>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    )
  }
  if (type === 'right') {
    return (
      <svg {...shared}>
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    )
  }
  // flip / 180°
  return (
    <svg {...shared}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
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
      stroke="#EAB308"
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

function SpinnerSvg({ size = 28 }: { size?: number }) {
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
        stroke="#EAB308"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="#EAB308"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
