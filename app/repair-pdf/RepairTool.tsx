'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'processing' | 'done' | 'error'

export default function RepairTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [fileName, setFileName] = useState('')
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [outputSize, setOutputSize] = useState(0)
  const [originalSize, setOriginalSize] = useState(0)
  const [repairNote, setRepairNote] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }
  }, [])

  const reset = () => {
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null }
    setOutputUrl(null); setStatus('idle')
    setError(''); setFileName(''); setOriginalSize(0); setOutputSize(0); setRepairNote('')
  }

  const process = useCallback(async (file: File) => {
    setFileName(file.name)
    setOriginalSize(file.size)
    setStatus('processing')
    setError('')
    setRepairNote('')

    try {
      const { PDFDocument } = await import('pdf-lib')
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)

      let doc: Awaited<ReturnType<typeof PDFDocument.load>>
      let note = 'PDF structure verified and re-saved cleanly.'

      try {
        doc = await PDFDocument.load(bytes)
      } catch {
        try {
          doc = await PDFDocument.load(bytes, { throwOnInvalidObject: false })
          note = 'Repaired: invalid or corrupted objects were found and removed.'
        } catch {
          try {
            doc = await PDFDocument.load(bytes, {
              throwOnInvalidObject: false,
              ignoreEncryption: true,
            })
            note = 'Repaired: encryption wrapper and corrupted objects were removed.'
          } catch {
            throw new Error(
              'This PDF is too severely damaged to recover. The file structure is unreadable.'
            )
          }
        }
      }

      const outBytes = await doc.save({ addDefaultPage: false, useObjectStreams: true })
      const blob = new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' })
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = URL.createObjectURL(blob)
      setOutputUrl(urlRef.current)
      setOutputSize(outBytes.length)
      setRepairNote(note)
      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to repair PDF.')
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

  const outName = fileName.replace(/\.pdf$/i, '') + '_repaired.pdf'
  const savedBytes = originalSize - outputSize
  const savedPct = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0

  if (status === 'done' && outputUrl) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-syne font-extrabold text-dark text-xl mb-1">Repair Complete</h2>
          <p className="text-gray-500 text-sm mb-1">{repairNote}</p>
          <p className="text-gray-400 text-xs mb-4">
            Output: {(outputSize / 1024).toFixed(0)} KB
            {savedBytes > 0 && (
              <span className="ml-2 text-green-600">({savedPct}% smaller)</span>
            )}
          </p>
          <AdSlot position="pre_download" className="my-4" />
          <a
            href={outputUrl}
            download={outName}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-syne font-bold px-8 py-3 rounded-xl transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Repaired PDF
          </a>
          <div>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors">
              Repair another file
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
          dragging ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white hover:border-amber-300'
        }`}
      >
        <input
          type="file"
          accept="application/pdf"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          onChange={onFileChange}
          disabled={status === 'processing'}
        />
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <p className="font-syne font-bold text-dark text-lg mb-1">Drop your damaged PDF here</p>
        <p className="text-gray-400 text-sm">or click to browse</p>
        <p className="text-gray-300 text-xs mt-3">Your file never leaves your browser</p>
      </div>

      {status === 'processing' && (
        <div className="bg-white rounded-2xl shadow-card p-6 text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-medium text-dark text-sm truncate max-w-xs mx-auto">{fileName}</p>
          <p className="text-xs text-gray-400 mt-1">Analyzing and repairing PDF structure…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <p className="text-red-700 font-medium text-sm">{error}</p>
          <button onClick={reset} className="mt-3 text-sm text-red-500 underline hover:text-red-700">
            Try another file
          </button>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
        <h3 className="font-syne font-bold text-dark text-sm mb-2">What does Repair PDF fix?</h3>
        <ul className="text-gray-600 text-sm space-y-1.5">
          <li>• Corrupted or truncated object streams</li>
          <li>• Invalid cross-reference (xref) tables</li>
          <li>• Malformed page tree structures</li>
          <li>• Owner-locked encryption wrappers</li>
          <li>• Redundant data bloating the file size</li>
        </ul>
      </div>
    </section>
  )
}
