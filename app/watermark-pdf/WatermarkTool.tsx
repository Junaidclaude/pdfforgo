'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error'
type Position = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type Rotation = '0' | '45' | '-45' | '90'

interface FileInfo {
  name: string
  size: number
  pageCount: number
}

const POSITION_MAP: Record<Position, { xRatio: number; yRatio: number }> = {
  'center':       { xRatio: 0.5, yRatio: 0.5 },
  'top-left':     { xRatio: 0.15, yRatio: 0.88 },
  'top-right':    { xRatio: 0.85, yRatio: 0.88 },
  'bottom-left':  { xRatio: 0.15, yRatio: 0.12 },
  'bottom-right': { xRatio: 0.85, yRatio: 0.12 },
}

export default function WatermarkTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [outputSize, setOutputSize] = useState(0)

  // Watermark options
  const [text, setText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(30)
  const [fontSize, setFontSize] = useState(48)
  const [color, setColor] = useState('#E84A4A')
  const [position, setPosition] = useState<Position>('center')
  const [rotation, setRotation] = useState<Rotation>('-45')
  const [pages, setPages] = useState<'all' | 'custom'>('all')
  const [customPages, setCustomPages] = useState('')

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
      setFileInfo({ name: file.name, size: file.size, pageCount: doc.getPageCount() })
      setStatus('ready')
    } catch (err) {
      console.error(err)
      setErrorMsg('Could not read this PDF. It may be corrupted.')
      setStatus('error')
    }
  }, [])

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { loadFile(e.target.files[0]); e.target.value = '' }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingOver(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }

  // Parse page numbers like "1,3,5-8" → 0-indexed array
  const parsePageNums = (input: string, total: number): number[] => {
    const indices = new Set<number>()
    input.split(/[,\s]+/).forEach((part) => {
      const range = part.split('-').map((n) => parseInt(n.trim(), 10))
      if (range.length === 1 && !isNaN(range[0])) {
        const i = range[0] - 1
        if (i >= 0 && i < total) indices.add(i)
      } else if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
        for (let i = range[0] - 1; i <= range[1] - 1 && i < total; i++) {
          if (i >= 0) indices.add(i)
        }
      }
    })
    return Array.from(indices)
  }

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
      : [0.91, 0.29, 0.29]
  }

  const applyWatermark = async () => {
    if (!pdfBytes || !fileInfo || !text.trim()) {
      setErrorMsg('Please enter watermark text.')
      return
    }
    setStatus('processing')
    setProgress(0)
    setErrorMsg('')

    try {
      const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib')
      setProgress(20)

      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
      const font = await doc.embedFont(StandardFonts.HelveticaBold)
      const [r, g, b] = hexToRgb(color)
      const rotDeg = parseFloat(rotation)
      const opacityVal = opacity / 100
      const pos = POSITION_MAP[position]

      const allPages = doc.getPages()
      const targetIndices =
        pages === 'all'
          ? allPages.map((_, i) => i)
          : parsePageNums(customPages, allPages.length)

      for (let i = 0; i < targetIndices.length; i++) {
        const pageIndex = targetIndices[i]
        const page = allPages[pageIndex]
        const { width, height } = page.getSize()

        const textWidth = font.widthOfTextAtSize(text, fontSize)
        const textHeight = font.heightAtSize(fontSize)

        const x = width * pos.xRatio - textWidth / 2
        const y = height * pos.yRatio - textHeight / 2

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: opacityVal,
          rotate: degrees(rotDeg),
        })

        setProgress(20 + Math.round((i + 1) / targetIndices.length * 70))
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
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add watermark. Please try again.')
      setStatus('error')
    }
  }

  const reset = () => {
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = '' }
    setPdfBytes(null); setFileInfo(null); setStatus('idle')
    setProgress(0); setErrorMsg(''); setDownloadUrl(''); setOutputSize(0)
  }

  const outFileName = fileInfo ? fileInfo.name.replace(/\.pdf$/i, '') + '-watermarked.pdf' : 'watermarked.pdf'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <AdSlot position="header" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Main column ──────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Drop zone */}
          {(status === 'idle' || status === 'error') && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDraggingOver ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 bg-white hover:border-cyan-400 hover:bg-cyan-50/30'
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileInputChange} />
              <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className="font-syne font-bold text-dark text-lg mb-1">Drop your PDF here</p>
              <p className="text-gray-500 text-sm">or click to browse · PDF files only</p>
              {status === 'error' && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}
            </div>
          )}

          {status === 'loading' && (
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Reading PDF…</p>
            </div>
          )}

          {/* Ready — show preview + settings */}
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
                  <p className="text-xs text-gray-400">{fileInfo.pageCount} pages · {(fileInfo.size / 1024).toFixed(0)} KB</p>
                </div>
                <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Change</button>
              </div>

              {/* Watermark text preview */}
              <div
                className="mx-6 mt-5 h-28 rounded-xl border-2 border-dashed border-gray-200 relative overflow-hidden flex items-center justify-center bg-gray-50"
              >
                <p className="text-xs text-gray-400 absolute bottom-2 right-3">Preview</p>
                <span
                  style={{
                    fontSize: Math.min(fontSize * 0.6, 40),
                    color: color,
                    opacity: opacity / 100,
                    transform: `rotate(${rotation}deg)`,
                    fontWeight: 'bold',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {text || 'Enter text above'}
                </span>
              </div>

              {/* Progress */}
              {status === 'processing' && (
                <div className="px-6 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-dark">Adding watermark…</span>
                    <span className="text-sm text-cyan-600 font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Error */}
              {status === 'ready' && errorMsg && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{errorMsg}</div>
              )}

              {/* Apply button */}
              {status === 'ready' && (
                <div className="px-6 py-5">
                  <button
                    onClick={applyWatermark}
                    disabled={!text.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-syne font-bold py-3.5 px-6 rounded-xl transition-colors"
                  >
                    Add Watermark
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Done */}
          {status === 'done' && downloadUrl && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                </div>
                <div>
                  <p className="font-syne font-bold text-dark">Watermark added!</p>
                  <p className="text-sm text-gray-500">{outputSize < 1024 * 1024 ? `${(outputSize / 1024).toFixed(0)} KB` : `${(outputSize / (1024 * 1024)).toFixed(1)} MB`}</p>
                </div>
              </div>
              <AdSlot position="pre_download" />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <a href={downloadUrl} download={outFileName} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors">
                  Download PDF
                </a>
                <button onClick={reset} className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-xl transition-colors">
                  Watermark Another
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">🔒 Your file never leaves your browser</p>
        </div>

        {/* ── Sidebar options ───────────────────────── */}
        <div className="lg:w-72 flex-shrink-0 space-y-5">
          <div className="bg-white rounded-2xl shadow-card p-5 space-y-5">
            <h2 className="font-syne font-bold text-dark text-base">Watermark Options</h2>

            {/* Text */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Watermark Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL"
                maxLength={60}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Color + Opacity row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Color</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" />
                  <span className="text-sm font-mono text-gray-600">{color}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Opacity {opacity}%</label>
                <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-cyan-500" />
              </div>
            </div>

            {/* Font size */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Font Size: {fontSize}pt</label>
              <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-cyan-500" />
            </div>

            {/* Rotation */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Rotation</label>
              <div className="grid grid-cols-4 gap-1.5">
                {([['0', '0°'], ['45', '45°'], ['-45', '-45°'], ['90', '90°']] as [Rotation, string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setRotation(val)} className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${rotation === val ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white text-gray-600 border-gray-200 hover:border-cyan-300'}`}>{label}</button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Position</label>
              {/* Visual 3×3 position picker */}
              <div className="grid grid-cols-3 gap-1.5">
                {(['top-left', '', 'top-right', '', 'center', '', 'bottom-left', '', 'bottom-right'] as (Position | '')[]).map((pos, i) => (
                  pos === '' ? (
                    <div key={i} />
                  ) : (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={`h-8 rounded-lg border text-xs font-bold transition-all ${position === pos ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white border-gray-200 hover:border-cyan-300'}`}
                      title={pos.replace('-', ' ')}
                    >
                      {pos === 'center' ? '⊙' : pos.includes('top') ? (pos.includes('left') ? '↖' : '↗') : (pos.includes('left') ? '↙' : '↘')}
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* Pages */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Apply To</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {(['all', 'custom'] as const).map((p) => (
                  <button key={p} onClick={() => setPages(p)} className={`py-2 rounded-lg text-xs font-bold border transition-all ${pages === p ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white text-gray-600 border-gray-200 hover:border-cyan-300'}`}>{p === 'all' ? 'All Pages' : 'Custom'}</button>
                ))}
              </div>
              {pages === 'custom' && (
                <input
                  type="text"
                  value={customPages}
                  onChange={(e) => setCustomPages(e.target.value)}
                  placeholder='e.g. 1, 3, 5-8'
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              )}
            </div>
          </div>

          <AdSlot position="sidebar" />
        </div>
      </div>
    </div>
  )
}
