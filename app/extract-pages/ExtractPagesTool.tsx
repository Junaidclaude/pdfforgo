'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'

type Status = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error'
type OutputMode = 'single' | 'separate'

interface PageThumb {
  index: number
  dataUrl: string
}

interface OutputFile {
  name: string
  url: string
  size: number
}

export default function ExtractPagesTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [thumbs, setThumbs] = useState<PageThumb[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loadProgress, setLoadProgress] = useState(0)
  const [saveProgress, setSaveProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [outputMode, setOutputMode] = useState<OutputMode>('single')
  const [outputs, setOutputs] = useState<OutputFile[]>([])
  const [zipUrl, setZipUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [pageCount, setPageCount] = useState(0)

  const pdfBytesRef = useRef<Uint8Array | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const outputUrlsRef = useRef<string[]>([])

  useEffect(() => {
    return () => {
      outputUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
      if (zipUrl) URL.revokeObjectURL(zipUrl)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const revokeOutputs = () => {
    outputUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    outputUrlsRef.current = []
    if (zipUrl) { URL.revokeObjectURL(zipUrl); setZipUrl('') }
    setOutputs([])
  }

  const loadFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    setSelected(new Set())
    setThumbs([])
    revokeOutputs()

    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      pdfBytesRef.current = bytes

      const pdfjs = await getPdfjs()
      const pdfDoc = await pdfjs.getDocument({ data: bytes.slice() }).promise
      const total = pdfDoc.numPages
      setPageCount(total)
      setFileName(file.name)
      setLoadProgress(0)

      const generated: PageThumb[] = []
      for (let i = 1; i <= total; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: 0.4 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport }).promise
        generated.push({ index: i - 1, dataUrl: canvas.toDataURL('image/jpeg', 0.7) })
        canvas.width = 0; canvas.height = 0
        setLoadProgress(Math.round((i / total) * 100))
      }

      setThumbs(generated)
      setStatus('ready')
    } catch (err) {
      console.error(err)
      setErrorMsg('Could not read this PDF. It may be corrupted.')
      setStatus('error')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { loadFile(e.target.files[0]); e.target.value = '' }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingOver(false)
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0])
  }

  const togglePage = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(thumbs.map((t) => t.index)))
  const selectNone = () => setSelected(new Set())
  const invertSelection = () => setSelected(new Set(thumbs.filter((t) => !selected.has(t.index)).map((t) => t.index)))
  const selectOdd = () => setSelected(new Set(thumbs.filter((_, i) => i % 2 === 0).map((t) => t.index)))
  const selectEven = () => setSelected(new Set(thumbs.filter((_, i) => i % 2 !== 0).map((t) => t.index)))

  const extract = async () => {
    if (!pdfBytesRef.current || selected.size === 0) return
    setStatus('processing')
    setSaveProgress(0)
    setErrorMsg('')
    revokeOutputs()

    try {
      const { PDFDocument } = await import('pdf-lib')
      setSaveProgress(10)

      const srcDoc = await PDFDocument.load(pdfBytesRef.current, { ignoreEncryption: true })
      const baseName = fileName.replace(/\.pdf$/i, '')

      // Sort selected indices in document order
      const sortedIndices = Array.from(selected).sort((a, b) => a - b)

      if (outputMode === 'single') {
        // All selected pages → one PDF
        const outDoc = await PDFDocument.create()
        const copied = await outDoc.copyPages(srcDoc, sortedIndices)
        copied.forEach((p) => outDoc.addPage(p))
        setSaveProgress(70)
        const outBytes = await outDoc.save()
        setSaveProgress(95)

        const blob = new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        outputUrlsRef.current.push(url)
        setOutputs([{ name: `${baseName}_extracted.pdf`, url, size: outBytes.length }])
        setSaveProgress(100)
        setStatus('done')
      } else {
        // Each selected page → separate PDF, then ZIP
        const files: OutputFile[] = []
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()

        for (let i = 0; i < sortedIndices.length; i++) {
          const pageIdx = sortedIndices[i]
          const outDoc = await PDFDocument.create()
          const [copied] = await outDoc.copyPages(srcDoc, [pageIdx])
          outDoc.addPage(copied)
          const outBytes = await outDoc.save()

          const pageName = `${baseName}_page_${String(pageIdx + 1).padStart(3, '0')}.pdf`
          const blob = new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          outputUrlsRef.current.push(url)
          files.push({ name: pageName, url, size: outBytes.length })
          zip.file(pageName, outBytes)

          setSaveProgress(10 + Math.round(((i + 1) / sortedIndices.length) * 75))
        }

        setSaveProgress(88)
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const zUrl = URL.createObjectURL(zipBlob)
        setZipUrl(zUrl)
        setSaveProgress(100)
        setOutputs(files)
        setStatus('done')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Extraction failed. Please try again.')
      setStatus('error')
    }
  }

  const reset = () => {
    revokeOutputs()
    pdfBytesRef.current = null
    setThumbs([]); setSelected(new Set()); setStatus('idle')
    setLoadProgress(0); setSaveProgress(0); setErrorMsg('')
    setFileName(''); setPageCount(0)
  }

  const baseName = fileName.replace(/\.pdf$/i, '')
  const sortedSelected = Array.from(selected).sort((a, b) => a - b)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <AdSlot position="header" />

      {/* Drop zone */}
      {(status === 'idle' || status === 'error') && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${
            isDraggingOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileInputChange} />
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="font-syne font-bold text-dark text-lg mb-1">Drop your PDF here</p>
          <p className="text-gray-500 text-sm">Click page thumbnails to select the pages you want to extract</p>
          {status === 'error' && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}
        </div>
      )}

      {/* Loading thumbnails */}
      {status === 'loading' && (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-3">Loading page previews… {loadProgress}%</p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${loadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Ready / processing */}
      {(status === 'ready' || status === 'processing') && thumbs.length > 0 && (
        <div className="space-y-5">

          {/* Toolbar */}
          <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-syne font-bold text-dark text-sm truncate">{fileName}</p>
              <p className="text-xs text-gray-400">
                {pageCount} pages total ·{' '}
                {selected.size > 0 ? (
                  <span className="text-emerald-600 font-semibold">{selected.size} page{selected.size !== 1 ? 's' : ''} selected</span>
                ) : (
                  'Click pages to select them'
                )}
              </p>
            </div>

            {/* Quick-select buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-400 mr-1">Select:</span>
              {[
                ['All', selectAll],
                ['None', selectNone],
                ['Invert', invertSelection],
                ['Odd', selectOdd],
                ['Even', selectEven],
              ].map(([label, fn]) => (
                <button
                  key={label as string}
                  onClick={fn as () => void}
                  className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg transition-colors"
                >
                  {label as string}
                </button>
              ))}
              <button onClick={reset} className="px-2.5 py-1 text-xs text-gray-400 hover:text-red-500 transition-colors ml-1">
                Change file
              </button>
            </div>
          </div>

          {/* Page thumbnails */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {thumbs.map((thumb) => {
              const isSelected = selected.has(thumb.index)
              const selOrder = isSelected ? sortedSelected.indexOf(thumb.index) + 1 : null

              return (
                <button
                  key={thumb.index}
                  onClick={() => togglePage(thumb.index)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all group text-left ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md'
                      : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb.dataUrl}
                    alt={`Page ${thumb.index + 1}`}
                    className={`w-full aspect-[3/4] object-cover transition-all ${isSelected ? 'brightness-90' : 'brightness-100'}`}
                  />

                  {/* Page number bar */}
                  <div className={`absolute bottom-0 left-0 right-0 py-1 ${isSelected ? 'bg-emerald-500' : 'bg-black/50'}`}>
                    <p className="text-white text-[10px] text-center font-bold">{thumb.index + 1}</p>
                  </div>

                  {/* Selection badge */}
                  {isSelected && selOrder !== null && (
                    <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                      <span className="text-white text-[9px] font-extrabold">{selOrder}</span>
                    </div>
                  )}

                  {/* Hover check */}
                  {!isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-emerald-500/80 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected page order preview */}
          {selected.size > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-emerald-700 mb-2">
                Pages to extract (in document order):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sortedSelected.map((idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                  >
                    {idx + 1}
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePage(idx) }}
                      className="hover:text-emerald-200 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Output mode */}
          {selected.size > 0 && status === 'ready' && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <p className="font-syne font-bold text-dark text-sm mb-3">Output Format</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setOutputMode('single')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    outputMode === 'single'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${outputMode === 'single' ? 'border-emerald-500' : 'border-gray-300'}`}>
                      {outputMode === 'single' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </div>
                    <span className="font-syne font-bold text-dark text-sm">Single PDF</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-6.5">
                    All {selected.size} selected page{selected.size !== 1 ? 's' : ''} combined into one PDF file.
                  </p>
                </button>

                <button
                  onClick={() => setOutputMode('separate')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    outputMode === 'separate'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${outputMode === 'separate' ? 'border-emerald-500' : 'border-gray-300'}`}>
                      {outputMode === 'separate' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </div>
                    <span className="font-syne font-bold text-dark text-sm">Separate PDFs</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-6.5">
                    Each page saved as its own PDF. Downloaded as a ZIP file.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {errorMsg && status === 'ready' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">{errorMsg}</div>
          )}

          {/* Processing progress */}
          {status === 'processing' && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-dark">Extracting pages…</span>
                <span className="text-sm text-emerald-500 font-bold">{saveProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${saveProgress}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Your file never leaves your browser</p>
            </div>
          )}

          {/* Extract button */}
          {status === 'ready' && (
            <button
              onClick={extract}
              disabled={selected.size === 0}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-syne font-bold py-4 px-8 rounded-xl text-lg transition-colors"
            >
              {selected.size === 0
                ? 'Select pages to extract'
                : `Extract ${selected.size} Page${selected.size !== 1 ? 's' : ''} →`}
            </button>
          )}
        </div>
      )}

      {/* Done */}
      {status === 'done' && outputs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <p className="font-syne font-bold text-dark">
                {outputs.length === 1
                  ? `${selected.size} page${selected.size !== 1 ? 's' : ''} extracted!`
                  : `${outputs.length} PDF files ready`}
              </p>
              <p className="text-sm text-gray-500">
                {outputMode === 'single'
                  ? `${(outputs[0].size / 1024).toFixed(0)} KB`
                  : `${outputs.length} files · download as ZIP`}
              </p>
            </div>
          </div>

          <AdSlot position="pre_download" />

          {/* Single PDF download */}
          {outputMode === 'single' && outputs.length === 1 && (
            <a
              href={outputs[0].url}
              download={outputs[0].name}
              className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors"
            >
              Download Extracted PDF
            </a>
          )}

          {/* Separate PDFs */}
          {outputMode === 'separate' && (
            <div className="space-y-3">
              {/* ZIP download */}
              {zipUrl && (
                <a
                  href={zipUrl}
                  download={`${baseName}_extracted_pages.zip`}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Download All as ZIP ({outputs.length} files)
                </a>
              )}

              {/* Individual file list */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Individual Files</p>
                </div>
                <ul className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                  {outputs.map((out, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <span className="text-xs text-gray-600 flex-1 truncate">{out.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{(out.size / 1024).toFixed(0)} KB</span>
                      <a href={out.url} download={out.name} className="text-xs font-semibold text-emerald-500 hover:text-emerald-700 flex-shrink-0 transition-colors">
                        ↓
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button
            onClick={reset}
            className="w-full py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors"
          >
            Extract from Another PDF
          </button>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-4">🔒 Your file never leaves your browser</p>
    </div>
  )
}
