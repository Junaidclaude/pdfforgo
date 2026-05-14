'use client'

import { useState, useRef } from 'react'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'

type Status = 'idle' | 'converting' | 'done' | 'error'

interface Line {
  y: number
  height: number
  text: string
}

function groupItemsIntoLines(items: Array<{ str: string; transform: number[]; height: number; hasEOL: boolean }>): Line[] {
  if (items.length === 0) return []

  const lines: Line[] = []
  let currentItems: typeof items = []
  let currentY = items[0].transform[5]

  for (const item of items) {
    const itemY = item.transform[5]
    const isSameLine = Math.abs(itemY - currentY) < 3

    if (isSameLine) {
      currentItems.push(item)
    } else {
      if (currentItems.length > 0) {
        const sortedByX = [...currentItems].sort((a, b) => a.transform[4] - b.transform[4])
        lines.push({
          y: currentY,
          height: Math.max(...currentItems.map(i => i.height)),
          text: sortedByX.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim(),
        })
      }
      currentItems = [item]
      currentY = itemY
    }
  }

  if (currentItems.length > 0) {
    const sortedByX = [...currentItems].sort((a, b) => a.transform[4] - b.transform[4])
    lines.push({
      y: currentY,
      height: Math.max(...currentItems.map(i => i.height)),
      text: sortedByX.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim(),
    })
  }

  return lines.filter(l => l.text.length > 0)
}

export default function PdfToWordTool() {
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
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file.')
      setStatus('error')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File too large. Maximum size is 50 MB.')
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
      setProgress(15)

      // Load PDF and extract text
      const pdfjs = await getPdfjs()
      const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
      setProgress(25)

      const allLines: Line[] = []
      const totalPages = pdfDoc.numPages

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i)
        const textContent = await page.getTextContent()

        const items = textContent.items
          .filter((item): item is typeof item & { str: string; transform: number[]; height: number; hasEOL: boolean } =>
            'str' in item && item.str.trim().length > 0
          )
          // Sort top-to-bottom (PDF uses bottom-up coords, so sort by y descending)
          .sort((a, b) => b.transform[5] - a.transform[5])

        const pageLines = groupItemsIntoLines(items)
        allLines.push(...pageLines)

        // Add blank line between pages
        if (i < totalPages) {
          allLines.push({ y: -1, height: 0, text: '' })
        }

        setProgress(25 + Math.floor((i / totalPages) * 40))
      }

      setProgress(68)

      // Detect median font height for heading classification
      const nonEmptyLines = allLines.filter(l => l.text.length > 0 && l.height > 0)
      const heights = nonEmptyLines.map(l => l.height).sort((a, b) => a - b)
      const medianHeight = heights[Math.floor(heights.length / 2)] ?? 12

      // Build docx document
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
      setProgress(75)

      const paragraphs = allLines.map(line => {
        if (line.text === '') {
          return new Paragraph({ children: [new TextRun('')] })
        }

        const ratio = line.height / medianHeight

        if (ratio >= 1.8) {
          return new Paragraph({
            text: line.text,
            heading: HeadingLevel.HEADING_1,
          })
        }
        if (ratio >= 1.4) {
          return new Paragraph({
            text: line.text,
            heading: HeadingLevel.HEADING_2,
          })
        }
        if (ratio >= 1.15) {
          return new Paragraph({
            text: line.text,
            heading: HeadingLevel.HEADING_3,
          })
        }

        return new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun({
              text: line.text,
              size: 24, // 12pt in half-points
            }),
          ],
          spacing: { after: 100 },
        })
      })

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1080,    // ~0.75in in twentieths of a point
                  bottom: 1080,
                  left: 1260,   // ~0.875in
                  right: 1260,
                },
              },
            },
            children: paragraphs,
          },
        ],
      })

      setProgress(88)
      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      downloadRef.current = url
      setDownloadUrl(url)
      setOutputFileName(file.name.replace(/\.pdf$/i, '.docx'))
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
              ? 'border-royal bg-blue-50'
              : 'border-gray-200 bg-white hover:border-royal/50 hover:bg-blue-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={onFileInputChange}
          />
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-royal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="font-display font-bold text-ink text-lg mb-1">Drop your PDF here</p>
          <p className="text-mute text-sm">PDF files only · Max 50 MB</p>
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
            <div className="w-8 h-8 border-4 border-royal border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-display font-bold text-ink mb-1">Extracting text and building Word file…</p>
          <p className="text-mute text-sm mb-4">{fileName} · {(fileSize / 1024).toFixed(0)} KB</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-royal rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
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
          <p className="text-mute text-sm mb-6">{fileName} → DOCX</p>

          {/* AD_SLOT: pre_download_interstitial */}
          <AdSlot position="pre_download" />

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <a
              href={downloadUrl}
              download={outputFileName}
              className="flex-1 btn-royal text-center"
            >
              Download Word File
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
        <p><strong>100% private:</strong> Your PDF is converted entirely in your browser using PDF.js and docx.js. Nothing is uploaded to any server.</p>
        <p>Text and basic heading structure are extracted. Images, tables, and complex layouts from scanned PDFs are not supported — the output contains extracted text only.</p>
      </div>

      {/* AD_SLOT: footer_banner */}
      <AdSlot position="footer" />
    </div>
  )
}
