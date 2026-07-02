'use client'

import { useState, useRef } from 'react'
import AdSlot from '@/components/AdSlot'
import { STANDARD_MAX_FILE_BYTES, STANDARD_MAX_FILE_LABEL } from '@/lib/limits'

type Status = 'idle' | 'converting' | 'done' | 'error'

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

      // Parse spreadsheet with SheetJS
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
      setProgress(35)

      // Convert each sheet to an HTML table
      let combinedHtml = ''
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName]
        const tableHtml = XLSX.utils.sheet_to_html(sheet, { id: `sheet-${sheetName}` })
        combinedHtml += `
          <div class="sheet-wrapper">
            <div class="sheet-name">${sheetName}</div>
            ${tableHtml}
          </div>
        `
      }
      setProgress(45)

      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      setProgress(55)

      // Render in hidden container at A4 landscape width for wide tables
      const container = document.createElement('div')
      container.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:0',
        'width:1122px', 'background:#fff',
        'font-family:Arial,sans-serif', 'font-size:10pt',
        'line-height:1.4', 'color:#000',
        'padding:32px', 'box-sizing:border-box',
      ].join(';')
      container.innerHTML = `
        <style>
          .sheet-wrapper{margin-bottom:32px}
          .sheet-name{font-size:13pt;font-weight:bold;margin-bottom:10px;color:#333;
            padding-bottom:6px;border-bottom:2px solid #1e40af}
          table{border-collapse:collapse;width:100%;table-layout:auto}
          td,th{border:1px solid #d1d5db;padding:5px 8px;font-size:9.5pt;
            vertical-align:top;word-break:break-word;max-width:200px}
          th,thead td{background:#1e40af;color:#fff;font-weight:bold;text-align:left}
          tr:nth-child(even) td{background:#f8faff}
          tr:hover td{background:#e8f0fe}
        </style>
        ${combinedHtml}
      `
      document.body.appendChild(container)
      setProgress(65)

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1122,
      })
      document.body.removeChild(container)
      setProgress(78)

      // Use landscape A4 for wide spreadsheets
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = 297
      const pageH = 210
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
      setOutputFileName(file.name.replace(/\.(xlsx?|csv)$/i, '.pdf'))
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
          <p className="font-display font-bold text-ink text-lg mb-1">Drop your spreadsheet here</p>
          <p className="text-mute text-sm">.xlsx, .xls, or .csv · Max 50 MB</p>
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
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-display font-bold text-ink mb-1">Converting spreadsheet to PDF…</p>
          <p className="text-mute text-sm mb-4">{fileName} · {(fileSize / 1024).toFixed(0)} KB</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-display font-bold py-3 px-6 rounded-xl text-center transition-colors"
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

      <div className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-4 text-sm text-green-700 space-y-1">
        <p><strong>100% private:</strong> Your spreadsheet is converted entirely in your browser using SheetJS. Nothing is uploaded to any server.</p>
        <p>All sheets are included in the PDF. Output is landscape A4 format for optimal table display. Charts and conditional formatting are not rendered.</p>
      </div>

      {/* AD_SLOT: footer_banner */}
      <AdSlot position="footer" />
    </div>
  )
}
