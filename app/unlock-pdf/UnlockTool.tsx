'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error'
type LockType = 'none' | 'open' | 'owner' | 'unknown'

interface FileInfo {
  name: string
  size: number
  pageCount: number
  lockType: LockType
}

export default function UnlockTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [outputSize, setOutputSize] = useState(0)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const fileRef = useRef<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const downloadRef = useRef<string>('')

  useEffect(() => {
    return () => {
      if (downloadRef.current) URL.revokeObjectURL(downloadRef.current)
    }
  }, [])

  const loadFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')
    setPassword('')
    if (downloadRef.current) {
      URL.revokeObjectURL(downloadRef.current)
      downloadRef.current = ''
      setDownloadUrl('')
    }

    try {
      const { PDFDocument } = await import('pdf-lib')
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)

      let lockType: LockType = 'none'
      let pageCount = 0

      // Try loading without encryption bypass first to detect lock type
      try {
        const doc = await PDFDocument.load(bytes)
        pageCount = doc.getPageCount()
        lockType = 'none'
      } catch (e) {
        // If it throws, it's encrypted
        try {
          const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
          pageCount = doc.getPageCount()
          // Determine if it needs a password to open (open-password) or only has restrictions
          lockType = 'unknown'
        } catch {
          setErrorMsg('Could not read this PDF. The file may be corrupted.')
          setStatus('error')
          return
        }
      }

      fileRef.current = file
      setFileInfo({ name: file.name, size: file.size, pageCount, lockType })
      setStatus('ready')
    } catch (err) {
      console.error(err)
      setErrorMsg('Could not read this PDF. It may be corrupted.')
      setStatus('error')
    }
  }, [])

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      loadFile(e.target.files[0])
      e.target.value = ''
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }

  const unlock = async () => {
    if (!fileRef.current) return

    setStatus('processing')
    setProgress(0)
    setErrorMsg('')

    try {
      const { PDFDocument } = await import('pdf-lib')
      setProgress(20)

      const buffer = await fileRef.current.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      setProgress(40)

      // Try to load with provided password first (for open-password PDFs)
      let doc
      try {
        if (password) {
          // @ts-ignore — pdf-lib's TS types omit the password LoadOption present at runtime
          doc = await PDFDocument.load(bytes, { password })
        } else {
          doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('encrypted')) {
          setErrorMsg('Incorrect password. Please try again.')
        } else {
          setErrorMsg('Failed to unlock this PDF. If it requires a password, please enter it above.')
        }
        setStatus('ready')
        return
      }

      setProgress(70)

      // Copy all pages into a new unencrypted PDF
      const newDoc = await PDFDocument.create()
      const pages = await newDoc.copyPages(doc, doc.getPageIndices())
      pages.forEach((page) => newDoc.addPage(page))

      setProgress(90)
      const outBytes = await newDoc.save()
      setProgress(100)

      const blob = new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' })
      if (downloadRef.current) URL.revokeObjectURL(downloadRef.current)
      const url = URL.createObjectURL(blob)
      downloadRef.current = url
      setDownloadUrl(url)
      setOutputSize(outBytes.length)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to unlock the PDF. Please try again.'
      )
      setStatus('error')
    }
  }

  const reset = () => {
    if (downloadRef.current) {
      URL.revokeObjectURL(downloadRef.current)
      downloadRef.current = ''
    }
    fileRef.current = null
    setFileInfo(null)
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
    setDownloadUrl('')
    setOutputSize(0)
    setPassword('')
  }

  const outFileName = fileInfo
    ? fileInfo.name.replace(/\.pdf$/i, '') + '-unlocked.pdf'
    : 'unlocked.pdf'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* AD_SLOT: header_banner */}
      <AdSlot position="header" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Main column ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Drop zone */}
          {(status === 'idle' || status === 'error') && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDraggingOver
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={onFileInputChange}
              />
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <p className="font-syne font-bold text-dark text-lg mb-1">
                Drop your locked PDF here
              </p>
              <p className="text-gray-500 text-sm">
                or click to browse · PDF files only
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Your file never leaves your browser
              </p>
            </div>
          )}

          {/* Loading */}
          {status === 'loading' && (
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Reading PDF…</p>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mt-4 text-red-700 text-sm">
              <strong className="font-semibold">Error:</strong> {errorMsg}
            </div>
          )}

          {/* File ready / processing */}
          {(status === 'ready' || status === 'processing') && fileInfo && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* File header */}
              <div className="flex items-center gap-4 p-5 border-b border-gray-100">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark truncate">{fileInfo.name}</p>
                  <p className="text-xs text-gray-400">
                    {fileInfo.pageCount} page{fileInfo.pageCount !== 1 ? 's' : ''} ·{' '}
                    {(fileInfo.size / 1024).toFixed(0)} KB ·{' '}
                    <span className={fileInfo.lockType === 'none' ? 'text-green-600' : 'text-orange-500'}>
                      {fileInfo.lockType === 'none' ? 'No password detected' : 'Encrypted / restricted'}
                    </span>
                  </p>
                </div>
                <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                  Change
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* No lock detected notice */}
                {fileInfo.lockType === 'none' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                    <strong>No password detected.</strong> This PDF doesn&apos;t appear to be
                    password-protected. You can still proceed — this will remove any owner-level
                    restrictions and create a clean copy.
                  </div>
                )}

                {/* Password input */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    Password
                    <span className="ml-1.5 font-normal text-gray-400 text-xs">
                      (enter if the PDF requires one to open)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') unlock() }}
                      placeholder="Enter PDF password…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Leave blank if the PDF only has owner-level restrictions (no open password).
                  </p>
                </div>

                {/* Error inside form */}
                {status === 'ready' && errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                    {errorMsg}
                  </div>
                )}

                {/* Processing progress */}
                {status === 'processing' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-dark font-semibold">Unlocking PDF…</span>
                      <span className="text-sm text-orange-500 font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Unlock button */}
                {status === 'ready' && (
                  <button
                    onClick={unlock}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-syne font-bold py-3.5 px-6 rounded-xl transition-colors text-base"
                  >
                    Unlock PDF
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Done */}
          {status === 'done' && downloadUrl && fileInfo && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-syne font-bold text-dark">PDF unlocked!</p>
                  <p className="text-sm text-gray-500">
                    {outputSize < 1024 * 1024
                      ? `${(outputSize / 1024).toFixed(0)} KB`
                      : `${(outputSize / (1024 * 1024)).toFixed(1)} MB`}
                    {' '}· All restrictions removed
                  </p>
                </div>
              </div>

              {/* AD_SLOT: pre_download_interstitial */}
              <AdSlot position="pre_download" />

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <a
                  href={downloadUrl}
                  download={outFileName}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors"
                >
                  Download Unlocked PDF
                </a>
                <button
                  onClick={reset}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Unlock Another
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">
            🔒 Your file never leaves your browser — 100% private
          </p>
        </div>

        {/* ── Sidebar ──────────────────────────────────── */}
        <div className="lg:w-72 flex-shrink-0 space-y-5">
          {/* Info card */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <p className="font-syne font-bold text-dark mb-3 text-sm">
              What This Tool Removes
            </p>
            <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
              {[
                'Open password (requires re-entry)',
                'Printing restrictions',
                'Copying text restrictions',
                'Editing restrictions',
                'Annotation restrictions',
                'Form-filling restrictions',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Limitation note */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-xs text-gray-600 leading-relaxed">
            <p className="font-syne font-bold text-dark mb-2 text-sm">
              Important Note
            </p>
            <p>
              This tool can remove <strong>owner-level restrictions</strong> without
              a password. For PDFs with an <strong>open password</strong> (required
              to view), you must know the correct password to unlock them.
            </p>
          </div>

          {/* AD_SLOT: sidebar_right */}
          <AdSlot position="sidebar" />
        </div>
      </div>
    </div>
  )
}
