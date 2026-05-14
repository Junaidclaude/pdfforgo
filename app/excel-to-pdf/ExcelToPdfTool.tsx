'use client'

import { useState, useRef } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'uploading' | 'converting' | 'done' | 'error'

export default function ExcelToPdfTool() {
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
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setErrorMsg('Please upload an .xlsx, .xls, or .csv file.')
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
      form.append('tool', 'excel-to-pdf')
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
      const outName = match?.[1] ?? file.name.replace(/\.(xlsx?|csv)$/i, '.pdf')

      const url = URL.createObjectURL(blob)
      downloadRef.current = url
      setDownloadUrl(url)
      setOutputFileName(outName)
      setProgress(100)
      setStatus('done')
    } catch (err) {
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

      {(status === 'idle' || status === 'error') && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${
            isDraggingOver
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-green-400 hover:bg-green-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            className="hidden"
            onChange={onFileInputChange}
          />
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-7.5C2.25 9.871 2.871 9 3.75 9H6V6.375A3.375 3.375 0 0 1 9.375 3h5.25A3.375 3.375 0 0 1 18 6.375V9h2.25a1.5 1.5 0 0 1 1.5 1.5v7.5m-16.5 0H18" />
            </svg>
          </div>
          <p className="font-syne font-bold text-dark text-lg mb-1">Drop your spreadsheet here</p>
          <p className="text-gray-500 text-sm">.xlsx, .xls, or .csv · Max 4 MB</p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1 text-xs text-green-700">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Powered by CloudConvert
          </div>
          {status === 'error' && <p className="text-red-500 text-sm mt-4">{errorMsg}</p>}
        </div>
      )}

      {(status === 'uploading' || status === 'converting') && (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-syne font-bold text-dark mb-1">
            {status === 'uploading' ? 'Uploading…' : 'Converting spreadsheet to PDF…'}
          </p>
          <p className="text-gray-500 text-sm mb-4">{fileName} · {(fileSize / 1024).toFixed(0)} KB</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-3">This usually takes 5–20 seconds depending on spreadsheet size</p>
        </div>
      )}

      {status === 'done' && downloadUrl && (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p className="font-syne font-bold text-dark text-xl mb-1">Conversion complete!</p>
          <p className="text-gray-500 text-sm mb-6">{fileName} → PDF</p>

          <AdSlot position="pre_download" />

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <a
              href={downloadUrl}
              download={outputFileName}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors"
            >
              Download PDF
            </a>
            <button
              onClick={reset}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Convert Another
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-4 text-sm text-green-700 space-y-1">
        <p><strong>Note:</strong> Excel to PDF conversion is powered by CloudConvert. Formatting, formulas, charts, and merged cells are preserved in the output.</p>
        <p>All sheets are included in the PDF by default. Your file is securely transmitted and automatically deleted from CloudConvert servers after conversion.</p>
        <p className="text-green-500">Maximum file size: 4 MB · 25 free conversions per day.</p>
      </div>

      <AdSlot position="footer" />
    </div>
  )
}
