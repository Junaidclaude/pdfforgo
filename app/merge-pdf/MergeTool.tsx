'use client'

import { useState, useRef, useCallback, DragEvent } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'merging' | 'done' | 'error'

interface FileItem {
  id: string
  file: File
}

export default function MergeTool() {
  const [items, setItems] = useState<FileItem[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [zoneDragging, setZoneDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const addMoreRef = useRef<HTMLInputElement>(null)
  const dragFrom = useRef<number | null>(null)

  const addFiles = useCallback((incoming: File[]) => {
    const pdfs = incoming.filter((f) =>
      f.name.toLowerCase().endsWith('.pdf')
    )
    if (!pdfs.length) return
    setItems((prev) => [
      ...prev,
      ...pdfs.map((f) => ({ id: crypto.randomUUID(), file: f })),
    ])
    setStatus('idle')
    setDownloadUrl(null)
    setError(null)
  }, [])

  // ── Drop zone ──────────────────────────────────────────────
  const onZoneDragOver = (e: DragEvent) => {
    e.preventDefault()
    setZoneDragging(true)
  }
  const onZoneDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setZoneDragging(false)
  }
  const onZoneDrop = (e: DragEvent) => {
    e.preventDefault()
    setZoneDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  // ── List drag-to-reorder ───────────────────────────────────
  const onItemDragStart = (i: number) => {
    dragFrom.current = i
  }
  const onItemDragOver = (e: DragEvent, i: number) => {
    e.preventDefault()
    setDragOver(i)
  }
  const onItemDrop = (e: DragEvent, toIndex: number) => {
    e.preventDefault()
    const from = dragFrom.current
    setDragOver(null)
    if (from === null || from === toIndex) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
    dragFrom.current = null
  }
  const onItemDragEnd = () => {
    dragFrom.current = null
    setDragOver(null)
  }

  const removeFile = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setDownloadUrl(null)
    if (status === 'done') setStatus('idle')
  }

  // ── Merge ──────────────────────────────────────────────────
  const merge = async () => {
    if (items.length < 2) {
      setError('Add at least 2 PDF files to merge.')
      return
    }
    setStatus('merging')
    setProgress(0)
    setError(null)

    try {
      const { PDFDocument } = await import('pdf-lib')
      const merged = await PDFDocument.create()

      for (let i = 0; i < items.length; i++) {
        const bytes = await items[i].file.arrayBuffer()
        const src = await PDFDocument.load(bytes, {
          ignoreEncryption: true,
        })
        const copied = await merged.copyPages(src, src.getPageIndices())
        copied.forEach((p) => merged.addPage(p))
        setProgress(Math.round(((i + 1) / items.length) * 90))
      }

      const out = await merged.save()
      setProgress(100)

      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      const blob = new Blob([new Uint8Array(out)], { type: 'application/pdf' })
      setDownloadUrl(URL.createObjectURL(blob))
      setStatus('done')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to merge PDFs. Make sure all files are valid PDFs and try again.'
      )
      setStatus('error')
    }
  }

  const triggerDownload = () => {
    if (!downloadUrl) return
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = 'merged.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const reset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setItems([])
    setStatus('idle')
    setProgress(0)
    setError(null)
    setDownloadUrl(null)
  }

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
          {/* ── Main column ─────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Drop PDF files here or click to browse"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  items.length === 0
                    ? fileInputRef.current?.click()
                    : addMoreRef.current?.click()
                }
              }}
              onDragOver={onZoneDragOver}
              onDragLeave={onZoneDragLeave}
              onDrop={onZoneDrop}
              onClick={() =>
                items.length === 0
                  ? fileInputRef.current?.click()
                  : addMoreRef.current?.click()
              }
              className={[
                'border-2 border-dashed rounded-2xl text-center cursor-pointer',
                'transition-all duration-200 select-none outline-none',
                'focus-visible:ring-2 focus-visible:ring-primary',
                items.length === 0 ? 'p-12' : 'py-4 px-6',
                zoneDragging
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/[0.02]',
              ].join(' ')}
            >
              {/* Hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(Array.from(e.target.files ?? []))
                  e.target.value = ''
                }}
              />
              <input
                ref={addMoreRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(Array.from(e.target.files ?? []))
                  e.target.value = ''
                }}
              />

              {items.length === 0 ? (
                <>
                  <UploadSvg dragging={zoneDragging} />
                  <p className="mt-4 font-syne font-bold text-dark text-xl">
                    Drop PDF files here
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    or{' '}
                    <span className="text-primary underline">
                      click to browse
                    </span>
                  </p>
                  <p className="text-gray-300 text-xs mt-3">
                    PDF only · up to 20 files
                  </p>
                </>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                  <PlusSvg /> Add More PDFs
                </span>
              )}
            </div>

            {/* Privacy badge */}
            <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1.5">
              <LockSvg /> Your files never leave your browser — 100% private
            </p>

            {/* ── File list ─────────────────────────────── */}
            {items.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-500">
                    {items.length} file{items.length !== 1 ? 's' : ''}{' '}
                    &middot; drag rows to reorder
                  </p>
                  <button
                    onClick={reset}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li
                      key={item.id}
                      draggable={status !== 'merging'}
                      onDragStart={() => onItemDragStart(i)}
                      onDragOver={(e) => onItemDragOver(e, i)}
                      onDrop={(e) => onItemDrop(e, i)}
                      onDragEnd={onItemDragEnd}
                      className={[
                        'flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all duration-150',
                        dragOver === i
                          ? 'border-primary/60 shadow-md scale-[1.01] bg-primary/[0.02]'
                          : 'border-gray-100 hover:border-primary/30',
                        status !== 'merging'
                          ? 'cursor-grab active:cursor-grabbing'
                          : 'cursor-default opacity-80',
                      ].join(' ')}
                    >
                      <DragHandle />
                      <PdfFileSvg />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {fmtSize(item.file.size)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 font-mono w-5 text-center shrink-0">
                        {i + 1}
                      </span>
                      {status !== 'merging' && (
                        <button
                          onClick={() => removeFile(item.id)}
                          aria-label={`Remove ${item.file.name}`}
                          className="text-gray-300 hover:text-red-400 transition-colors shrink-0 p-1"
                        >
                          <XSvg />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Progress bar */}
                {status === 'merging' && (
                  <div className="mt-5">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Merging in your browser…</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div
                    className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2"
                    role="alert"
                  >
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    {error}
                  </div>
                )}

                {/* AD_SLOT: pre_download_interstitial */}
                {status === 'done' && (
                  <AdSlot position="pre_download" className="mt-5" />
                )}

                {/* Action buttons */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {status !== 'done' ? (
                    <>
                      <button
                        onClick={merge}
                        disabled={status === 'merging' || items.length < 2}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {status === 'merging' ? (
                          <>
                            <SpinnerSvg /> Merging…
                          </>
                        ) : (
                          `Merge ${items.length} PDF${items.length !== 1 ? 's' : ''} →`
                        )}
                      </button>
                      {items.length < 2 && status !== 'merging' && (
                        <p className="text-xs text-gray-400">
                          Add at least 2 files
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={triggerDownload}
                        className="btn-primary"
                      >
                        <DownloadSvg /> Download Merged PDF
                      </button>
                      <button onClick={reset} className="btn-secondary">
                        Start Over
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AD_SLOT: sidebar_right (desktop only) */}
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
      stroke={dragging ? '#E84A4A' : '#CBD5E1'}
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

function PlusSvg() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function DragHandle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="#D1D5DB"
      aria-hidden="true"
    >
      <circle cx="5" cy="4" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="11" cy="4" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="11" cy="12" r="1.5" />
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
      stroke="#E84A4A"
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

function XSvg() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SpinnerSvg() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
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
