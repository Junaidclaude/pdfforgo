'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Dancing_Script, Caveat, Pacifico } from 'next/font/google'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'
import { STANDARD_MAX_FILE_BYTES, STANDARD_MAX_FILE_LABEL } from '@/lib/limits'

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: '700' })
const caveat = Caveat({ subsets: ['latin'], weight: '700' })
const pacifico = Pacifico({ subsets: ['latin'], weight: '400' })

const SIGNATURE_FONTS = [
  { name: 'Dancing Script', font: dancingScript },
  { name: 'Caveat', font: caveat },
  { name: 'Pacifico', font: pacifico },
]

type Status = 'idle' | 'loading' | 'ready' | 'saving' | 'error'
type CreateTab = 'draw' | 'type' | 'upload'

interface Placement {
  id: string
  page: number
  x: number // normalized 0-1, relative to page width
  y: number // normalized 0-1, relative to page height
  w: number
  h: number
  dataUrl: string
}

const uid = () => Math.random().toString(36).slice(2)

export default function SignPdfTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageImageUrl, setPageImageUrl] = useState('')
  const [pageSizePt, setPageSizePt] = useState({ w: 612, h: 792 })
  const [pageRenderW, setPageRenderW] = useState(600)

  const [placements, setPlacements] = useState<Placement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [createTab, setCreateTab] = useState<CreateTab>('draw')
  const [pendingSig, setPendingSig] = useState('')
  const [typedText, setTypedText] = useState('')
  const [fontIndex, setFontIndex] = useState(0)

  const pdfDocRef = useRef<import('pdfjs-dist').PDFDocumentProxy | null>(null)
  const pdfBytesRef = useRef<ArrayBuffer | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sigFileInputRef = useRef<HTMLInputElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const pageContainerRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<{ id: string; mode: 'move' | 'resize'; startX: number; startY: number; orig: Placement } | null>(null)

  const load = async (file: File) => {
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
    setStatus('loading')
    setErrorMsg('')
    try {
      const buffer = await file.arrayBuffer()
      pdfBytesRef.current = buffer
      const pdfjs = await getPdfjs()
      const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise
      pdfDocRef.current = doc
      setNumPages(doc.numPages)
      setCurrentPage(1)
      setPlacements([])
      setStatus('ready')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not read this PDF.')
      setStatus('error')
    }
  }

  const renderPage = useCallback(async (pageNum: number) => {
    const doc = pdfDocRef.current
    if (!doc) return
    const page = await doc.getPage(pageNum)
    const unscaledVp = page.getViewport({ scale: 1 })
    setPageSizePt({ w: unscaledVp.width, h: unscaledVp.height })

    const targetW = 680
    const scale = targetW / unscaledVp.width
    const vp = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(vp.width)
    canvas.height = Math.round(vp.height)
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport: vp }).promise
    setPageRenderW(canvas.width)
    setPageImageUrl(canvas.toDataURL('image/png'))
  }, [])

  useEffect(() => {
    if (status === 'ready') renderPage(currentPage)
  }, [status, currentPage, renderPage])

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { load(e.target.files[0]); e.target.value = '' }
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingOver(false)
    if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0])
  }

  // ── Draw tab ──────────────────────────────────────────────────────────────
  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    drawingRef.current = true
    const ctx = canvas.getContext('2d')!
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#1a1a1a'
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }
  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }
  const endDraw = () => { drawingRef.current = false }
  const clearDraw = () => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
  }
  const useDrawnSignature = () => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    setPendingSig(canvas.toDataURL('image/png'))
  }

  // ── Type tab ──────────────────────────────────────────────────────────────
  const useTypedSignature = async () => {
    if (!typedText.trim()) return
    await document.fonts.ready
    const family = SIGNATURE_FONTS[fontIndex].font.style.fontFamily
    const canvas = document.createElement('canvas')
    canvas.width = 600; canvas.height = 160
    const ctx = canvas.getContext('2d')!
    ctx.font = `56px ${family}`
    ctx.fillStyle = '#1a1a1a'
    ctx.textBaseline = 'middle'
    ctx.fillText(typedText, 20, 80)
    setPendingSig(canvas.toDataURL('image/png'))
  }

  // ── Upload tab ────────────────────────────────────────────────────────────
  const onSigFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPendingSig(reader.result as string)
    reader.readAsDataURL(file)
  }

  const addToPage = () => {
    if (!pendingSig) return
    const w = 0.28, h = w * 0.32
    setPlacements((prev) => [...prev, {
      id: uid(), page: currentPage, x: 0.36, y: 0.42, w, h, dataUrl: pendingSig,
    }])
  }

  // ── Drag / resize placements ─────────────────────────────────────────────
  const onPlacementPointerDown = (e: React.PointerEvent, id: string, mode: 'move' | 'resize') => {
    e.stopPropagation()
    const p = placements.find((pl) => pl.id === id)
    if (!p) return
    setSelectedId(id)
    dragStateRef.current = { id, mode, startX: e.clientX, startY: e.clientY, orig: p }
    const move = (ev: PointerEvent) => {
      const ds = dragStateRef.current
      const container = pageContainerRef.current
      if (!ds || !container) return
      const rect = container.getBoundingClientRect()
      const dxNorm = (ev.clientX - ds.startX) / rect.width
      const dyNorm = (ev.clientY - ds.startY) / rect.height
      setPlacements((prev) => prev.map((pl) => {
        if (pl.id !== ds.id) return pl
        if (ds.mode === 'move') {
          return { ...pl, x: Math.min(1 - pl.w, Math.max(0, ds.orig.x + dxNorm)), y: Math.min(1 - pl.h, Math.max(0, ds.orig.y + dyNorm)) }
        }
        return { ...pl, w: Math.max(0.05, Math.min(1 - pl.x, ds.orig.w + dxNorm)), h: Math.max(0.03, Math.min(1 - pl.y, ds.orig.h + dyNorm)) }
      }))
    }
    const up = () => {
      dragStateRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const deleteSelected = () => {
    if (!selectedId) return
    setPlacements((prev) => prev.filter((p) => p.id !== selectedId))
    setSelectedId(null)
  }

  const reset = () => {
    setStatus('idle'); setFileName(''); setErrorMsg(''); setPlacements([]); setSelectedId(null)
    setPendingSig(''); setNumPages(0); setCurrentPage(1); pdfDocRef.current = null; pdfBytesRef.current = null
  }

  const save = async () => {
    if (!pdfBytesRef.current) return
    setStatus('saving')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const doc = await PDFDocument.load(pdfBytesRef.current)
      const pages = doc.getPages()
      for (const p of placements) {
        const page = pages[p.page - 1]
        if (!page) continue
        const { width: pw, height: ph } = page.getSize()
        const isPng = p.dataUrl.startsWith('data:image/png')
        const bytes = await (await fetch(p.dataUrl)).arrayBuffer()
        const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
        const w = p.w * pw, h = p.h * ph
        page.drawImage(img, { x: p.x * pw, y: ph - p.y * ph - h, width: w, height: h })
      }
      const out = await doc.save()
      const blob = new Blob([new Uint8Array(out).buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName.replace(/\.pdf$/i, '-signed.pdf')
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
      setStatus('ready')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save this PDF.')
      setStatus('error')
    }
  }

  const pagePlacements = placements.filter((p) => p.page === currentPage)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <AdSlot position="header" />

      {(status === 'idle' || status === 'error') && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${
            isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/30'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileInputChange} />
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124M15.75 17.25a3 3 0 0 0 3-3m-3 3v-4.036m0 0a9.088 9.088 0 0 0-3-3.036" />
            </svg>
          </div>
          <p className="font-display font-bold text-ink text-lg mb-1">Drop your PDF here to sign</p>
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

      {status === 'loading' && (
        <div className="bg-white rounded-2xl border border-line p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-display font-bold text-ink mb-1">Loading PDF…</p>
          <p className="text-mute text-sm">{fileName}</p>
        </div>
      )}

      {(status === 'ready' || status === 'saving') && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white rounded-2xl border border-line p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-bold text-ink text-sm truncate">{fileName}</p>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30">‹</button>
                <span className="text-xs text-mute">Page {currentPage} / {numPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))} disabled={currentPage >= numPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30">›</button>
              </div>
            </div>
            <div className="overflow-auto bg-gray-100 rounded-xl p-4 flex justify-center">
              <div ref={pageContainerRef} className="relative shrink-0" style={{ width: pageRenderW }} onPointerDown={() => setSelectedId(null)}>
                {pageImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pageImageUrl} alt={`Page ${currentPage}`} className="block w-full select-none" draggable={false} />
                )}
                {pagePlacements.map((p) => (
                  <div
                    key={p.id}
                    onPointerDown={(e) => onPlacementPointerDown(e, p.id, 'move')}
                    className={`absolute cursor-move border-2 ${selectedId === p.id ? 'border-blue-500' : 'border-transparent hover:border-blue-300'}`}
                    style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: `${p.w * 100}%`, height: `${p.h * 100}%` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.dataUrl} alt="Signature" className="w-full h-full object-contain pointer-events-none select-none" draggable={false} />
                    {selectedId === p.id && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); deleteSelected() }}
                          className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center shadow">✕</button>
                        <div onPointerDown={(e) => onPlacementPointerDown(e, p.id, 'resize')}
                          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-line p-5">
            <p className="font-display font-bold text-ink mb-3">Create Your Signature</p>
            <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
              {(['draw', 'type', 'upload'] as CreateTab[]).map((t) => (
                <button key={t} onClick={() => setCreateTab(t)}
                  className={`flex-1 text-xs font-semibold py-1.5 rounded-lg capitalize transition-colors ${createTab === t ? 'bg-white text-ink shadow-sm' : 'text-mute hover:text-ink'}`}>
                  {t}
                </button>
              ))}
            </div>

            {createTab === 'draw' && (
              <div>
                <canvas
                  ref={drawCanvasRef}
                  width={280} height={120}
                  onPointerDown={startDraw} onPointerMove={moveDraw} onPointerUp={endDraw} onPointerLeave={endDraw}
                  className="w-full bg-gray-50 border border-line rounded-xl touch-none cursor-crosshair"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={clearDraw} className="flex-1 text-xs font-semibold text-mute hover:text-ink bg-gray-100 hover:bg-gray-200 rounded-lg py-2">Clear</button>
                  <button onClick={useDrawnSignature} className="flex-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-2">Use This</button>
                </div>
              </div>
            )}

            {createTab === 'type' && (
              <div>
                <input type="text" value={typedText} onChange={(e) => setTypedText(e.target.value)} placeholder="Your Name"
                  className="w-full px-3 py-2 rounded-xl border border-line text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <div className="space-y-1.5 mb-3">
                  {SIGNATURE_FONTS.map((f, i) => (
                    <button key={f.name} onClick={() => setFontIndex(i)}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-xl ${fontIndex === i ? 'border-blue-500 bg-blue-50' : 'border-line hover:border-gray-300'} ${f.font.className}`}>
                      {typedText || 'Your Name'}
                    </button>
                  ))}
                </div>
                <button onClick={useTypedSignature} disabled={!typedText.trim()}
                  className="w-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg py-2">Use This</button>
              </div>
            )}

            {createTab === 'upload' && (
              <div>
                <input ref={sigFileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onSigFileChange} />
                <button onClick={() => sigFileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-line hover:border-blue-400 rounded-xl py-6 text-sm text-mute hover:text-ink transition-colors">
                  Upload signature image
                </button>
                <p className="text-xs text-mute mt-2">A transparent PNG works best.</p>
              </div>
            )}

            {pendingSig && (
              <div className="mt-4 pt-4 border-t border-line">
                <p className="text-xs font-semibold text-mute mb-2">Preview</p>
                <div className="bg-gray-50 border border-line rounded-xl p-3 mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pendingSig} alt="Signature preview" className="max-h-16 mx-auto" />
                </div>
                <button onClick={addToPage} className="w-full bg-ink hover:bg-black text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                  Add to Page {currentPage}
                </button>
              </div>
            )}

            {errorMsg && <p className="text-red-500 text-sm mt-4">{errorMsg}</p>}

            <div className="mt-5 pt-4 border-t border-line">
              <p className="text-xs text-mute mb-3">{placements.length} signature{placements.length !== 1 ? 's' : ''} placed. Drag to move, use the corner handle to resize.</p>
              <button onClick={save} disabled={status === 'saving' || placements.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors">
                {status === 'saving' ? 'Saving…' : 'Download Signed PDF'}
              </button>
              <button onClick={reset} className="w-full mt-2 text-xs text-mute hover:text-ink transition-colors py-1.5">
                Use different file
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700 space-y-1">
        <p><strong>100% private:</strong> Your PDF and signature are processed entirely in your browser. Nothing is uploaded to any server.</p>
        <p>This places a signature image onto your PDF — a fast way to sign and send a document yourself. It doesn&apos;t provide identity verification, audit trails, or multi-party signing requests, so it isn&apos;t a substitute for a legally-binding e-signature service when one is required.</p>
      </div>

      <AdSlot position="footer" />
    </div>
  )
}
