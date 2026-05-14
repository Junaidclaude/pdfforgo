'use client'

import { useState, useRef, useCallback, useEffect, DragEvent } from 'react'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'

type Status = 'idle' | 'loading' | 'ready' | 'converting' | 'done' | 'error'
type DpiPreset = 'screen' | 'standard' | 'high'

interface ConvertedImage {
  pageNum: number
  name: string
  blob: Blob
  url: string
  size: number
}

const DPI_OPTIONS: { id: DpiPreset; label: string; sub: string; scale: number }[] = [
  { id: 'screen',   label: 'Web / Email',    sub: '72 DPI · Fastest',         scale: 1.0 },
  { id: 'standard', label: 'Standard',       sub: '150 DPI · Balanced',        scale: 150 / 72 },
  { id: 'high',     label: 'Print Quality',  sub: '300 DPI · Highest detail',  scale: 300 / 72 },
]

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

export default function PdfToPngTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [dpi, setDpi] = useState<DpiPreset>('standard')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<ConvertedImage[]>([])
  const [zoneDragging, setZoneDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const urlsRef = useRef<string[]>([])

  const revokeAllUrls = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    urlsRef.current = []
  }, [])

  useEffect(() => () => revokeAllUrls(), [revokeAllUrls])

  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.')
      return
    }
    setStatus('loading')
    setError(null)
    setImages([])
    setFile(f)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const bytes = await f.arrayBuffer()
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setPageCount(doc.getPageCount())
      setStatus('ready')
    } catch {
      setError('Could not read this PDF. It may be corrupted or encrypted.')
      setStatus('error')
      setFile(null)
    }
  }, [])

  const onZoneDrop = (e: DragEvent) => {
    e.preventDefault()
    setZoneDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) loadFile(f)
  }

  const convert = async () => {
    if (!file) return
    setStatus('converting')
    setProgress(0)
    setError(null)
    revokeAllUrls()

    const opt = DPI_OPTIONS.find((o) => o.id === dpi)!
    const baseName = file.name.replace(/\.pdf$/i, '')

    try {
      setProgressLabel('Initialising renderer…')
      const pdfjs = await getPdfjs()
      const srcBytes = await file.arrayBuffer()
      const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(srcBytes) }).promise

      const results: ConvertedImage[] = []

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        setProgressLabel(`Converting page ${i} of ${pdfDoc.numPages}…`)
        setProgress(Math.round(((i - 1) / pdfDoc.numPages) * 95))

        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: opt.scale })

        const canvas = document.createElement('canvas')
        canvas.width = Math.round(viewport.width)
        canvas.height = Math.round(viewport.height)
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context unavailable.')

        // White background for PNG (so transparency → white, matching PDF background)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        await page.render({ canvasContext: ctx, viewport }).promise

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed.'))),
            'image/png'
          )
        })

        canvas.width = 0
        canvas.height = 0

        const url = URL.createObjectURL(blob)
        urlsRef.current.push(url)

        results.push({
          pageNum: i,
          name: `${baseName}_page_${String(i).padStart(2, '0')}.png`,
          blob,
          url,
          size: blob.size,
        })
      }

      setProgress(100)
      setImages(results)
      setStatus('done')
      setProgressLabel('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Please try again.')
      setStatus('error')
      setProgressLabel('')
    }
  }

  const downloadOne = (img: ConvertedImage) => {
    const a = document.createElement('a')
    a.href = img.url
    a.download = img.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadAllZip = async () => {
    if (images.length === 1) { downloadOne(images[0]); return }
    setProgressLabel('Creating ZIP…')
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    images.forEach((img) => zip.file(img.name, img.blob))
    const content = await zip.generateAsync({ type: 'blob' })
    setProgressLabel('')
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file?.name.replace(/\.pdf$/i, '') ?? 'pages'}_png.zip`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    revokeAllUrls()
    setFile(null); setPageCount(0); setStatus('idle')
    setProgress(0); setProgressLabel(''); setError(null); setImages([])
    if (inputRef.current) inputRef.current.value = ''
  }

  const totalSize = images.reduce((s, i) => s + i.size, 0)
  const showSizeWarning = dpi === 'high' && (pageCount > 5 || status === 'done')

  return (
    <div>
      {/* AD_SLOT: header_banner */}
      <div className="bg-bg-dark border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <AdSlot position="header" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex gap-8 items-start">
          {/* ── Main column ──────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Drop zone */}
            {(status === 'idle' || status === 'loading' || status === 'error') && (
              <div>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Drop a PDF or click to upload"
                  onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setZoneDragging(true) }}
                  onDragLeave={() => setZoneDragging(false)}
                  onDrop={onZoneDrop}
                  onClick={() => inputRef.current?.click()}
                  className={[
                    'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer',
                    'transition-all duration-200 select-none outline-none',
                    'focus-visible:ring-2 focus-visible:ring-teal-400',
                    zoneDragging
                      ? 'border-teal-400 bg-teal-50 scale-[1.01]'
                      : 'border-gray-200 bg-white hover:border-teal-400/50 hover:bg-teal-50/20',
                  ].join(' ')}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = '' }}
                  />

                  {status === 'loading' ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-500 text-sm">Reading PDF…</p>
                    </div>
                  ) : (
                    <>
                      {/* PNG icon */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${zoneDragging ? 'bg-teal-100' : 'bg-teal-50'}`}>
                        <svg className={`w-7 h-7 transition-colors ${zoneDragging ? 'text-teal-600' : 'text-teal-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                      </div>
                      <p className="mt-2 font-syne font-bold text-dark text-xl">Drop a PDF to convert to PNG</p>
                      <p className="text-gray-400 text-sm mt-1">
                        or <span className="text-teal-500 underline">click to browse</span>
                      </p>
                      <p className="text-gray-300 text-xs mt-3">PDF only · lossless PNG output</p>
                    </>
                  )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Your file never leaves your browser — 100% private
                </p>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2" role="alert">
                    <span className="shrink-0 mt-0.5">⚠️</span>{error}
                  </div>
                )}
              </div>
            )}

            {/* File chip + options */}
            {(status === 'ready' || status === 'converting' || status === 'done' || status === 'error') && file && (
              <>
                {/* File chip */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-card">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark truncate text-sm">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtSize(file.size)} · {pageCount} page{pageCount !== 1 ? 's' : ''}</p>
                  </div>
                  {status === 'ready' && (
                    <button onClick={reset} className="text-xs text-gray-400 hover:text-red-400 transition-colors shrink-0">Change</button>
                  )}
                </div>

                {/* Options */}
                {status === 'ready' && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-5">
                    <div>
                      <h2 className="font-syne font-bold text-dark text-base mb-3">Resolution</h2>
                      <div className="grid grid-cols-3 gap-2">
                        {DPI_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setDpi(opt.id)}
                            className={[
                              'py-3 px-2 rounded-xl border-2 text-center transition-all',
                              dpi === opt.id
                                ? 'border-teal-400 bg-teal-50'
                                : 'border-gray-100 hover:border-gray-300 bg-white',
                            ].join(' ')}
                          >
                            <span className={`block text-sm font-semibold ${dpi === opt.id ? 'text-teal-700' : 'text-dark'}`}>{opt.label}</span>
                            <span className="block text-[11px] text-gray-400 mt-0.5 leading-snug">{opt.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PNG info badge */}
                    <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-700 flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/></svg>
                      PNG is <strong>lossless</strong> — text and sharp edges stay pixel-perfect. Files are larger than JPG but with zero quality loss.
                    </div>

                    {showSizeWarning && (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex items-start gap-2">
                        <span className="shrink-0">⚠️</span>
                        PNG at 300 DPI produces very large files — a single A4 page can exceed 15 MB. Consider Standard (150 DPI) for most uses.
                      </div>
                    )}

                    <button
                      onClick={convert}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-syne font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                      Convert {pageCount} Page{pageCount !== 1 ? 's' : ''} to PNG →
                    </button>
                  </div>
                )}

                {/* Progress */}
                {status === 'converting' && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{progressLabel || 'Converting…'}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 text-center">Processing locally — no file upload</p>
                  </div>
                )}

                {/* Error during conversion */}
                {status === 'error' && error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2" role="alert">
                    <span className="shrink-0">⚠️</span>
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setStatus('ready')} className="text-xs underline shrink-0">Try again</button>
                  </div>
                )}

                {/* Results */}
                {status === 'done' && images.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="font-syne font-bold text-dark text-lg">{images.length} PNG Image{images.length !== 1 ? 's' : ''} Ready</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Total size: {fmtSize(totalSize)}</p>
                      </div>
                      <button
                        onClick={downloadAllZip}
                        className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 px-5 rounded-xl transition-colors text-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        {images.length === 1 ? 'Download PNG' : 'Download All as ZIP'}
                      </button>
                    </div>

                    {/* AD_SLOT: pre_download_interstitial */}
                    <AdSlot position="pre_download" />

                    {/* Preview grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {images.slice(0, 8).map((img) => (
                        <div key={img.pageNum} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 aspect-[3/4]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt={`Page ${img.pageNum}`} className="w-full h-full object-contain" loading="lazy" />
                          <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <span className="text-white text-xs font-medium">Page {img.pageNum}</span>
                            <button
                              onClick={() => downloadOne(img)}
                              className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {images.length > 8 && (
                      <p className="text-xs text-gray-400 text-center">Showing 8 of {images.length} pages. Download ZIP to get all.</p>
                    )}

                    {images.length > 1 && (
                      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Individual Downloads</p>
                        </div>
                        <ul className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                          {images.map((img) => (
                            <li key={img.pageNum} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                              <span className="text-xs text-gray-400 w-12 shrink-0">Page {img.pageNum}</span>
                              <span className="text-xs text-gray-400 flex-1">{fmtSize(img.size)}</span>
                              <button onClick={() => downloadOne(img)} className="text-xs font-semibold text-teal-500 hover:text-teal-700 transition-colors">
                                Download
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button onClick={reset} className="w-full py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors">
                      Convert Another PDF
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* AD_SLOT: sidebar_right */}
          <aside className="hidden lg:block w-[300px] shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* PNG vs JPG comparison */}
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="font-syne font-bold text-dark text-sm mb-3">PNG vs JPG</p>
                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-teal-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-teal-600 font-bold">✓</span>
                    <div><strong>PNG</strong> — lossless, sharp text, larger files. Best for screenshots, diagrams, text documents.</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-purple-600 font-bold">≈</span>
                    <div><strong>JPG</strong> — lossy, smaller files. Better for photos and scanned PDFs. See our <a href="/pdf-to-jpg" className="text-purple-500 underline">PDF to JPG</a> tool.</div>
                  </div>
                </div>
              </div>

              <AdSlot position="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
