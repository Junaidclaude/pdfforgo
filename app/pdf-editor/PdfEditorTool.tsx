'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'

// ── Types ─────────────────────────────────────────────────────────────────────

type EditorTool = 'select' | 'text' | 'draw' | 'rect' | 'ellipse' | 'line' | 'arrow' | 'highlight' | 'whitebox'

interface Annot {
  id: string; page: number
  type: Exclude<EditorTool, 'select'>
  x: number; y: number; w: number; h: number
  x1?: number; y1?: number; x2?: number; y2?: number
  color: string; fillColor: string; strokeWidth: number; opacity: number
  text?: string; fontSize?: number; fontSizePdf?: number; fontFamily?: string
  bold?: boolean; italic?: boolean; underline?: boolean; align?: 'left' | 'center' | 'right'
  points?: [number, number][]
  fromPdf?: boolean
}

interface PdfTextHit {
  str: string
  x: number; y: number; w: number; h: number
  fontSizePdf: number; fontSizeCss: number
}

interface TextBubble {
  screenX: number; screenY: number
  normX: number; normY: number
  existingId: string | null
  initialText: string
  initialFont: string; initialSize: number
  initialBold: boolean; initialItalic: boolean; initialUnderline: boolean
  initialColor: string; initialAlign: 'left' | 'center' | 'right'
  fromPdfHit?: PdfTextHit
}

// ── Constants ──────────────────────────────────────────────────────────────────

const FONTS = [
  { label: 'Sans-serif', css: 'Arial, Helvetica, sans-serif', pdf: 'Helvetica' },
  { label: 'Serif', css: 'Georgia, "Times New Roman", serif', pdf: 'TimesRoman' },
  { label: 'Monospace', css: '"Courier New", Courier, monospace', pdf: 'Courier' },
]

const PALETTE = [
  '#1a1a1a', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#ffffff',
]

const HL_PALETTE = ['#fef08a', '#bbf7d0', '#a5f3fc', '#fecdd3', '#ddd6fe', '#fed7aa', '#fde68a', '#f0abfc']

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96]

