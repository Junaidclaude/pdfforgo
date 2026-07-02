'use client'

import { useState, useRef } from 'react'
import AdSlot from '@/components/AdSlot'
import { STANDARD_MAX_FILE_BYTES, STANDARD_MAX_FILE_LABEL } from '@/lib/limits'

type Status = 'idle' | 'converting' | 'done' | 'error'

export default function HtmlToPdfTool() {
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
    if (!['html', 'htm'].includes(ext)) {
      setErrorMsg('Please upload an .html or .htm file.')
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
      const htmlText = await file.text()
      setProgress(20)

      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      setProgress(35)

      const container = document.createElement('div')
      container.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:0',
        'width:794px', 'background:#fff',
        'font-family:Arial,sans-serif', 'font-size:12px',
        'line-height:1.6', 'color:#000',
        'padding:40px', 'box-sizing:border-box',
      ].join(';')
      container.innerHTML = htmlText
      document.body.appendChild(container)
      setProgress(45)

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
      })
      document.body.removeChild(container)
      setProgress(65)

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

      setProgress(90)
      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)
      downloadRef.current = url
      setDownloadUrl(url)
      setOutputFileName(file.name.replace(/\.html?$/i, '.pdf'))
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
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,text/html"
            className="hidden"
            onChange={onFileInputChange}
          />
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </div>
          <p className="font-display font-bold text-ink text-lg mb-1">Drop your HTML file here</p>
          <p className="text-mute text-sm">.html or .htm · Max 50 MB</p>
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
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-display font-bold text-ink mb-1">Rendering HTML to PDF…</p>
          <p className="text-mute text-sm mb-4">{fileName} · {(fileSize / 1024).toFixed(0)} KB</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
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
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-display font-bold py-3 px-6 rounded-xl text-center transition-colors"
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
        <p><strong>100% private:</strong> Your HTML is converted entirely in your browser. Nothing is uploaded to any server.</p>
        <p>For best results, use a <strong>self-contained HTML file</strong> with inline CSS. External images or fonts that require network access may not render due to browser security policies.</p>
      </div>

      {/* AD_SLOT: footer_banner */}
      <AdSlot position="footer" />
    </div>
  )
}
