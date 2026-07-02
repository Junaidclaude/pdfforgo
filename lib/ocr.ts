// Shared OCR pipeline built on Tesseract.js, running entirely client-side.
// Renders each PDF page to a canvas via pdf.js, then recognizes text and
// reconstructs line-level bounding boxes (in canvas pixel space).
import type { PDFDocumentProxy } from 'pdfjs-dist'

const OCR_SCALE = 200 / 72 // ~200 DPI, good balance of accuracy vs canvas size

export interface OcrLine {
  text: string
  x0: number
  y0: number
  x1: number
  y1: number
}

export interface OcrPageResult {
  pageNum: number
  width: number
  height: number
  scale: number
  lines: OcrLine[]
}

function invertIfDark(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  const id = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = id.data
  // Sample ~200 evenly-spaced pixels for average luminance
  const step = Math.max(4, Math.floor(d.length / 800)) & ~3
  let lum = 0, n = 0
  for (let i = 0; i < d.length; i += step) { lum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114; n++ }
  if (lum / n < 128) {
    for (let i = 0; i < d.length; i += 4) { d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2] }
    ctx.putImageData(id, 0, 0)
  }
}

async function renderPageToCanvas(pdfDoc: PDFDocumentProxy, pageNum: number): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNum)
  const vp = page.getViewport({ scale: OCR_SCALE })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(vp.width)
  canvas.height = Math.round(vp.height)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvasContext: ctx, viewport: vp }).promise
  invertIfDark(canvas)
  return canvas
}

type TWord = { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }
type TLine = { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }

function extractLines(data: { blocks?: { paragraphs: { lines: TLine[] }[] }[] | null; words?: TWord[] | null }): OcrLine[] {
  // Tier 1: structured lines from blocks→paragraphs→lines (best bbox accuracy)
  const structuredLines: TLine[] = (data.blocks ?? []).flatMap((b) => b.paragraphs.flatMap((p) => p.lines))
  if (structuredLines.length > 0) {
    return structuredLines
      .map((l) => ({ text: l.text.replace(/\n/g, ' ').trim(), ...l.bbox }))
      .filter((l) => l.text.length > 0)
  }
  // Tier 2: group words by vertical proximity
  const words = (data.words ?? []).filter((w) => w.text.trim().length > 0)
  if (words.length === 0) return []
  const lineH = (words[0].bbox.y1 - words[0].bbox.y0) * 0.8 || 15
  const groups: TWord[][] = []
  for (const w of words) {
    const mid = (w.bbox.y0 + w.bbox.y1) / 2
    const g = groups.find((gr) => Math.abs(mid - (gr[0].bbox.y0 + gr[0].bbox.y1) / 2) < lineH)
    if (g) g.push(w); else groups.push([w])
  }
  groups.sort((a, b) => a[0].bbox.y0 - b[0].bbox.y0)
  return groups
    .map((gr) => {
      gr.sort((a, b) => a.bbox.x0 - b.bbox.x0)
      return {
        text: gr.map((w) => w.text).join(' ').trim(),
        x0: Math.min(...gr.map((w) => w.bbox.x0)),
        y0: Math.min(...gr.map((w) => w.bbox.y0)),
        x1: Math.max(...gr.map((w) => w.bbox.x1)),
        y1: Math.max(...gr.map((w) => w.bbox.y1)),
      }
    })
    .filter((l) => l.text.length > 0)
}

export async function ocrPdfPages(
  pdfDoc: PDFDocumentProxy,
  pageNumbers: number[],
  onProgress?: (done: number, total: number) => void,
): Promise<OcrPageResult[]> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  const results: OcrPageResult[] = []
  try {
    for (let i = 0; i < pageNumbers.length; i++) {
      const pageNum = pageNumbers[i]
      const canvas = await renderPageToCanvas(pdfDoc, pageNum)
      // Tesseract.js only populates data.blocks (needed for per-line bounding
      // boxes) when explicitly requested via the output-format options.
      const { data } = await worker.recognize(canvas.toDataURL('image/png'), {}, { blocks: true })
      results.push({ pageNum, width: canvas.width, height: canvas.height, scale: OCR_SCALE, lines: extractLines(data) })
      onProgress?.(i + 1, pageNumbers.length)
    }
  } finally {
    await worker.terminate()
  }
  return results
}

export function ocrResultsToText(results: OcrPageResult[]): string {
  return results.map((r) => r.lines.map((l) => l.text).join('\n')).join('\n\n')
}

// Overlays an invisible (opacity-0) text layer at each OCR'd line's position,
// making the original PDF's page images searchable/selectable without
// altering how the page looks.
export async function buildSearchablePdf(originalBytes: ArrayBuffer, results: OcrPageResult[]): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const doc = await PDFDocument.load(originalBytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  for (const r of results) {
    const page = pages[r.pageNum - 1]
    if (!page) continue
    const { width: pw, height: ph } = page.getSize()
    const sx = pw / r.width
    const sy = ph / r.height
    for (const line of r.lines) {
      const boxH = (line.y1 - line.y0) * sy
      const fontSize = Math.max(4, boxH * 0.85)
      page.drawText(line.text, {
        x: line.x0 * sx,
        y: ph - line.y1 * sy,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
        opacity: 0,
      })
    }
  }
  return doc.save()
}
