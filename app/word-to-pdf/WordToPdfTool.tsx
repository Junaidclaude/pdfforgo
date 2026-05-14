'use client'

import { useState, useRef } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'uploading' | 'converting' | 'done' | 'error'

export default function WordToPdfTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [outputFileName, setOutputFileName] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const downloadRef = useRef<string>('')

  const convert = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!['doc', 'docx'].includes(ext)) {
      setErrorMsg('Please upload a .docx or .doc file.')
      setStatus('error')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('File too large. Maximum size is 4 MB on the free plan.')
      setStatus('error')
      return
    }

    setFileName(file.name)
    setFileSize(file.size)
    setStatus('uploading')
    setProgress(10)
    setErrorMsg('')
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = '' }

    try {
      const form = new FormData()
      form.append('tool', 'word-to-pdf')
      form.append('file', file)

      setStatus('converting')
      setProgress(30)

      const res = await fetch('/api/convert', { method: 'POST', body: form })
      setProgress(90)

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Conversion failed.' }))
        throw new Error(data.error ?? 'Conversion failed.')
      }

      const blob = await res.blob()
      const contentDisposition = res.headers.get('Content-Disposition') ?? ''
      const match = contentDisposition.match(/filename="([^"]+)"/)
      const outName = match?.[1] ?? file.name.replace(/\.(docx?)/i, '.pdf')

      const url = URL.createObjectURL(blob)
      downloadRef.current = url
      setDownloadUrl(url)
      setOutputFileName(outName)
      setProgress(100)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Conversion failed. Please try again.')
      setStatus('error')
    }
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { convert(e.target.files[0]); e.target.value = '' }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingOver(false)
    if (e.dataTransfer.files[0]) convert(e.dataTransfer.files[0])
  }

  const reset = () => {
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = '' }
    setStatus('idle'); setFileName(''); setFileSize(0); setProgress(0)
    setErrorMsg(''); setDownloadUrl(''); setOutputFileName('')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <AdSlot position="header" />

      {/* Drop zone */}
      {(status === 'idle' || status === 'error') && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/30'}`}
        >
          <input ref={fileInputRef} type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={onFileInputChange} />
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="font-syne font-bold text-dark text-lg mb-1">Drop your Word document here</p>
          <p className="text-gray-500 text-sm">.docx or .doc · Max 4 MB</p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-600">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            Powered by CloudConvert
          </div>
          {status === 'error' && <p className="text-red-500 text-sm mt-4">{errorMsg}</p>}
        </div>
      )}

      {/* Converting state */}
      {(status === 'uploading' || status === 'converting') && (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-syne font-bold text-dark mb-1">{status === 'uploading' ? 'Uploading…' : 'Converting to PDF…'}</p>
          <p className="text-gray-500 text-sm mb-4">{fileName} · {(fileSize / 1024).toFixed(0)} KB</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-3">This usually takes 5–15 seconds</p>
        </div>
      )}

      {/* Done */}
      {status === 'done' && downloadUrl && (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          </div>
          <p className="font-syne font-bold text-dark text-xl mb-1">Conversion complete!</p>
          <p className="text-gray-500 text-sm mb-6">{fileName} → PDF</p>

          <AdSlot position="pre_download" />

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <a href={downloadUrl} download={outputFileName} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors">
              Download PDF
            </a>
            <button onClick={reset} className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-xl transition-colors">
              Convert Another
            </button>
          </div>
        </div>
      )}

      {/* Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
        <strong>Note:</strong> Word to PDF conversion is powered by CloudConvert. Your file is securely transmitted and automatically deleted from their servers after conversion.
        Maximum file size: 4 MB. 25 free conversions per day.
      </div>

      <AdSlot position="footer" />
    </div>
  )
}
