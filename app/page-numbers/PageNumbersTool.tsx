'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error'
type VPosition = 'top' | 'bottom'
type HPosition = 'left' | 'center' | 'right'
type NumberFormat = 'n' | 'Page n' | 'Page n of N' | 'n / N'

interface FileInfo { name: string; size: number; pageCount: number }

export default function PageNumbersTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [outputSize, setOutputSize] = useState(0)

  // Options
  const [vPos, setVPos] = useState<VPosition>('bottom')
  const [hPos, setHPos] = useState<HPosition>('center')
  const [format, setFormat] = useState<NumberFormat>('Page n of N')
  const [startNum, setStartNum] = useState(1)
  const [fontSize, setFontSize] = useState(11)
  const [marginX, setMarginX] = useState(50)
  const [marginY, setMarginY] = useState(30)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const downloadRef = useRef<string>('')

  useEffect(() => { return () => { if (downloadRef.current) URL.revokeObjectURL(downloadRef.current) } }, [])

  const loadFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) { setErrorMsg('Please upload a PDF file.'); setStatus('error'); return }
    setStatus('loading'); setErrorMsg('')
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = ''; setDownloadUrl('') }
    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const { PDFDocument } = await import('pdf-lib')
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setPdfBytes(bytes)
      setFileInfo({ name: file.name, size: file.size, pageCount: doc.getPageCount() })
      setStatus('ready')
    } catch (err) {
      console.error(err)
      setErrorMsg('Could not read this PDF.')
      setStatus('error')
    }
  }, [])

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { loadFile(e.target.files[0]); e.target.value = '' }
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingOver(false)
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0])
  }

  const buildLabel = (pageNum: number, total: number): string => {
    const n = pageNum.toString()
    const N = total.toString()
    return format.replace('n', n).replace('N', N)
  }

  const addNumbers = async () => {
    if (!pdfBytes || !fileInfo) return
    setStatus('processing'); setProgress(0); setErrorMsg('')

    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
      setProgress(20)
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
      const font = await doc.embedFont(StandardFonts.Helvetica)
      setProgress(40)

      const total = doc.getPageCount()
      const pages = doc.getPages()

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const num = startNum + i
        const label = buildLabel(num, total + startNum - 1)
        const textWidth = font.widthOfTextAtSize(label, fontSize)

        let x: number
        if (hPos === 'left') x = marginX
        else if (hPos === 'right') x = width - marginX - textWidth
        else x = (width - textWidth) / 2

        const y = vPos === 'bottom' ? marginY : height - marginY - font.heightAtSize(fontSize)

        page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) })
        setProgress(40 + Math.round((i + 1) / pages.length * 50))
      }

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
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add page numbers.')
      setStatus('error')
    }
  }

  const reset = () => {
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = '' }
    setPdfBytes(null); setFileInfo(null); setStatus('idle')
    setProgress(0); setErrorMsg(''); setDownloadUrl(''); setOutputSize(0)
  }

  const previewLabel = fileInfo ? buildLabel(startNum, fileInfo.pageCount + startNum - 1) : buildLabel(1, 10)
  const outFileName = fileInfo ? fileInfo.name.replace(/\.pdf$/i, '') + '-numbered.pdf' : 'numbered.pdf'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <AdSlot position="header" />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {/* Drop zone */}
          {(status === 'idle' || status === 'error') && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDraggingOver ? 'border-sky-500 bg-sky-50' : 'border-gray-200 bg-white hover:border-sky-400 hover:bg-sky-50/30'}`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileInputChange} />
              <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <p className="font-syne font-bold text-dark text-lg mb-1">Drop your PDF here</p>
              <p className="text-gray-500 text-sm">Page numbers will be added to every page</p>
              {status === 'error' && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}
            </div>
          )}

          {status === 'loading' && (
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Reading PDF…</p>
            </div>
          )}

          {(status === 'ready' || status === 'processing') && fileInfo && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex items-center gap-4 p-5 border-b border-gray-100">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H4zm2 3h8v2H6V6zm0 4h8v2H6v-2zm0 4h5v2H6v-2z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark truncate">{fileInfo.name}</p>
                  <p className="text-xs text-gray-400">{fileInfo.pageCount} pages · {(fileInfo.size / 1024).toFixed(0)} KB</p>
                </div>
                <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Change</button>
              </div>

              {/* Preview */}
              <div className="mx-6 mt-5 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative">
                <p className="text-xs text-gray-400 absolute top-2 right-3">Preview</p>
                <div
                  className="w-full h-full flex items-end justify-center pb-4"
                  style={{ alignItems: vPos === 'top' ? 'flex-start' : 'flex-end', justifyContent: hPos === 'left' ? 'flex-start' : hPos === 'right' ? 'flex-end' : 'center', paddingInline: 16, paddingBlock: 8 }}
                >
                  <span style={{ fontSize: fontSize + 2, color: '#555', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                    {previewLabel}
                  </span>
                </div>
              </div>

              {status === 'processing' && (
                <div className="px-6 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-dark">Adding page numbers…</span>
                    <span className="text-sm text-sky-500 font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {status === 'ready' && errorMsg && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{errorMsg}</div>
              )}

              {status === 'ready' && (
                <div className="px-6 py-5">
                  <button onClick={addNumbers} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-syne font-bold py-3.5 px-6 rounded-xl transition-colors">
                    Add Page Numbers
                  </button>
                </div>
              )}
            </div>
          )}

          {status === 'done' && downloadUrl && fileInfo && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                </div>
                <div>
                  <p className="font-syne font-bold text-dark">Page numbers added!</p>
                  <p className="text-sm text-gray-500">{fileInfo.pageCount} pages · {outputSize < 1024 * 1024 ? `${(outputSize / 1024).toFixed(0)} KB` : `${(outputSize / (1024 * 1024)).toFixed(1)} MB`}</p>
                </div>
              </div>
              <AdSlot position="pre_download" />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <a href={downloadUrl} download={outFileName} className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors">Download PDF</a>
                <button onClick={reset} className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-xl transition-colors">Number Another</button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">🔒 Your file never leaves your browser</p>
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 flex-shrink-0 space-y-5">
          <div className="bg-white rounded-2xl shadow-card p-5 space-y-5">
            <h2 className="font-syne font-bold text-dark text-base">Number Options</h2>

            {/* Format */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Number Format</label>
              <div className="space-y-1.5">
                {(['n', 'Page n', 'Page n of N', 'n / N'] as NumberFormat[]).map((f) => (
                  <button key={f} onClick={() => setFormat(f)} className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition-all ${format === f ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'}`}>
                    <span className="font-mono">{f}</span>
                    <span className="text-xs opacity-70 ml-2">→ {buildLabel(startNum, (fileInfo?.pageCount ?? 10) + startNum - 1)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical position */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Vertical</label>
              <div className="grid grid-cols-2 gap-2">
                {(['top', 'bottom'] as VPosition[]).map((v) => (
                  <button key={v} onClick={() => setVPos(v)} className={`py-2 rounded-lg text-xs font-bold border transition-all capitalize ${vPos === v ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'}`}>{v}</button>
                ))}
              </div>
            </div>

            {/* Horizontal position */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Horizontal</label>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as HPosition[]).map((h) => (
                  <button key={h} onClick={() => setHPos(h)} className={`py-2 rounded-lg text-xs font-bold border transition-all capitalize ${hPos === h ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'}`}>{h}</button>
                ))}
              </div>
            </div>

            {/* Font size + start number */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Font Size: {fontSize}pt</label>
                <input type="range" min={8} max={24} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Start at</label>
                <input type="number" min={1} max={999} value={startNum} onChange={(e) => setStartNum(Math.max(1, parseInt(e.target.value) || 1))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>
            </div>

            {/* Margin */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Margin X: {marginX}pt</label>
                <input type="range" min={10} max={100} value={marginX} onChange={(e) => setMarginX(Number(e.target.value))} className="w-full accent-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Margin Y: {marginY}pt</label>
                <input type="range" min={10} max={100} value={marginY} onChange={(e) => setMarginY(Number(e.target.value))} className="w-full accent-sky-500" />
              </div>
            </div>
          </div>
          <AdSlot position="sidebar" />
        </div>
      </div>
    </div>
  )
}
