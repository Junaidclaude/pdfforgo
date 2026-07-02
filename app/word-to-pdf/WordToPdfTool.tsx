'use client'

import { useState, useRef } from 'react'
import AdSlot from '@/components/AdSlot'
import { STANDARD_MAX_FILE_BYTES, STANDARD_MAX_FILE_LABEL } from '@/lib/limits'

type Status = 'idle' | 'converting' | 'done' | 'error'

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
    if (file.size > STANDARD_MAX_FILE_BYTES) {
      setErrorMsg(`File too large. Maximum size is ${STANDARD_MAX_FILE_LABEL}.`)
      setStatus('error')
      return
    }

    setFileName(file.name)
    setFileSize(file.size)
    setStatus('converting')
    setProgress(10)
    setErrorMsg('')
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = '' }

    try {
      const arrayBuffer = await file.arrayBuffer()
      setProgress(20)

      // Convert DOCX → HTML using mammoth
      const mammothMod = await import('mammoth')
      const mammoth = (mammothMod as unknown as { default: typeof mammothMod }).default ?? mammothMod
      const result = await mammoth.convertToHtml({ arrayBuffer })
      setProgress(40)

      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      setProgress(52)

      // Render converted HTML in a styled hidden container at A4 width
      const container = document.createElement('div')
      container.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:0',
        'width:794px', 'background:#fff',
        'font-family:Georgia,serif', 'font-size:12pt',
        'line-height:1.65', 'color:#111',
        'padding:56px 64px', 'box-sizing:border-box',
      ].join(';')
      container.innerHTML = `
        <style>
          h1{font-size:22pt;margin:0 0 14px;font-weight:bold;color:#000}
          h2{font-size:17pt;margin:18px 0 10px;font-weight:bold;color:#111}
          h3{font-size:14pt;margin:14px 0 8px;font-weight:bold;color:#222}
          p{margin:0 0 10px}
          ul,ol{padding-left:28px;margin:0 0 10px}
          li{margin-bottom:4px}
          table{border-collapse:collapse;width:100%;margin:10px 0}
          td,th{border:1px solid #ccc;padding:6px 10px;font-size:11pt}
          th{background:#f0f0f0;font-weight:bold}
          strong,b{font-weight:bold}
          em,i{font-style:italic}
          img{max-width:100%;height:auto}
          blockquote{border-left:4px solid #ccc;padding:6px 16px;margin:10px 0;color:#444}
        </style>
        ${result.value}
      `
      document.body.appendChild(container)
      setProgress(62)

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
      })
      document.body.removeChild(container)
      setProgress(76)

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210
      const pageH = 297
      const pxPerPageH = Math.floor((canvas.width * pageH) / pageW)

      let y = 0
      let page = 0
      while (y < canvas.height) {
        if (page > 0) pdf.addPage()
        const sliceH = Math.min(pxPerPageH, canvas.height - y)
        const slice = document.createElement('canvas')
        slice.width = canvas.width
        slice.height = pxPerPageH
        const ctx = slice.getContext('2d')!
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, slice.width, slice.height)
        ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
        pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST')
        y += pxPerPageH
        page++
      }

      setProgress(92)
      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)
      downloadRef.current = url
      setDownloadUrl(url)
      setOutputFileName(file.name.replace(/\.(docx?)$/i, '.pdf'))
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
      {/* AD_SLOT: header_banner */}
      <AdSlot position="header" />

      {(status === 'idle' || status === 'error') && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${
            isDraggingOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={onFileInputChange}
          />
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="font-display font-bold text-ink text-lg mb-1">Drop your Word document here</p>
          <p className="text-mute text-sm">.docx or .doc · Max 50 MB</p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1 text-xs text-green-700">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Your file never leaves your browser
          </div>
          {status === 'error' && <p className="text-red-500 text-sm mt-4">{errorMsg}</p>}
        </div>
      )}

      {status === 'converting' && (
        <div className="bg-white rounded-2xl border border-line p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-display font-bold text-ink mb-1">Converting to PDF…</p>
          <p className="text-mute text-sm mb-4">{fileName} · {(fileSize / 1024).toFixed(0)} KB</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-mute mt-3">Processing entirely in your browser — no uploads</p>
        </div>
      )}

      {status === 'done' && downloadUrl && (
        <div className="bg-white rounded-2xl border border-line p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p className="font-display font-bold text-ink text-xl mb-1">Conversion complete!</p>
          <p className="text-mute text-sm mb-6">{fileName} → PDF</p>

          {/* AD_SLOT: pre_download_interstitial */}
          <AdSlot position="pre_download" />

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <a
              href={downloadUrl}
              download={outputFileName}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-display font-bold py-3 px-6 rounded-xl text-center transition-colors"
            >
              Download PDF
            </a>
            <button
              onClick={reset}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-ink font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Convert Another
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700 space-y-1">
        <p><strong>100% private:</strong> Your Word document is converted entirely in your browser using mammoth.js. Nothing is uploaded to any server.</p>
        <p>Supports: headings, paragraphs, bold/italic text, lists, tables, and inline images. Complex formatting like columns or custom fonts may be simplified.</p>
      </div>

      {/* AD_SLOT: footer_banner */}
      <AdSlot position="footer" />
    </div>
  )
}
