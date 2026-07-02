'use client'

import { useState, useRef } from 'react'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'
import { STANDARD_MAX_FILE_BYTES, STANDARD_MAX_FILE_LABEL } from '@/lib/limits'
import { ocrPdfPages, ocrResultsToText, buildSearchablePdf, type OcrPageResult } from '@/lib/ocr'

type Status = 'idle' | 'processing' | 'done' | 'error'

export default function OcrPdfTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [results, setResults] = useState<OcrPageResult[]>([])
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const text = results.length > 0 ? ocrResultsToText(results) : ''

  const process = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file.')
      setStatus('error')
      return
    }
    if (file.size > STANDARD_MAX_FILE_BYTES) {
      setErrorMsg(`File too large. Maximum size is ${STANDARD_MAX_FILE_LABEL}.`)
      setStatus('error')
      return
    }

    setFileName(file.name)
    setStatus('processing')
    setProgress(0)
    setProgressLabel('Loading PDF…')
    setErrorMsg('')
    setResults([])

    try {
      const buffer = await file.arrayBuffer()
      setFileBytes(buffer)

      const pdfjs = await getPdfjs()
      const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise
      const pageNumbers = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1)

      const pageResults = await ocrPdfPages(pdfDoc, pageNumbers, (done, total) => {
        setProgress(Math.round((done / total) * 100))
        setProgressLabel(`Reading page ${done} of ${total}…`)
      })

      if (pageResults.every((r) => r.lines.length === 0)) {
        setErrorMsg('No text found. The pages may be blank, or the scan quality may be too low to read.')
        setStatus('error')
        return
      }

      setResults(pageResults)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'OCR failed. Please try again.')
      setStatus('error')
    }
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { process(e.target.files[0]); e.target.value = '' }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingOver(false)
    if (e.dataTransfer.files[0]) process(e.dataTransfer.files[0])
  }

  const reset = () => {
    setStatus('idle'); setFileName(''); setFileBytes(null); setProgress(0)
    setProgressLabel(''); setErrorMsg(''); setResults([]); setCopied(false)
  }

  const copyText = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName.replace(/\.pdf$/i, '.txt')
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  const downloadSearchablePdf = async () => {
    if (!fileBytes) return
    const out = await buildSearchablePdf(fileBytes, results)
    const blob = new Blob([new Uint8Array(out).buffer as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName.replace(/\.pdf$/i, '-searchable.pdf')
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
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
            isDraggingOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileInputChange} />
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <p className="font-display font-bold text-ink text-lg mb-1">Drop your scanned PDF here</p>
          <p className="text-mute text-sm">PDF files only · Max {STANDARD_MAX_FILE_LABEL}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1 text-xs text-green-700">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Your file never leaves your browser
          </div>
          {status === 'error' && <p className="text-red-500 text-sm mt-4">{errorMsg}</p>}
        </div>
      )}

      {status === 'processing' && (
        <div className="bg-white rounded-2xl border border-line p-8 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-display font-bold text-ink mb-1">{progressLabel || 'Running OCR…'}</p>
          <p className="text-mute text-sm mb-4">{fileName}</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-mute mt-3">Processing entirely in your browser — no uploads. Large or multi-page scans can take a minute.</p>
        </div>
      )}

      {status === 'done' && (
        <div className="bg-white rounded-2xl border border-line p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="font-display font-bold text-ink text-xl mb-1">Text extracted!</p>
            <p className="text-mute text-sm">{fileName} · {results.length} page{results.length !== 1 ? 's' : ''} scanned</p>
          </div>

          <AdSlot position="pre_download" />

          <textarea
            readOnly
            value={text}
            className="w-full h-56 mt-4 p-4 rounded-xl border border-line bg-gray-50 text-sm text-ink font-mono resize-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <button onClick={copyText} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button onClick={downloadText} className="bg-gray-100 hover:bg-gray-200 text-ink font-semibold py-3 px-4 rounded-xl transition-colors">
              Download .txt
            </button>
            <button onClick={downloadSearchablePdf} className="bg-gray-100 hover:bg-gray-200 text-ink font-semibold py-3 px-4 rounded-xl transition-colors">
              Download Searchable PDF
            </button>
          </div>
          <button onClick={reset} className="w-full mt-3 text-sm text-mute hover:text-ink transition-colors py-2">
            OCR another PDF
          </button>
        </div>
      )}

      <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-700 space-y-1">
        <p><strong>100% private:</strong> OCR runs entirely in your browser using Tesseract.js. Nothing is uploaded to any server.</p>
        <p>Best results come from clear, upright scans in English. Handwriting, very low-resolution scans, and skewed pages will reduce accuracy.</p>
      </div>

      <AdSlot position="footer" />
    </div>
  )
}