const TOOL_LIST: { id: EditorTool; label: string; shortcut: string; icon: React.ReactNode }[] = [
  { id: 'select', label: 'Select', shortcut: 'V', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/></svg> },
  { id: 'text', label: 'Text', shortcut: 'T', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg> },
  { id: 'draw', label: 'Draw', shortcut: 'D', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> },
  { id: 'highlight', label: 'Highlight', shortcut: 'H', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg> },
  { id: 'rect', label: 'Rectangle', shortcut: 'R', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'E', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="10" ry="6"/></svg> },
  { id: 'line', label: 'Line', shortcut: 'L', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="19" x2="19" y2="5"/></svg> },
  { id: 'arrow', label: 'Arrow', shortcut: 'A', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="9 5 19 5 19 15"/></svg> },
  { id: 'whitebox', label: 'Whiteout', shortcut: 'W', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" fill="white"/><path d="M9 9h6M9 12h6M9 15h4"/></svg> },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9) }

function arrowHeadPts(x1: number, y1: number, x2: number, y2: number, size: number): string {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const p1 = [x2 + Math.cos(ang + Math.PI * 0.75) * size, y2 + Math.sin(ang + Math.PI * 0.75) * size]
  const p2 = [x2 + Math.cos(ang - Math.PI * 0.75) * size, y2 + Math.sin(ang - Math.PI * 0.75) * size]
  return `${p1[0]},${p1[1]} ${x2},${y2} ${p2[0]},${p2[1]}`
}

// Catmull-Rom to cubic bezier — gives smooth brushstroke curves
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  if (pts.length === 2) return `M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]}`
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2[0]} ${p2[1]}`
  }
  return d
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PdfEditorTool() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [fileName, setFileName] = useState('')
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(1.2)
  const [annots, setAnnots] = useState<Annot[]>([])
  const [history, setHistory] = useState<Annot[][]>([[]])
  const [historyIdx, setHistoryIdx] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<EditorTool>('select')
  const [color, setColor] = useState('#1a1a1a')
  const [hlColor, setHlColor] = useState('#fef08a')
  const [fillColor, setFillColor] = useState('transparent')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [hlSize, setHlSize] = useState(18)
  const [opacity, setOpacity] = useState(1)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState(FONTS[0].css)
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left')
  const [isDragging, setIsDragging] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [textBubble, setTextBubble] = useState<TextBubble | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractMsg, setExtractMsg] = useState('')
  const [showExtractMenu, setShowExtractMenu] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfDocRef = useRef<unknown>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)
  const isDown = useRef(false)
  const brushPts = useRef<[number, number][]>([])
  const shapeStart = useRef<{ x: number; y: number } | null>(null)
  const moveState = useRef<{ id: string; ox: number; oy: number } | null>(null)
  const lastClick = useRef<{ id: string; time: number } | null>(null)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)
  const hasDragged = useRef(false)
  const pdfTextCache = useRef<Map<number, PdfTextHit[]>>(new Map())

  // ── History ──────────────────────────────────────────────────────────────────
  const pushHistory = useCallback((next: Annot[]) => {
    setHistory(h => {
      const slice = h.slice(0, historyIdx + 1)
      return [...slice, next]
    })
    setHistoryIdx(i => i + 1)
    setAnnots(next)
  }, [historyIdx])

  const undo = useCallback(() => {
    if (historyIdx <= 0) return
    setAnnots(history[historyIdx - 1]); setHistoryIdx(i => i - 1); setSelectedId(null)
  }, [history, historyIdx])

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return
    setAnnots(history[historyIdx + 1]); setHistoryIdx(i => i + 1); setSelectedId(null)
  }, [history, historyIdx])

  // ── Load PDF ─────────────────────────────────────────────────────────────────
  const loadPdf = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) return
    const bytes = new Uint8Array(await file.arrayBuffer())
    setPdfBytes(bytes); setFileName(file.name)
    setAnnots([]); setHistory([[]]); setHistoryIdx(0)
    setSelectedId(null); setCurrentPage(1)
    pdfTextCache.current.clear()
    const pdfjs = await getPdfjs()
    const doc = await pdfjs.getDocument({ data: bytes }).promise
    pdfDocRef.current = doc
    setNumPages(doc.numPages)
  }, [])

  // ── Render page ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pdfDocRef.current || !canvasRef.current) return
    const doc = pdfDocRef.current as { getPage: (n: number) => Promise<unknown> }
    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null }
    let cancelled = false
    doc.getPage(currentPage).then((page) => {
      if (cancelled) return
      const p = page as { getViewport: (o: { scale: number }) => { width: number; height: number }; render: (o: unknown) => { promise: Promise<void>; cancel: () => void } }
      const dpr = window.devicePixelRatio
      const vp = p.getViewport({ scale: zoom * dpr })
      const cv = canvasRef.current!
      cv.width = vp.width; cv.height = vp.height
      cv.style.width = `${vp.width / dpr}px`; cv.style.height = `${vp.height / dpr}px`
      const dc = drawCanvasRef.current!
      dc.width = vp.width; dc.height = vp.height
      dc.style.width = cv.style.width; dc.style.height = cv.style.height
      const task = p.render({ canvasContext: cv.getContext('2d')!, viewport: vp })
      renderTaskRef.current = task
      task.promise.then(() => { renderTaskRef.current = null }).catch(() => {})
    })
    return () => { cancelled = true }
  }, [currentPage, zoom, pdfBytes, numPages])

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return
      if (textBubble) return
      const map: Record<string, () => void> = {
        'v': () => setTool('select'), 't': () => setTool('text'),
        'd': () => setTool('draw'), 'h': () => setTool('highlight'),
        'r': () => setTool('rect'), 'e': () => setTool('ellipse'),
        'l': () => setTool('line'), 'a': () => setTool('arrow'),
        'w': () => setTool('whitebox'),
        'z': () => { if (e.metaKey || e.ctrlKey) { e.shiftKey ? redo() : undo() } },
        'Delete': () => { if (selectedId) { pushHistory(annots.filter(a => a.id !== selectedId)); setSelectedId(null) } },
        'Backspace': () => { if (selectedId) { pushHistory(annots.filter(a => a.id !== selectedId)); setSelectedId(null) } },
        'Escape': () => { setSelectedId(null); setTool('select'); setTextBubble(null) },
      }
      const fn = map[e.key]
      if (fn) { e.preventDefault(); fn() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, annots, undo, redo, pushHistory, textBubble])

  // ── Build per-page text hit-test cache ──────────────────────────────────────
  const loadTextCache = useCallback(async (pageNum: number) => {
    if (pdfTextCache.current.has(pageNum)) return
    const doc = pdfDocRef.current as { getPage: (n: number) => Promise<unknown> } | null
    if (!doc) return
    try {
      const page = await doc.getPage(pageNum) as {
        getViewport: (o: { scale: number }) => { width: number; height: number }
        getTextContent: () => Promise<{ items: { str: string; transform: number[]; width: number }[] }>
      }
      const vp = page.getViewport({ scale: 1 })
      const pw = vp.width, ph = vp.height
      const content = await page.getTextContent()
      const items = content.items.filter(it => it.str?.trim() && it.transform?.length >= 6)

      // Group into lines by baseline-y proximity
      const LINE_TOL = 3
      const lines: typeof items[] = []
      for (const item of items) {
        const iy = item.transform[5]
        const existing = lines.find(l => Math.abs(l[0].transform[5] - iy) <= LINE_TOL)
        if (existing) existing.push(item)
        else lines.push([item])
      }
      for (const line of lines) line.sort((a, b) => a.transform[4] - b.transform[4])
      lines.sort((a, b) => b[0].transform[5] - a[0].transform[5])

      const hits: PdfTextHit[] = []
      for (const line of lines) {
        let text = ''
        for (let i = 0; i < line.length; i++) {
          if (i > 0) {
            const gap = line[i].transform[4] - (line[i - 1].transform[4] + line[i - 1].width)
            const cw = line[i - 1].width / Math.max(1, line[i - 1].str.length)
            if (gap > cw * 0.4) text += ' '
          }
          text += line[i].str
        }
        if (!text.trim()) continue
        const first = line[0], last = line[line.length - 1]
        const fsp = Math.abs(first.transform[3]) || 12
        const lx = first.transform[4]
        const by = first.transform[5]
        const rw = Math.max(last.transform[4] + last.width - lx, fsp)
        hits.push({
          str: text.trim(),
          x: Math.max(0, lx / pw),
          y: Math.max(0, 1 - (by + fsp) / ph),
          w: rw / pw,
          h: (fsp * 1.3) / ph,
          fontSizePdf: fsp,
          fontSizeCss: Math.max(6, Math.round(fsp * zoom)),
        })
      }
      pdfTextCache.current.set(pageNum, hits)
    } catch {
      pdfTextCache.current.set(pageNum, [])
    }
  }, [zoom])

  // Load cache whenever the page or PDF changes
  useEffect(() => {
    if (pdfBytes && numPages > 0) loadTextCache(currentPage)
  }, [currentPage, pdfBytes, numPages, loadTextCache])

  // ── Close extract menu on outside click ─────────────────────────────────────
  useEffect(() => {
    if (!showExtractMenu) return
    const handler = () => setShowExtractMenu(false)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showExtractMenu])

  // ── Body scroll lock (only when PDF is loaded) ──────────────────────────────
  useEffect(() => {
    if (!pdfBytes) return
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [pdfBytes])

  // ── Pointer helpers ──────────────────────────────────────────────────────────
  const toNorm = (cx: number, cy: number) => {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: Math.max(0, Math.min(1, (cx - r.left) / r.width)), y: Math.max(0, Math.min(1, (cy - r.top) / r.height)) }
  }

  const clearDraw = () => {
    const dc = drawCanvasRef.current
    if (dc) dc.getContext('2d')!.clearRect(0, 0, dc.width, dc.height)
  }

  const previewBrush = (pts: [number, number][], isHighlight: boolean) => {
    const dc = drawCanvasRef.current; if (!dc || pts.length < 2) return
    const dpr = window.devicePixelRatio
    const ctx = dc.getContext('2d')!
    ctx.clearRect(0, 0, dc.width, dc.height)
    ctx.save()
    ctx.strokeStyle = isHighlight ? hlColor : color
    ctx.lineWidth = (isHighlight ? hlSize : strokeWidth) * dpr
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'
    ctx.globalAlpha = isHighlight ? 0.4 : opacity
    ctx.beginPath()
    ctx.moveTo(pts[0][0] * dc.width, pts[0][1] * dc.height)
    if (pts.length === 2) {
      ctx.lineTo(pts[1][0] * dc.width, pts[1][1] * dc.height)
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2
        const my = (pts[i][1] + pts[i + 1][1]) / 2
        ctx.quadraticCurveTo(pts[i][0] * dc.width, pts[i][1] * dc.height, mx * dc.width, my * dc.height)
      }
      ctx.lineTo(pts[pts.length - 1][0] * dc.width, pts[pts.length - 1][1] * dc.height)
    }
    ctx.stroke(); ctx.restore()
  }

  const previewShape = (sx: number, sy: number, ex: number, ey: number) => {
    const dc = drawCanvasRef.current; if (!dc) return
    const dpr = window.devicePixelRatio
    const ctx = dc.getContext('2d')!
    ctx.clearRect(0, 0, dc.width, dc.height)
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = strokeWidth * dpr; ctx.globalAlpha = opacity
    const x = sx * dc.width, y = sy * dc.height, w = (ex - sx) * dc.width, h = (ey - sy) * dc.height
    if (tool === 'rect') {
      if (fillColor !== 'transparent') { ctx.fillStyle = fillColor; ctx.fillRect(x, y, w, h) }
      ctx.strokeRect(x, y, w, h)
    } else if (tool === 'ellipse') {
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2)
      if (fillColor !== 'transparent') { ctx.fillStyle = fillColor; ctx.fill() }
      ctx.stroke()
    } else if (tool === 'whitebox') {
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 1; ctx.fillRect(x, y, w, h)
    } else if (tool === 'line') {
      ctx.beginPath(); ctx.moveTo(sx * dc.width, sy * dc.height); ctx.lineTo(ex * dc.width, ey * dc.height); ctx.stroke()
    } else if (tool === 'arrow') {
      ctx.beginPath(); ctx.moveTo(sx * dc.width, sy * dc.height); ctx.lineTo(ex * dc.width, ey * dc.height); ctx.stroke()
      const hpts = arrowHeadPts(sx * dc.width, sy * dc.height, ex * dc.width, ey * dc.height, 14 * dpr).split(' ').map(p => p.split(',').map(Number))
      ctx.beginPath(); ctx.moveTo(hpts[0][0], hpts[0][1]); ctx.lineTo(hpts[1][0], hpts[1][1]); ctx.lineTo(hpts[2][0], hpts[2][1]); ctx.stroke()
    }
    ctx.restore()
  }

  // ── Pointer events ───────────────────────────────────────────────────────────
  const onDown = (e: React.PointerEvent) => {
    if (!pdfBytes) return
    e.currentTarget.setPointerCapture(e.pointerId)
    isDown.current = true
    const { x, y } = toNorm(e.clientX, e.clientY)

    if (tool === 'select') {
      const pg = annots.filter(a => a.page === currentPage)
      let hit: Annot | null = null
      for (let i = pg.length - 1; i >= 0; i--) {
        const a = pg[i]
        const lx = Math.min(a.x, a.x + a.w) - 0.01, rx = Math.max(a.x, a.x + a.w) + 0.01
        const ty = Math.min(a.y, a.y + a.h) - 0.01, by = Math.max(a.y, a.y + a.h) + 0.01
        if (x >= lx && x <= rx && y >= ty && y <= by) { hit = a; break }
      }
      if (hit) {
        const now = Date.now()
        // Double-click on text → re-open text bubble for editing
        if (hit.type === 'text' && lastClick.current?.id === hit.id && now - lastClick.current.time < 450) {
          lastClick.current = null; isDown.current = false; moveState.current = null
          const r = canvasRef.current!.getBoundingClientRect()
          const sx = r.left + hit.x * r.width
          const sy = r.top + hit.y * r.height
          setTextBubble({ screenX: sx, screenY: sy, normX: hit.x, normY: hit.y, existingId: hit.id, initialText: hit.text ?? '', initialFont: hit.fontFamily ?? fontFamily, initialSize: hit.fontSize ?? fontSize, initialBold: hit.bold ?? bold, initialItalic: hit.italic ?? italic, initialUnderline: hit.underline ?? underline, initialColor: hit.color, initialAlign: hit.align ?? align })
          return
        }
        lastClick.current = { id: hit.id, time: now }
        setSelectedId(hit.id)
        moveState.current = { id: hit.id, ox: x - hit.x, oy: y - hit.y }
        dragOrigin.current = { x, y }; hasDragged.current = false
      } else {
        lastClick.current = null; setSelectedId(null); moveState.current = null
        dragOrigin.current = null; hasDragged.current = false
      }
      return
    }

    if (tool === 'text') {
      // Click on existing text → edit it
      const textAnnots = annots.filter(a => a.page === currentPage && a.type === 'text')
      for (let i = textAnnots.length - 1; i >= 0; i--) {
        const a = textAnnots[i]
        const lx = a.x - 0.01, rx = a.x + Math.max(a.w, 0.1) + 0.01
        const ty = a.y - 0.01, by = a.y + Math.max(a.h, 0.06) + 0.01
        if (x >= lx && x <= rx && y >= ty && y <= by) {
          isDown.current = false
          const r = canvasRef.current!.getBoundingClientRect()
          setTextBubble({ screenX: e.clientX, screenY: e.clientY, normX: a.x, normY: a.y, existingId: a.id, initialText: a.text ?? '', initialFont: a.fontFamily ?? fontFamily, initialSize: a.fontSize ?? fontSize, initialBold: a.bold ?? bold, initialItalic: a.italic ?? italic, initialUnderline: a.underline ?? underline, initialColor: a.color, initialAlign: a.align ?? align })
          return
        }
      }
      // Hit-test against cached PDF text items → click-to-edit existing PDF text
      const cached = pdfTextCache.current.get(currentPage) ?? []
      for (const hit of cached) {
        // Use a slightly enlarged hit area for easier clicking
        if (x >= hit.x - 0.008 && x <= hit.x + hit.w + 0.008 &&
            y >= hit.y - 0.005 && y <= hit.y + hit.h + 0.012) {
          isDown.current = false
          setTextBubble({
            screenX: e.clientX, screenY: e.clientY,
            normX: hit.x, normY: hit.y,
            existingId: null,
            initialText: hit.str,
            initialFont: fontFamily, initialSize: hit.fontSizeCss,
            initialBold: false, initialItalic: false, initialUnderline: false,
            initialColor: color, initialAlign: 'left',
            fromPdfHit: hit,
          })
          return
        }
      }

      // Empty click → open bubble at click position for a new text box
      isDown.current = false
      setTextBubble({ screenX: e.clientX, screenY: e.clientY, normX: x, normY: y, existingId: null, initialText: '', initialFont: fontFamily, initialSize: fontSize, initialBold: bold, initialItalic: italic, initialUnderline: underline, initialColor: color, initialAlign: align })
      return
    }

    if (tool === 'draw' || tool === 'highlight') {
      brushPts.current = [[x, y]]; return
    }
    shapeStart.current = { x, y }
  }

  const onMove = (e: React.PointerEvent) => {
    if (!isDown.current || !pdfBytes) return
    const { x, y } = toNorm(e.clientX, e.clientY)

    if (tool === 'select' && moveState.current) {
      const { id, ox, oy } = moveState.current
      const orig = dragOrigin.current
      if (!hasDragged.current && orig) {
        const dist = Math.sqrt((x - orig.x) ** 2 + (y - orig.y) ** 2)
        if (dist < 0.007) return
        hasDragged.current = true
      }
      setAnnots(prev => prev.map(a => a.id === id ? { ...a, x: x - ox, y: y - oy } : a))
      return
    }
    if (tool === 'draw') { brushPts.current = [...brushPts.current, [x, y]]; previewBrush(brushPts.current, false); return }
    if (tool === 'highlight') { brushPts.current = [...brushPts.current, [x, y]]; previewBrush(brushPts.current, true); return }
    if (shapeStart.current) previewShape(shapeStart.current.x, shapeStart.current.y, x, y)
  }

  const onUp = (e: React.PointerEvent) => {
    if (!isDown.current) return
    isDown.current = false; clearDraw()
    const { x, y } = toNorm(e.clientX, e.clientY)

    if (tool === 'select' && moveState.current) {
      if (hasDragged.current) pushHistory([...annots])
      moveState.current = null; dragOrigin.current = null; hasDragged.current = false; return
    }
    if ((tool === 'draw' || tool === 'highlight') && brushPts.current.length >= 2) {
      const pts = brushPts.current as [number, number][]
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
      const bx = Math.min(...xs), by = Math.min(...ys)
      const id = uid()
      const isHL = tool === 'highlight'
      pushHistory([...annots, {
        id, page: currentPage, type: tool,
        x: bx, y: by, w: Math.max(...xs) - bx, h: Math.max(...ys) - by,
        color: isHL ? hlColor : color,
        fillColor: 'transparent',
        strokeWidth: isHL ? hlSize : strokeWidth,
        opacity: isHL ? 0.4 : opacity,
        points: pts
      }])
      setSelectedId(id); brushPts.current = []; return
    }
    if (shapeStart.current && tool !== 'select' && tool !== 'text' && tool !== 'draw' && tool !== 'highlight') {
      const sx = shapeStart.current.x, sy = shapeStart.current.y
      if (Math.abs(x - sx) < 0.005 && Math.abs(y - sy) < 0.005) { shapeStart.current = null; return }
      const id = uid()
      const base: Annot = {
        id, page: currentPage, type: tool,
        x: Math.min(sx, x), y: Math.min(sy, y), w: Math.abs(x - sx), h: Math.abs(y - sy),
        color, fillColor: tool === 'whitebox' ? '#ffffff' : fillColor,
        strokeWidth, opacity,
      }
      if (tool === 'line' || tool === 'arrow') { base.x1 = sx; base.y1 = sy; base.x2 = x; base.y2 = y }
      pushHistory([...annots, base]); setSelectedId(id); shapeStart.current = null
    }
  }

  // ── Selected annotation ──────────────────────────────────────────────────────
  const selected = annots.find(a => a.id === selectedId)

  const patch = (p: Partial<Annot>) => {
    if (!selectedId) return
    pushHistory(annots.map(a => a.id === selectedId ? { ...a, ...p } : a))
  }

  // ── Text bubble handlers ─────────────────────────────────────────────────────
  const confirmText = (data: { text: string; font: string; size: number; bold: boolean; italic: boolean; underline: boolean; color: string; align: 'left' | 'center' | 'right' }) => {
    if (!textBubble) return
    const { normX: x, normY: y, existingId, fromPdfHit } = textBubble
    setFontFamily(data.font); setFontSize(data.size); setBold(data.bold); setItalic(data.italic); setUnderline(data.underline); setColor(data.color); setAlign(data.align)
    const id = uid()
    if (existingId) {
      pushHistory(annots.map(a => a.id === existingId ? { ...a, text: data.text, fontFamily: data.font, fontSize: data.size, bold: data.bold, italic: data.italic, underline: data.underline, color: data.color, align: data.align } : a))
      setSelectedId(existingId)
    } else if (fromPdfHit) {
      // Replace PDF text: annotation sits at the exact original text position
      pushHistory([...annots, {
        id, page: currentPage, type: 'text',
        x: fromPdfHit.x, y: fromPdfHit.y, w: fromPdfHit.w, h: fromPdfHit.h,
        color: data.color, fillColor: 'transparent', strokeWidth: 1, opacity: 1,
        text: data.text, fontSize: data.size, fontSizePdf: fromPdfHit.fontSizePdf,
        fontFamily: data.font, bold: data.bold, italic: data.italic, underline: data.underline, align: data.align,
        fromPdf: true,
      }])
      setSelectedId(id)
    } else {
      pushHistory([...annots, { id, page: currentPage, type: 'text', x, y, w: 0.3, h: 0.06, color: data.color, fillColor: 'transparent', strokeWidth: 1, opacity: 1, text: data.text, fontSize: data.size, fontFamily: data.font, bold: data.bold, italic: data.italic, underline: data.underline, align: data.align }])
      setSelectedId(id)
    }
    setTextBubble(null)
  }

  // ── Extract text from PDF pages ──────────────────────────────────────────────
  const extractPageText = useCallback(async (allPages: boolean) => {
    const doc = pdfDocRef.current as { getPage: (n: number) => Promise<unknown> } | null
    if (!doc) return
    setExtracting(true); setExtractMsg(''); setShowExtractMenu(false)

    type PdfItem = { str: string; transform: number[]; width: number }

    try {
      const pagesToProcess = allPages
        ? Array.from({ length: numPages }, (_, i) => i + 1)
        : [currentPage]

      const newAnnots: Annot[] = []

      for (const pageNum of pagesToProcess) {
        const page = await doc.getPage(pageNum) as {
          getViewport: (o: { scale: number }) => { width: number; height: number }
          getTextContent: () => Promise<{ items: PdfItem[] }>
        }
        const vp = page.getViewport({ scale: 1 })
        const pw = vp.width, ph = vp.height
        const content = await page.getTextContent()

        // Filter out empty items
        const items = content.items.filter(it => it.str && it.str.trim() !== '' && it.transform?.length >= 6)

        // Group items into lines by baseline-y proximity (within 3 PDF points)
        const LINE_TOL = 3
        const lines: PdfItem[][] = []
        for (const item of items) {
          const iy = item.transform[5]
          const existing = lines.find(l => Math.abs(l[0].transform[5] - iy) <= LINE_TOL)
          if (existing) existing.push(item)
          else lines.push([item])
        }

        // Sort items within each line left-to-right
        for (const line of lines) line.sort((a, b) => a.transform[4] - b.transform[4])

        // Sort lines top-to-bottom (high PDF-y = top of page)
        lines.sort((a, b) => b[0].transform[5] - a[0].transform[5])

        for (const line of lines) {
          // Build text, inserting spaces when items have a visible gap
          let text = ''
          for (let i = 0; i < line.length; i++) {
            if (i > 0) {
              const prevEnd = line[i - 1].transform[4] + line[i - 1].width
              const gap = line[i].transform[4] - prevEnd
              const charW = line[i - 1].width / Math.max(1, line[i - 1].str.length)
              if (gap > charW * 0.4) text += ' '
            }
            text += line[i].str
          }
          if (!text.trim()) continue

          const first = line[0], last = line[line.length - 1]
          const fontSizePdf = Math.abs(first.transform[3]) || 12
          const x = first.transform[4]
          const baseY = first.transform[5]  // baseline from PDF bottom
          const rightEdge = last.transform[4] + last.width
          const textWidth = Math.max(rightEdge - x, fontSizePdf)

          // Convert to normalised (0-1) — flip Y: PDF origin is bottom-left
          const normX = Math.max(0, x / pw)
          const normY = Math.max(0, 1 - (baseY + fontSizePdf) / ph)
          const normW = Math.min(textWidth / pw, 1 - normX)
          const normH = Math.min((fontSizePdf * 1.3) / ph, 1 - normY)

          // Font size in CSS px: at zoom level, canvas CSS width ≈ pw * zoom
          const fontSizeCss = Math.max(6, Math.round(fontSizePdf * zoom))

          newAnnots.push({
            id: uid(), page: pageNum, type: 'text',
            x: normX, y: normY, w: normW, h: normH,
            color: '#1a1a1a', fillColor: 'transparent', strokeWidth: 1, opacity: 1,
            text, fontSize: fontSizeCss, fontSizePdf,
            fontFamily: FONTS[0].css, bold: false, italic: false, underline: false, align: 'left',
            fromPdf: true,
          })
        }
      }

      if (newAnnots.length === 0) {
        setExtractMsg('No extractable text found — this may be a scanned (image-only) PDF.')
        setExtracting(false); return
      }

      // Replace existing fromPdf annotations on the processed pages
      const replaced = annots.filter(a => !(pagesToProcess.includes(a.page) && a.fromPdf))
      pushHistory([...replaced, ...newAnnots])
      setTool('select')
      setExtractMsg(`Extracted ${newAnnots.length} text block${newAnnots.length !== 1 ? 's' : ''}. Click any block to edit it.`)
    } catch (err) {
      setExtractMsg('Extraction failed: ' + (err instanceof Error ? err.message : String(err)))
    }
    setExtracting(false)
  }, [annots, currentPage, numPages, zoom, pushHistory])

  // ── Export ───────────────────────────────────────────────────────────────────
  const exportPdf = async () => {
    if (!pdfBytes) return
    setExporting(true); setExportError('')
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
      const doc = await PDFDocument.load(pdfBytes)
      const pages = doc.getPages()
      const fonts: Record<string, unknown> = {
        Helvetica: await doc.embedFont(StandardFonts.Helvetica),
        'Helvetica-Bold': await doc.embedFont(StandardFonts.HelveticaBold),
        'Helvetica-Oblique': await doc.embedFont(StandardFonts.HelveticaOblique),
        'Helvetica-BoldOblique': await doc.embedFont(StandardFonts.HelveticaBoldOblique),
        TimesRoman: await doc.embedFont(StandardFonts.TimesRoman),
        'TimesRoman-Bold': await doc.embedFont(StandardFonts.TimesRomanBold),
        'TimesRoman-Italic': await doc.embedFont(StandardFonts.TimesRomanItalic),
        'TimesRoman-BoldItalic': await doc.embedFont(StandardFonts.TimesRomanBoldItalic),
        Courier: await doc.embedFont(StandardFonts.Courier),
        'Courier-Bold': await doc.embedFont(StandardFonts.CourierBold),
        'Courier-Oblique': await doc.embedFont(StandardFonts.CourierOblique),
        'Courier-BoldOblique': await doc.embedFont(StandardFonts.CourierBoldOblique),
      }
      const hex2rgb = (h: string) => {
        const n = parseInt(h.slice(1), 16)
        return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
      }
      for (let pi = 0; pi < pages.length; pi++) {
        const page = pages[pi]; const { width: pw, height: ph } = page.getSize()
        const toX = (n: number) => n * pw
        const toY = (n: number, hn = 0) => ph - (n + hn) * ph
        for (const a of annots.filter(a => a.page === pi + 1)) {
          const col = a.color.startsWith('#') ? hex2rgb(a.color) : rgb(0, 0, 0)
          const fill = a.fillColor && a.fillColor !== 'transparent' && a.fillColor.startsWith('#') ? hex2rgb(a.fillColor) : undefined
          if (a.type === 'rect') {
            page.drawRectangle({ x: toX(a.x), y: toY(a.y, a.h), width: a.w * pw, height: a.h * ph, borderColor: col, borderWidth: a.strokeWidth, color: fill, opacity: a.opacity })
          } else if (a.type === 'ellipse') {
            page.drawEllipse({ x: toX(a.x + a.w / 2), y: toY(a.y + a.h / 2), xScale: a.w * pw / 2, yScale: a.h * ph / 2, borderColor: col, borderWidth: a.strokeWidth, color: fill, opacity: a.opacity })
          } else if (a.type === 'whitebox') {
            page.drawRectangle({ x: toX(a.x), y: toY(a.y, a.h), width: a.w * pw, height: a.h * ph, color: rgb(1, 1, 1), opacity: 1 })
          } else if (a.type === 'line' && a.x1 != null && a.y1 != null && a.x2 != null && a.y2 != null) {
            page.drawLine({ start: { x: toX(a.x1), y: toY(a.y1) }, end: { x: toX(a.x2), y: toY(a.y2) }, color: col, thickness: a.strokeWidth, opacity: a.opacity })
          } else if (a.type === 'arrow' && a.x1 != null && a.y1 != null && a.x2 != null && a.y2 != null) {
            const px1 = toX(a.x1), py1 = toY(a.y1), px2 = toX(a.x2), py2 = toY(a.y2)
            page.drawLine({ start: { x: px1, y: py1 }, end: { x: px2, y: py2 }, color: col, thickness: a.strokeWidth, opacity: a.opacity })
            const ang = Math.atan2(py2 - py1, px2 - px1)
            for (const da of [Math.PI * 0.75, -Math.PI * 0.75])
              page.drawLine({ start: { x: px2, y: py2 }, end: { x: px2 + Math.cos(ang + da) * 12, y: py2 + Math.sin(ang + da) * 12 }, color: col, thickness: a.strokeWidth })
          } else if ((a.type === 'draw' || a.type === 'highlight') && a.points && a.points.length >= 2) {
            for (let i = 1; i < a.points.length; i++)
              page.drawLine({ start: { x: a.points[i - 1][0] * pw, y: ph - a.points[i - 1][1] * ph }, end: { x: a.points[i][0] * pw, y: ph - a.points[i][1] * ph }, color: col, thickness: a.strokeWidth, opacity: a.type === 'highlight' ? 0.4 : a.opacity })
          } else if (a.type === 'text' && a.text) {
            // For extracted text: whitebox the original area so we can draw fresh text over it
            if (a.fromPdf) {
              page.drawRectangle({
                x: toX(a.x) - 1, y: toY(a.y, a.h) - 2,
                width: a.w * pw + 2, height: a.h * ph + 4,
                color: rgb(1, 1, 1), opacity: 1,
              })
            }
            const base = FONTS.find(f => f.css === a.fontFamily)?.pdf ?? 'Helvetica'
            const key = `${base}${a.bold && a.italic ? '-BoldOblique' : a.bold ? '-Bold' : a.italic ? '-Italic' : ''}`
            const font = (fonts[key] ?? fonts[base]) as unknown as NonNullable<Parameters<typeof page.drawText>[1]>['font']
            // Use original PDF point size if available, otherwise convert from CSS px
            const sz = a.fontSizePdf ?? (a.fontSize ?? 16) * 0.75
            let ly = toY(a.y) - sz * 0.2  // slight baseline offset
            for (const line of a.text.split('\n')) {
              if (line) page.drawText(line, { x: toX(a.x), y: ly, size: sz, font, color: col, opacity: a.opacity })
              ly -= sz * 1.35
            }
          }
        }
      }
      const out = await doc.save()
      const url = URL.createObjectURL(new Blob([new Uint8Array(out).buffer as ArrayBuffer], { type: 'application/pdf' }))
      const link = document.createElement('a'); link.href = url; link.download = fileName.replace('.pdf', '-edited.pdf'); link.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) { setExportError(err instanceof Error ? err.message : 'Export failed') }
    setExporting(false)
  }

  // ── Upload screen ────────────────────────────────────────────────────────────
  if (!pdfBytes) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <AdSlot position="header" />
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) loadPdf(e.dataTransfer.files[0]) }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${isDragging ? 'border-violet-500 bg-violet-50' : 'border-gray-200 bg-white hover:border-violet-400 hover:bg-violet-50/30'}`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) { loadPdf(e.target.files[0]); e.target.value = '' } }} />
          <div className="w-20 h-20 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <p className="font-display font-bold text-ink text-xl mb-2">Drop your PDF here to start editing</p>
          <p className="text-mute text-sm mb-5">Click to browse or drag & drop · PDF only · 100% in your browser</p>
          <button className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
            Select PDF File
          </button>
          <div className="mt-5 inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1 text-xs text-green-700">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            Your file never leaves your browser
          </div>
        </div>
        <AdSlot position="footer" />
      </div>
    )
  }

  // ── Editor UI ────────────────────────────────────────────────────────────────
  const isHL = tool === 'highlight' || selected?.type === 'highlight'
  const showShapeProps = ['rect', 'ellipse', 'draw'].includes(tool) || (selected && ['rect', 'ellipse', 'draw'].includes(selected.type))
  const activeColor = selected ? selected.color : (isHL ? hlColor : color)
  const activeStroke = selected ? selected.strokeWidth : (isHL ? hlSize : strokeWidth)
  const activeOpacity = selected ? selected.opacity : opacity

  return (
    <div className="flex flex-col bg-[#f1f3f5]"
      style={{ position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, zIndex: 40 }}>

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 flex items-center gap-1 px-3 h-14 shrink-0 shadow-sm">
        <div className="flex items-center gap-2 mr-3 min-w-0">
          <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
          </div>
          <span className="text-sm font-semibold text-gray-700 truncate max-w-[180px]">{fileName}</span>
        </div>

        <div className="w-px h-8 bg-gray-200 mx-1" />

        <div className="flex items-center gap-0.5 flex-wrap">
          {TOOL_LIST.map((td) => (
            <button key={td.id} title={`${td.label} (${td.shortcut})`} onClick={() => setTool(td.id)}
              className={`flex flex-col items-center justify-center gap-0.5 w-[54px] h-11 rounded-xl text-xs font-medium transition-all border ${tool === td.id ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-700'}`}>
              <span className="w-4 h-4">{td.icon}</span>
              <span className="text-[9px] leading-none">{td.label}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-gray-200 mx-1" />

        <div className="flex items-center gap-0.5">
          <button onClick={undo} disabled={historyIdx <= 0} title="Undo (Ctrl+Z)"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
          </button>
          <button onClick={redo} disabled={historyIdx >= history.length - 1} title="Redo"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13"/></svg>
          </button>
        </div>

        {selectedId && (
          <>
            <div className="w-px h-8 bg-gray-200 mx-1" />
            <button onClick={() => { pushHistory(annots.filter(a => a.id !== selectedId)); setSelectedId(null) }}
              className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.995-1.858L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              Delete
            </button>
          </>
        )}

        <div className="flex-1" />

        {/* Extract Text button */}
        <div className="relative mr-1">
          <button
            onClick={() => setShowExtractMenu(v => !v)}
            disabled={extracting}
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors disabled:opacity-50"
            title="Extract text from PDF to make it editable">
            {extracting
              ? <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h10M7 16h6m4-12H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 3v4a1 1 0 001 1h4"/></svg>}
            {extracting ? 'Extracting…' : 'Extract Text'}
            <svg className="w-3 h-3 ml-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7"/></svg>
          </button>
          {showExtractMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[200px]">
              <button onClick={() => extractPageText(false)}
                className="w-full px-4 py-3 text-sm text-left hover:bg-amber-50 flex items-center gap-3 transition-colors">
                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <div>
                  <p className="font-semibold text-gray-800">Current Page</p>
                  <p className="text-xs text-gray-500">Extract text from page {currentPage}</p>
                </div>
              </button>
              <div className="h-px bg-gray-100" />
              <button onClick={() => extractPageText(true)}
                className="w-full px-4 py-3 text-sm text-left hover:bg-amber-50 flex items-center gap-3 transition-colors">
                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                <div>
                  <p className="font-semibold text-gray-800">All Pages</p>
                  <p className="text-xs text-gray-500">Extract text from all {numPages} pages</p>
                </div>
              </button>
            </div>
          )}
        </div>

        <button onClick={() => { setPdfBytes(null); setFileName(''); setAnnots([]); setSelectedId(null); pdfDocRef.current = null; setTextBubble(null) }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Close file">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <button onClick={exportPdf} disabled={exporting}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
          {exporting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>}
          {exporting ? 'Saving…' : 'Save PDF'}
        </button>
      </div>

      {exportError && <div className="bg-red-50 border-b border-red-200 text-red-600 text-xs px-4 py-1.5 shrink-0">{exportError}</div>}
      {extractMsg && (
        <div className={`border-b text-xs px-4 py-1.5 shrink-0 flex items-center justify-between ${extractMsg.startsWith('No') || extractMsg.startsWith('Extraction') ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          <span>{extractMsg}</span>
          <button onClick={() => setExtractMsg('')} className="ml-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Thumbnails */}
        <div className="w-[130px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col items-center py-4 gap-3">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
            <ThumbnailItem key={n} pageNum={n} pdfDoc={pdfDocRef.current} current={currentPage === n} onClick={() => setCurrentPage(n)} />
          ))}
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-8">
          <div className="relative inline-block shadow-2xl rounded-sm" style={{ background: '#fff' }}>
            <canvas ref={canvasRef} className="block" />
            <canvas ref={drawCanvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} />

            {/* SVG annotation overlay */}
            <svg className="absolute inset-0 overflow-visible" style={{ width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }} viewBox="0 0 1 1" preserveAspectRatio="none">
              {annots.filter(a => a.page === currentPage && !['text', 'draw', 'highlight'].includes(a.type)).map(a => (
                <AnnotShape key={a.id} annot={a} selected={a.id === selectedId} />
              ))}
              {annots.filter(a => a.page === currentPage && a.type === 'highlight').map(a => (
                <BrushPath key={a.id} annot={a} selected={a.id === selectedId} isHighlight />
              ))}
              {annots.filter(a => a.page === currentPage && a.type === 'draw').map(a => (
                <BrushPath key={a.id} annot={a} selected={a.id === selectedId} isHighlight={false} />
              ))}
            </svg>

            {/* Text annotations (display only) */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 12 }}>
              {annots.filter(a => a.page === currentPage && a.type === 'text').map(a => (
                <TextLabel key={a.id} annot={a} selected={a.id === selectedId} />
              ))}
            </div>

            {/* Interaction overlay */}
            <div className="absolute inset-0"
              style={{ zIndex: 15, cursor: tool === 'select' ? 'default' : tool === 'text' ? 'text' : 'crosshair', pointerEvents: textBubble ? 'none' : 'auto' }}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} />

            {selected && selected.type !== 'text' && <SelectionHandles annot={selected} />}
          </div>
        </div>

        {/* Right: Properties */}
        <div className="w-[240px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-5">

            {/* Highlight tool: dedicated color palette */}
            {tool === 'highlight' || selected?.type === 'highlight' ? (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Highlight Color</p>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {HL_PALETTE.map((c) => (
                    <button key={c} onClick={() => { setHlColor(c); if (selected) patch({ color: c }) }}
                      style={{ background: c, border: (selected?.color ?? hlColor) === c ? '2px solid #8b5cf6' : '2px solid transparent' }}
                      className="w-full h-8 rounded-lg transition-all hover:scale-110 shadow-sm" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Brush Size</p>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-md px-1.5 py-0.5">{selected ? selected.strokeWidth : hlSize}px</span>
                  </div>
                  <input type="range" min="8" max="50" value={selected ? selected.strokeWidth : hlSize}
                    onChange={(e) => { const v = Number(e.target.value); setHlSize(v); if (selected) patch({ strokeWidth: v }) }}
                    className="w-full accent-violet-600" />
                  <div className="flex gap-1 mt-2">
                    {[10, 16, 24, 32, 44].map(w => (
                      <button key={w} onClick={() => { setHlSize(w); if (selected) patch({ strokeWidth: w }) }}
                        className={`flex-1 h-7 rounded-lg text-xs font-medium transition-all ${(selected ? selected.strokeWidth : hlSize) === w ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{w}</button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Main color palette */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Color</p>
                  <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {PALETTE.map((c) => (
                      <button key={c} onClick={() => { setColor(c); if (selected) patch({ color: c }) }}
                        style={{ background: c, border: activeColor === c ? '2px solid #8b5cf6' : c === '#ffffff' ? '1.5px solid #e5e7eb' : '2px solid transparent' }}
                        className="w-8 h-8 rounded-lg transition-all hover:scale-110 shadow-sm" />
                    ))}
                  </div>
                  <input type="color" value={activeColor.startsWith('#') ? activeColor : '#000000'}
                    onChange={(e) => { setColor(e.target.value); if (selected) patch({ color: e.target.value }) }}
                    className="w-full h-8 rounded-lg cursor-pointer border border-gray-200 px-1" />
                </div>

                {/* Fill color */}
                {showShapeProps && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Fill Color</p>
                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                      <button onClick={() => { setFillColor('transparent'); if (selected) patch({ fillColor: 'transparent' }) }}
                        style={{ border: fillColor === 'transparent' ? '2px solid #8b5cf6' : '1.5px solid #e5e7eb' }}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:scale-110 transition-all">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                      </button>
                      {PALETTE.slice(0, 9).map((c) => (
                        <button key={c} onClick={() => { setFillColor(c); if (selected) patch({ fillColor: c }) }}
                          style={{ background: c, border: fillColor === c ? '2px solid #8b5cf6' : c === '#ffffff' ? '1.5px solid #e5e7eb' : '2px solid transparent' }}
                          className="w-8 h-8 rounded-lg transition-all hover:scale-110 shadow-sm" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Stroke width */}
                {tool !== 'text' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Stroke Width</p>
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-md px-1.5 py-0.5">{activeStroke}px</span>
                    </div>
                    <input type="range" min="1" max="20" value={activeStroke}
                      onChange={(e) => { const v = Number(e.target.value); setStrokeWidth(v); if (selected) patch({ strokeWidth: v }) }}
                      className="w-full accent-violet-600" />
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 5, 8].map(w => (
                        <button key={w} onClick={() => { setStrokeWidth(w); if (selected) patch({ strokeWidth: w }) }}
                          className={`flex-1 h-7 rounded-lg text-xs font-medium transition-all ${activeStroke === w ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{w}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opacity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Opacity</p>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-md px-1.5 py-0.5">{Math.round(activeOpacity * 100)}%</span>
                  </div>
                  <input type="range" min="0.1" max="1" step="0.05" value={activeOpacity}
                    onChange={(e) => { const v = Number(e.target.value); setOpacity(v); if (selected) patch({ opacity: v }) }}
                    className="w-full accent-violet-600" />
                </div>
              </>
            )}

            {/* Text hint */}
            {tool === 'text' && (
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-700 leading-relaxed">
                Click anywhere on the PDF to add text. Click existing text to edit it.
              </div>
            )}

            {/* Extracted text block info */}
            {selected?.fromPdf && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Extracted PDF Text
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Double-click this block to edit the text. On export, the original text will be replaced.
                </p>
                <button
                  onClick={() => {
                    const a = selected
                    const r = canvasRef.current?.getBoundingClientRect()
                    if (!r) return
                    setTextBubble({ screenX: r.left + a.x * r.width + 10, screenY: r.top + a.y * r.height + 10, normX: a.x, normY: a.y, existingId: a.id, initialText: a.text ?? '', initialFont: a.fontFamily ?? FONTS[0].css, initialSize: a.fontSize ?? 16, initialBold: a.bold ?? false, initialItalic: a.italic ?? false, initialUnderline: a.underline ?? false, initialColor: a.color, initialAlign: a.align ?? 'left' })
                  }}
                  className="w-full h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors">
                  Edit Text
                </button>
              </div>
            )}

            {/* Keyboard shortcuts */}
            <div className="h-px bg-gray-100" />
            <div className="text-[10px] text-gray-400 leading-relaxed space-y-0.5">
              <p className="font-semibold text-gray-500 mb-1">Keyboard Shortcuts</p>
              {TOOL_LIST.map(t => <p key={t.id}><span className="font-mono bg-gray-100 px-1 rounded">{t.shortcut}</span> — {t.label}</p>)}
              <p><span className="font-mono bg-gray-100 px-1 rounded">Del</span> — Delete selected</p>
              <p><span className="font-mono bg-gray-100 px-1 rounded">Ctrl+Z</span> — Undo</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-200 flex items-center justify-between px-4 h-10 shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
          </button>
          <span className="text-xs font-medium text-gray-600 px-2">Page <span className="font-bold text-gray-800">{currentPage}</span> / {numPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage === numPages}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.4, +(z - 0.25).toFixed(2)))}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 font-bold text-base transition-colors">−</button>
          <div className="flex items-center gap-1">
            {[0.75, 1, 1.25, 1.5, 2].map(z => (
              <button key={z} onClick={() => setZoom(z)}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md transition-colors ${zoom === z ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                {Math.round(z * 100)}%
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-700 bg-gray-100 rounded-md px-2 py-0.5">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 font-bold text-base transition-colors">+</button>
        </div>
      </div>

      {/* ── Text Input Portal ─────────────────────────────────────────────── */}
      {textBubble && (
        <TextInputPortal
          bubble={textBubble}
          onConfirm={confirmText}
          onCancel={() => setTextBubble(null)}
        />
      )}
    </div>
  )
}

// ── TextInputPortal — renders into document.body, zero z-index conflicts ──────

function TextInputPortal({ bubble, onConfirm, onCancel }: {
  bubble: TextBubble
  onConfirm: (data: { text: string; font: string; size: number; bold: boolean; italic: boolean; underline: boolean; color: string; align: 'left' | 'center' | 'right' }) => void
  onCancel: () => void
}) {
  const [text, setText] = useState(bubble.initialText)
  const [font, setFont] = useState(bubble.initialFont)
  const [size, setSize] = useState(bubble.initialSize)
  const [isBold, setIsBold] = useState(bubble.initialBold)
  const [isItalic, setIsItalic] = useState(bubble.initialItalic)
  const [isUnderline, setIsUnderline] = useState(bubble.initialUnderline)
  const [textColor, setTextColor] = useState(bubble.initialColor)
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>(bubble.initialAlign)
  const [pos, setPos] = useState({ left: bubble.screenX + 10, top: bubble.screenY + 10 })
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Position the popup within the viewport
  useEffect(() => {
    if (typeof window === 'undefined') return
    setPos({
      left: Math.max(16, Math.min(bubble.screenX + 10, window.innerWidth - 360)),
      top: Math.max(16, Math.min(bubble.screenY + 10, window.innerHeight - 380)),
    })
  }, [bubble.screenX, bubble.screenY])

  // Focus + select-all after position settles — reliable in portals
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (taRef.current) {
        taRef.current.focus()
        taRef.current.select()
      }
    })
    return () => cancelAnimationFrame(id)
  }, [pos])

  const confirm = () => {
    if (text.trim()) onConfirm({ text: text.trim(), font, size, bold: isBold, italic: isItalic, underline: isUnderline, color: textColor, align: textAlign })
    else onCancel()
  }

  if (typeof document === 'undefined') return null

  const btnBase: React.CSSProperties = { width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }
  const btnActive: React.CSSProperties = { ...btnBase, border: '1px solid #8b5cf6', background: '#ede9fe', color: '#7c3aed' }
  const btnInactive: React.CSSProperties = { ...btnBase, background: 'white', color: '#6b7280' }

  const isPdfEdit = !!bubble.fromPdfHit

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div style={{ position: 'absolute', left: pos.left, top: pos.top, width: 360, background: '#fff', border: isPdfEdit ? '1.5px solid #f59e0b' : '1.5px solid #e5e7eb', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.22)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: isPdfEdit ? '#fffbeb' : '#f8f9fa', borderBottom: `1px solid ${isPdfEdit ? '#fde68a' : '#e5e7eb'}`, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {isPdfEdit && (
              <span style={{ background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>PDF TEXT</span>
            )}
            <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>
              {bubble.existingId ? 'Edit Text' : isPdfEdit ? 'Edit PDF Text' : 'Add Text'}
            </span>
          </div>
          <button onMouseDown={(e) => { e.stopPropagation(); onCancel() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* Tip for PDF text edits */}
        {isPdfEdit && (
          <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '6px 14px', fontSize: 11, color: '#92400e', lineHeight: 1.4 }}>
            ✏️ Original text is pre-filled. Edit it below then click <strong>Replace Text</strong>.
          </div>
        )}

        {/* Format toolbar */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          <select value={font} onChange={e => setFont(e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            style={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6, padding: '3px 6px', color: '#374151', background: 'white' }}>
            {FONTS.map(f => <option key={f.label} value={f.css}>{f.label}</option>)}
          </select>
          <select value={size} onChange={e => setSize(Number(e.target.value))}
            onMouseDown={e => e.stopPropagation()}
            style={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6, padding: '3px 6px', color: '#374151', background: 'white', width: 60 }}>
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onMouseDown={e => { e.stopPropagation(); setIsBold(v => !v) }} style={isBold ? btnActive : btnInactive}>B</button>
          <button onMouseDown={e => { e.stopPropagation(); setIsItalic(v => !v) }} style={{ ...(isItalic ? btnActive : btnInactive), fontStyle: 'italic' }}>I</button>
          <button onMouseDown={e => { e.stopPropagation(); setIsUnderline(v => !v) }} style={{ ...(isUnderline ? btnActive : btnInactive), textDecoration: 'underline' }}>U</button>
          <input type="color" value={textColor.startsWith('#') ? textColor : '#000000'}
            onChange={e => setTextColor(e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, padding: 2, cursor: 'pointer' }} />
          {(['left', 'center', 'right'] as const).map(a => (
            <button key={a} onMouseDown={e => { e.stopPropagation(); setTextAlign(a) }}
              style={{ ...(textAlign === a ? btnActive : btnInactive) }}>
              <svg width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {a === 'left' && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></>}
                {a === 'center' && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>}
                {a === 'right' && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          ))}
        </div>

        {/* Textarea — always 14px so it reads like an editor, not a styled label */}
        <div style={{ padding: '10px 14px' }}>
          <textarea
            ref={taRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              e.stopPropagation()
              if (e.key === 'Escape') { e.preventDefault(); onCancel() }
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); confirm() }
            }}
            placeholder={isPdfEdit ? 'Edit the text above…' : 'Type your text… (Enter to place, Shift+Enter for new line)'}
            style={{
              width: '100%', minHeight: 90, resize: 'vertical',
              border: `1.5px solid ${isPdfEdit ? '#f59e0b' : '#8b5cf6'}`, borderRadius: 8,
              padding: '8px 10px',
              // Always 14px in the editing box — actual size set via the size selector
              fontSize: 14, fontFamily: 'inherit',
              color: '#111827',
              outline: 'none', boxSizing: 'border-box',
              background: '#fff', lineHeight: 1.6,
              boxShadow: `0 0 0 3px ${isPdfEdit ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.12)'}`,
              cursor: 'text',
            }}
          />
          {isPdfEdit && (
            <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
              Size: <strong>{size}px</strong> · All text above is selected — just start typing to replace it
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding: '4px 14px 14px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onMouseDown={e => { e.stopPropagation(); onCancel() }}
            style={{ padding: '7px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            Cancel
          </button>
          <button onMouseDown={e => { e.stopPropagation(); confirm() }}
            style={{ padding: '7px 18px', border: 'none', borderRadius: 8, background: isPdfEdit ? '#f59e0b' : '#8b5cf6', color: 'white', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            {bubble.existingId ? 'Update' : isPdfEdit ? 'Replace Text' : 'Place Text'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Thumbnail ─────────────────────────────────────────────────────────────────

function ThumbnailItem({ pageNum, pdfDoc, current, onClick }: {
  pageNum: number; pdfDoc: unknown; current: boolean; onClick: () => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!pdfDoc || !ref.current) return
    const doc = pdfDoc as { getPage: (n: number) => Promise<unknown> }
    doc.getPage(pageNum).then((page) => {
      const p = page as { getViewport: (o: { scale: number }) => { width: number; height: number }; render: (o: unknown) => { promise: Promise<void> } }
      const vp = p.getViewport({ scale: 0.2 })
      const cv = ref.current!
      cv.width = vp.width; cv.height = vp.height
      p.render({ canvasContext: cv.getContext('2d')!, viewport: vp }).promise.catch(() => {})
    })
  }, [pageNum, pdfDoc])
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
      <div className={`rounded-lg overflow-hidden border-2 transition-all ${current ? 'border-violet-500 shadow-md shadow-violet-200' : 'border-gray-200 group-hover:border-violet-300'}`}>
        <canvas ref={ref} className="block max-w-[90px]" />
      </div>
      <span className={`text-[10px] font-semibold ${current ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600'}`}>{pageNum}</span>
    </button>
  )
}

// ── Annotation renderers ──────────────────────────────────────────────────────

function AnnotShape({ annot: a, selected }: { annot: Annot; selected: boolean }) {
  const sw = a.strokeWidth * 0.003
  const col = a.color
  const fill = a.fillColor === 'transparent' ? 'none' : (a.fillColor || 'none')
  const dash = selected ? `${sw * 3} ${sw * 1.5}` : undefined

  if (a.type === 'rect') return <rect x={a.x} y={a.y} width={a.w} height={a.h} stroke={col} strokeWidth={sw} fill={fill} opacity={a.opacity} strokeDasharray={dash} />
  if (a.type === 'ellipse') return <ellipse cx={a.x + a.w / 2} cy={a.y + a.h / 2} rx={a.w / 2} ry={a.h / 2} stroke={col} strokeWidth={sw} fill={fill} opacity={a.opacity} />
  if (a.type === 'whitebox') return <rect x={a.x} y={a.y} width={a.w} height={a.h} fill="#ffffff" opacity={1} stroke={selected ? '#8b5cf6' : 'none'} strokeWidth={selected ? 0.002 : 0} />
  if (a.type === 'line' && a.x1 != null && a.y1 != null && a.x2 != null && a.y2 != null)
    return <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={col} strokeWidth={sw} opacity={a.opacity} strokeLinecap="round" />
  if (a.type === 'arrow' && a.x1 != null && a.y1 != null && a.x2 != null && a.y2 != null) {
    const headSize = Math.max(sw * 4, 0.015)
    return (
      <g opacity={a.opacity}>
        <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={col} strokeWidth={sw} strokeLinecap="round" />
        <polygon points={arrowHeadPts(a.x1, a.y1, a.x2, a.y2, headSize)} fill={col} stroke="none" />
      </g>
    )
  }
  return null
}

function BrushPath({ annot: a, selected, isHighlight }: { annot: Annot; selected: boolean; isHighlight: boolean }) {
  if (!a.points || a.points.length < 2) return null
  const sw = a.strokeWidth * 0.003
  const d = smoothPath(a.points)
  return (
    <path d={d} stroke={a.color} strokeWidth={sw} fill="none"
      opacity={isHighlight ? 0.4 : a.opacity}
      strokeLinejoin="round" strokeLinecap="round"
      strokeDasharray={selected ? `${sw * 3} ${sw * 1.5}` : undefined} />
  )
}

function TextLabel({ annot: a, selected }: { annot: Annot; selected: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${a.x * 100}%`, top: `${a.y * 100}%`,
      color: a.color, fontFamily: a.fontFamily,
      fontSize: a.fontSize ?? 16,
      fontWeight: a.bold ? 'bold' : 'normal',
      fontStyle: a.italic ? 'italic' : 'normal',
      textDecoration: a.underline ? 'underline' : 'none',
      textAlign: a.align ?? 'left',
      opacity: a.opacity, padding: '1px 2px', borderRadius: 2,
      whiteSpace: 'pre-wrap', lineHeight: 1.35,
      pointerEvents: 'none',
      // Extracted text: amber dotted outline so user knows it's editable
      outline: selected ? '2px solid #8b5cf6' : a.fromPdf ? '1px dashed rgba(217,119,6,0.6)' : 'none',
      // White cover so edited text visually replaces the original underneath
      background: a.fromPdf ? 'rgba(255,255,255,0.96)' : 'transparent',
      boxShadow: a.fromPdf ? '0 0 0 3px rgba(255,255,255,0.96)' : 'none',
      zIndex: 12, userSelect: 'none',
    }}>
      {a.text}
    </div>
  )
}

function SelectionHandles({ annot: a }: { annot: Annot }) {
  const corners = [
    { l: a.x * 100, t: a.y * 100 },
    { l: (a.x + a.w) * 100, t: a.y * 100 },
    { l: a.x * 100, t: (a.y + a.h) * 100 },
    { l: (a.x + a.w) * 100, t: (a.y + a.h) * 100 },
  ]
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 16 }}>
      {corners.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: `${c.l}%`, top: `${c.t}%`, transform: 'translate(-50%,-50%)' }}
          className="w-3 h-3 bg-white border-2 border-violet-500 rounded-sm shadow-sm" />
      ))}
    </div>
  )
}
