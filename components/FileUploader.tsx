'use client'

import { useState, useRef, useCallback } from 'react'
import { STANDARD_MAX_FILE_BYTES } from '@/lib/limits'

interface FileUploaderProps {
  accept?: string
  maxFiles?: number
  label?: string
  onFilesSelected: (files: File[]) => void
}

const LARGE_FILE_BYTES = STANDARD_MAX_FILE_BYTES

export default function FileUploader({
  accept = '.pdf',
  maxFiles = 1,
  label = 'Drop your PDF here',
  onFilesSelected,
}: FileUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptedExts = accept
    .split(',')
    .map((s) => s.trim().toLowerCase())

  const processFiles = useCallback(
    (incoming: File[]) => {
      setError(null)

      const valid = incoming.filter((f) => {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase()
        return acceptedExts.includes(ext)
      })

      if (valid.length < incoming.length) {
        setError(
          `Some files were skipped — only ${accept} files are accepted.`
        )
      }

      const capped = valid.slice(0, maxFiles)
      setFiles(capped)
      onFilesSelected(capped)
    },
    [accept, acceptedExts, maxFiles, onFilesSelected]
  )

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files ?? []))
  }

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFiles([])
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasLargeFile = files.some((f) => f.size > LARGE_FILE_BYTES)

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="File upload area"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer',
          'select-none transition-all duration-200 outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          dragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : files.length > 0
            ? 'border-green-400 bg-green-50'
            : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/[0.02]',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={onChange}
          className="hidden"
          aria-hidden="true"
        />

        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-center gap-3"
              >
                <FileDocIcon />
                <div className="text-left min-w-0">
                  <p className="text-dark font-medium text-sm truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-gray-400 text-xs">{fmt(file.size)}</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={reset}
              className="text-xs text-gray-400 hover:text-primary underline mt-2 block mx-auto"
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <div>
            <UploadIcon dragging={dragging} />
            <p className="mt-4 font-syne font-bold text-dark text-lg">
              {label}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              or{' '}
              <span className="text-primary underline">click to browse</span>
            </p>
            <p className="text-gray-300 text-xs mt-3">
              Supported:{' '}
              {accept
                .toUpperCase()
                .split(',')
                .map((s) => s.trim().replace('.', ''))
                .join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Validation error */}
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5" role="alert">
          <span aria-hidden="true">⚠️</span>
          {error}
        </p>
      )}

      {/* Large file warning */}
      {hasLargeFile && (
        <div
          className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700 flex items-start gap-2"
          role="status"
        >
          <span className="mt-0.5 shrink-0" aria-hidden="true">⚠️</span>
          <span>
            Large file detected (&gt;50 MB). Processing may take a moment.
            Consider running{' '}
            <a href="/compress-pdf" className="underline font-medium">
              Compress PDF
            </a>{' '}
            first for faster results.
          </span>
        </div>
      )}

      {/* Privacy badge */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <LockIcon />
        Your file never leaves your browser — 100% private
      </div>
    </div>
  )
}

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

function FileDocIcon() {
  return (
    <svg
      width="24"
      height="24"
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

function UploadIcon({ dragging }: { dragging: boolean }) {
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

function LockIcon() {
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
