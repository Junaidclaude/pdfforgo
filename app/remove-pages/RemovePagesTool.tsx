'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'

type Status = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error'

interface PageThumb {
  index: number       // 0-based
  dataUrl: string
}

export default function RemovePagesTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [thumbs, setThumbs] = useState<PageThumb[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [outputSize, setOutputSize] = useState(0)
  const [fileName, setFileName] = useState('')
  const [pageCount, setPageCount] = useState(0)

  const pdfBytesRef = useRef<Uint8Array | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const downloadRef = useRef<string>('')

  useEffect(() => {
    return () => { if (downloadRef.current) URL.revokeObjectURL(downloadRef.current) }
  }, [])

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
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = ''; setDownloadUrl('') }

    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      pdfBytesRef.current = bytes

      const pdfjs = await getPdfjs()
      const pdfDoc = await pdfjs.getDocument({ data: bytes.slice() }).promise
      const total = pdfDoc.numPages
      setPageCount(total)
      setFileName(file.name)
      setProgress(0)

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
        setProgress(Math.round((i / total) * 90))
      }

      setThumbs(generated)
      setProgress(100)
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
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0])
  }

  const togglePage = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(thumbs.map((t) => t.index)))
  const selectNone = () => setSelected(new Set())
  const selectOdd = () => setSelected(new Set(thumbs.filter((_, i) => i % 2 === 0).map((t) => t.index)))
  const selectEven = () => setSelected(new Set(thumbs.filter((_, i) => i % 2 !== 0).map((t) => t.index)))

  const removePages = async () => {
    if (!pdfBytesRef.current || selected.size === 0) return
    if (selected.size >= pageCount) {
      setErrorMsg('Cannot remove all pages. Please keep at least one page.')
      return
    }
    setStatus('processing')
    setProgress(0)
    setErrorMsg('')

    try {
      const { PDFDocument } = await import('pdf-lib')
      setProgress(20)
      const doc = await PDFDocument.load(pdfBytesRef.current, { ignoreEncryption: true })
      setProgress(50)

      // Build new doc with only kept pages
      const newDoc = await PDFDocument.create()
      const keepIndices = doc.getPageIndices().filter((i) => !selected.has(i))
      const copied = await newDoc.copyPages(doc, keepIndices)
      copied.forEach((page) => newDoc.addPage(page))

      setProgress(85)
      const outBytes = await newDoc.save()
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
      setErrorMsg(err instanceof Error ? err.message : 'Failed to remove pages.')
      setStatus('error')
    }
  }

  const reset = () => {
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = '' }
    pdfBytesRef.current = null
    setThumbs([]); setSelected(new Set()); setStatus('idle')
    setProgress(0); setErrorMsg(''); setDownloadUrl(''); setOutputSize(0); setFileName(''); setPageCount(0)
  }

  const outFileName = fileName ? fileName.replace(/\.pdf$/i, '') + '-removed.pdf' : 'removed.pdf'
  const keptCount = pageCount - selected.size

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
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${isDraggingOver ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-400 hover:bg-red-50/30'}`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileInputChange} />
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </div>
          <p className="font-syne font-bold text-dark text-lg mb-1">Drop your PDF here</p>
          <p className="text-gray-500 text-sm">Click pages to select them for removal</p>
          {status === 'error' && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}
        </div>
      )}

      {/* Loading thumbnails */}
      {status === 'loading' && (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-3">Generating page previews… {progress}%</p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Page grid */}
      {(status === 'ready' || status === 'processing') && thumbs.length > 0 && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-syne font-bold text-dark text-sm truncate">{fileName}</p>
              <p className="text-xs text-gray-400">{pageCount} pages · {selected.size > 0 ? <span className="text-red-500 font-semibold">{selected.size} selected for removal · {keptCount} will remain</span> : 'Click pages to select'}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={selectAll} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">All</button>
              <button onClick={selectNone} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">None</button>
              <button onClick={selectOdd} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Odd</button>
              <button onClick={selectEven} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Even</button>
              <button onClick={reset} className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">Change file</button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {thumbs.map((thumb) => {
              const isSelected = selected.has(thumb.index)
              return (
                <button
                  key={thumb.index}
                  onClick={() => togglePage(thumb.index)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all group ${isSelected ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:border-red-300'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb.dataUrl} alt={`Page ${thumb.index + 1}`} className={`w-full aspect-[3/4] object-cover transition-opacity ${isSelected ? 'opacity-40' : 'opacity-100'}`} />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1">
                    <p className="text-white text-[10px] text-center font-bold">{thumb.index + 1}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Error */}
          {errorMsg && status === 'ready' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">{errorMsg}</div>
          )}

          {/* Processing progress */}
          {status === 'processing' && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-dark">Removing pages…</span>
                <span className="text-sm text-red-500 font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Remove button */}
          {status === 'ready' && (
            <button
              onClick={removePages}
              disabled={selected.size === 0}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-syne font-bold py-4 px-8 rounded-xl text-lg transition-colors"
            >
              {selected.size === 0 ? 'Select pages to remove' : `Remove ${selected.size} Page${selected.size !== 1 ? 's' : ''}`}
            </button>
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
              <p className="font-syne font-bold text-dark">Done! {selected.size} page{selected.size !== 1 ? 's' : ''} removed.</p>
              <p className="text-sm text-gray-500">{keptCount} pages remaining · {outputSize < 1024 * 1024 ? `${(outputSize / 1024).toFixed(0)} KB` : `${(outputSize / (1024 * 1024)).toFixed(1)} MB`}</p>
            </div>
          </div>
          <AdSlot position="pre_download" />
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a href={downloadUrl} download={outFileName} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors">Download PDF</a>
            <button onClick={reset} className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-xl transition-colors">Start Over</button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-4">🔒 Your file never leaves your browser</p>
    </div>
  )
}
