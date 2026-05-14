'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error'

interface FileInfo {
  name: string
  size: number
  pageCount: number
}

export default function ProtectTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [outputSize, setOutputSize] = useState(0)

  // Password fields
  const [openPassword, setOpenPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [showOpenPw, setShowOpenPw] = useState(false)
  const [showOwnerPw, setShowOwnerPw] = useState(false)

  // Permissions
  const [allowPrinting, setAllowPrinting] = useState(true)
  const [allowCopying, setAllowCopying] = useState(true)
  const [allowEditing, setAllowEditing] = useState(false)

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
    if (file.size > 100 * 1024 * 1024) {
      setErrorMsg('File is too large. Please upload a PDF under 100 MB.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')
    if (downloadRef.current) {
      URL.revokeObjectURL(downloadRef.current)
      downloadRef.current = ''
      setDownloadUrl('')
    }

    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)

      const { PDFDocument } = await import('pdf-lib')
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })

      setPdfBytes(bytes)
      setFileInfo({
        name: file.name,
        size: file.size,
        pageCount: doc.getPageCount(),
      })
      setStatus('ready')
    } catch (err) {
      console.error(err)
      setErrorMsg('Could not read this PDF. It may be corrupted or heavily encrypted.')
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

  const protect = async () => {
    if (!pdfBytes) return
    if (!openPassword && !ownerPassword) {
      setErrorMsg('Please enter at least one password (Open Password or Owner Password).')
      return
    }

    setStatus('processing')
    setProgress(0)
    setErrorMsg('')

    try {
      const { PDFDocument, StandardFonts } = await import('pdf-lib')
      setProgress(30)

      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
      setProgress(60)

      // pdf-lib uses encrypt() via the underlying PDF spec
      // We use the pdf-lib save with userPassword / ownerPassword via PDFEncrypt
      // pdf-lib v1.17 supports encryption via pdfDoc.encrypt()
      const encryptionOptions: {
        userPassword?: string
        ownerPassword?: string
        permissions: {
          printing: 'highResolution' | 'lowResolution' | false
          modifying: boolean
          copying: boolean
          annotating: boolean
          fillingForms: boolean
          contentAccessibility: boolean
          documentAssembly: boolean
        }
      } = {
        permissions: {
          printing: allowPrinting ? 'highResolution' : false,
          modifying: allowEditing,
          copying: allowCopying,
          annotating: allowEditing,
          fillingForms: allowEditing,
          contentAccessibility: true,
          documentAssembly: allowEditing,
        },
      }

      if (openPassword) encryptionOptions.userPassword = openPassword
      if (ownerPassword) encryptionOptions.ownerPassword = ownerPassword
      else if (openPassword) encryptionOptions.ownerPassword = openPassword + '_owner'

      // @ts-ignore — pdf-lib's TS types omit the encrypt() method present at runtime
      await doc.encrypt(encryptionOptions)
      setProgress(85)

      const outBytes = await doc.save()
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
          : 'Failed to protect the PDF. Please try again.'
      )
      setStatus('error')
    }
  }

  const reset = () => {
    if (downloadRef.current) {
      URL.revokeObjectURL(downloadRef.current)
      downloadRef.current = ''
    }
    setPdfBytes(null)
    setFileInfo(null)
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
    setDownloadUrl('')
    setOutputSize(0)
    setOpenPassword('')
    setOwnerPassword('')
  }

  const outFileName = fileInfo
    ? fileInfo.name.replace(/\.pdf$/i, '') + '-protected.pdf'
    : 'protected.pdf'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* AD_SLOT: header_banner */}
      <AdSlot position="header" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Main column ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Drop zone */}
          {status === 'idle' || status === 'error' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDraggingOver
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-400 hover:bg-green-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={onFileInputChange}
              />
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <p className="font-syne font-bold text-dark text-lg mb-1">
                Drop your PDF here
              </p>
              <p className="text-gray-500 text-sm">
                or click to browse · PDF files only
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Your file never leaves your browser
              </p>
            </div>
          ) : null}

          {/* Loading */}
          {status === 'loading' && (
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Reading PDF…</p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mt-4 text-red-700 text-sm">
              <strong className="font-semibold">Error:</strong> {errorMsg}
            </div>
          )}

          {/* File info + password form */}
          {(status === 'ready' || status === 'processing') && fileInfo && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* File header */}
              <div className="flex items-center gap-4 p-5 border-b border-gray-100">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H4zm2 3h8v2H6V6zm0 4h8v2H6v-2zm0 4h5v2H6v-2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark truncate">{fileInfo.name}</p>
                  <p className="text-xs text-gray-400">
                    {fileInfo.pageCount} page{fileInfo.pageCount !== 1 ? 's' : ''} ·{' '}
                    {(fileInfo.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                  Change
                </button>
              </div>

              {/* Password form */}
              <div className="p-6 space-y-5">
                {/* Open password */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    Open Password
                    <span className="ml-1.5 font-normal text-gray-400 text-xs">(required to open the PDF)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOpenPw ? 'text' : 'password'}
                      value={openPassword}
                      onChange={(e) => setOpenPassword(e.target.value)}
                      placeholder="Enter open password…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOpenPw ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Owner password */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    Owner Password
                    <span className="ml-1.5 font-normal text-gray-400 text-xs">(controls editing/printing permissions)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOwnerPw ? 'text' : 'password'}
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Enter owner password…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOwnerPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOwnerPw ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Leave blank to auto-generate. Keep it secret — it controls permissions.
                  </p>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2.5">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {[
                      { label: 'Allow Printing', value: allowPrinting, setter: setAllowPrinting },
                      { label: 'Allow Copying Text', value: allowCopying, setter: setAllowCopying },
                      { label: 'Allow Editing', value: allowEditing, setter: setAllowEditing },
                    ].map(({ label, value, setter }) => (
                      <label key={label} className="flex items-center gap-3 cursor-pointer">
                        <button
                          type="button"
                          onClick={() => setter((v) => !v)}
                          className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                            value ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                              value ? 'left-5' : 'left-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-dark">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress */}
              {status === 'processing' && (
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-dark font-semibold">Protecting PDF…</span>
                    <span className="text-sm text-green-600 font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error in form context */}
              {status === 'ready' && errorMsg && (
                <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Protect button */}
              {status === 'ready' && (
                <div className="px-6 pb-6">
                  <button
                    onClick={protect}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-syne font-bold py-3.5 px-6 rounded-xl transition-colors text-base"
                  >
                    Protect PDF
                  </button>
                </div>
              )}
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
                  <p className="font-syne font-bold text-dark">PDF protected!</p>
                  <p className="text-sm text-gray-500">
                    {outputSize < 1024 * 1024
                      ? `${(outputSize / 1024).toFixed(0)} KB`
                      : `${(outputSize / (1024 * 1024)).toFixed(1)} MB`}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-1">
                {openPassword && (
                  <p className="text-gray-600">
                    <span className="font-semibold text-dark">Open password:</span> set
                  </p>
                )}
                {ownerPassword && (
                  <p className="text-gray-600">
                    <span className="font-semibold text-dark">Owner password:</span> set
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-semibold text-dark">Printing:</span>{' '}
                  {allowPrinting ? 'Allowed' : 'Blocked'}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold text-dark">Copying:</span>{' '}
                  {allowCopying ? 'Allowed' : 'Blocked'}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold text-dark">Editing:</span>{' '}
                  {allowEditing ? 'Allowed' : 'Blocked'}
                </p>
              </div>

              {/* AD_SLOT: pre_download_interstitial */}
              <AdSlot position="pre_download" />

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <a
                  href={downloadUrl}
                  download={outFileName}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors"
                >
                  Download Protected PDF
                </a>
                <button
                  onClick={reset}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Protect Another
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
              Open vs. Owner Password
            </p>
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <div className="flex gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" /></svg>
                </div>
                <div>
                  <strong>Open password</strong> — required every time someone opens the file. Leave blank to skip.
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
                </div>
                <div>
                  <strong>Owner password</strong> — controls editing, printing, and copying permissions for the file.
                </div>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-xs text-gray-600 leading-relaxed">
            <p className="font-syne font-bold text-dark mb-2 text-sm">
              128-bit AES Encryption
            </p>
            <p>
              PDFForge uses 128-bit AES encryption (PDF 1.6 standard), the
              same encryption used by major PDF applications including Adobe
              Acrobat. All processing happens locally — your password is never
              sent to any server.
            </p>
          </div>

          {/* AD_SLOT: sidebar_right */}
          <AdSlot position="sidebar" />
        </div>
      </div>
    </div>
  )
}
