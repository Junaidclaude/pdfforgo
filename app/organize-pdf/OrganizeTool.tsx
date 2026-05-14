'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'

type Status = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error'

interface PageItem {
  origIndex: number   // original 0-based index
  dataUrl: string
  deleted: boolean
}

export default function OrganizeTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [pages, setPages] = useState<PageItem[]>([])
  const [loadProgress, setLoadProgress] = useState(0)
  const [saveProgress, setSaveProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [outputSize, setOutputSize] = useState(0)
  const [fileName, setFileName] = useState('')
  const [dragFromIdx, setDragFromIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

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
    setPages([])
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = ''; setDownloadUrl('') }

    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      pdfBytesRef.current = bytes

      const pdfjs = await getPdfjs()
      const pdfDoc = await pdfjs.getDocument({ data: bytes.slice() }).promise
      const total = pdfDoc.numPages
      setFileName(file.name)
      setLoadProgress(0)

      const items: PageItem[] = []
      for (let i = 1; i <= total; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: 0.45 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport }).promise
        items.push({ origIndex: i - 1, dataUrl: canvas.toDataURL('image/jpeg', 0.75), deleted: false })
        canvas.width = 0; canvas.height = 0
        setLoadProgress(Math.round((i / total) * 100))
      }

      setPages(items)
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

  // Drag-to-reorder handlers
  const onPageDragStart = (e: React.DragEvent, idx: number) => {
    setDragFromIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onPageDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }

  const onPageDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault()
    const fromIdx = dragFromIdx
    setDragFromIdx(null)
    setDragOverIdx(null)
    if (fromIdx === null || fromIdx === dropIdx) return
    setPages((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(dropIdx, 0, moved)
      return next
    })
  }

  const onPageDragEnd = () => { setDragFromIdx(null); setDragOverIdx(null) }

  const toggleDelete = (idx: number) => {
    setPages((prev) => {
      const alive = prev.filter((p) => !p.deleted)
      if (!prev[idx].deleted && alive.length <= 1) return prev // keep at least 1
      return prev.map((p, i) => i === idx ? { ...p, deleted: !p.deleted } : p)
    })
  }

  const save = async () => {
    if (!pdfBytesRef.current) return
    const keepPages = pages.filter((p) => !p.deleted)
    if (keepPages.length === 0) return

    setStatus('processing')
    setSaveProgress(0)
    setErrorMsg('')

    try {
      const { PDFDocument } = await import('pdf-lib')
      setSaveProgress(20)
      const srcDoc = await PDFDocument.load(pdfBytesRef.current, { ignoreEncryption: true })
      const newDoc = await PDFDocument.create()
      setSaveProgress(40)

      const keepIndices = keepPages.map((p) => p.origIndex)
      const copied = await newDoc.copyPages(srcDoc, keepIndices)
      copied.forEach((page) => newDoc.addPage(page))

      setSaveProgress(85)
      const outBytes = await newDoc.save()
      setSaveProgress(100)

      const blob = new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' })
      if (downloadRef.current) URL.revokeObjectURL(downloadRef.current)
      const url = URL.createObjectURL(blob)
      downloadRef.current = url
      setDownloadUrl(url)
      setOutputSize(outBytes.length)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save PDF.')
      setStatus('ready')
    }
  }

  const reset = () => {
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = '' }
    pdfBytesRef.current = null
    setPages([]); setStatus('idle'); setLoadProgress(0); setSaveProgress(0)
    setErrorMsg(''); setDownloadUrl(''); setOutputSize(0); setFileName('')
  }

  const activePages = pages.filter((p) => !p.deleted)
  const deletedCount = pages.filter((p) => p.deleted).length
  const outFileName = fileName ? fileName.replace(/\.pdf$/i, '') + '-organized.pdf' : 'organized.pdf'

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
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${isDraggingOver ? 'border-violet-500 bg-violet-50' : 'border-gray-200 bg-white hover:border-violet-400 hover:bg-violet-50/30'}`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileInputChange} />
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
          </div>
          <p className="font-syne font-bold text-dark text-lg mb-1">Drop your PDF here</p>
          <p className="text-gray-500 text-sm">Drag pages to reorder · Click × to delete</p>
          {status === 'error' && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}
        </div>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-3">Loading page previews… {loadProgress}%</p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${loadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Page grid */}
      {(status === 'ready' || status === 'processing') && pages.length > 0 && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-syne font-bold text-dark text-sm">{fileName}</p>
              <p className="text-xs text-gray-400">
                {activePages.length} page{activePages.length !== 1 ? 's' : ''} remaining
                {deletedCount > 0 && <span className="text-red-500 ml-1">· {deletedCount} marked for deletion</span>}
                {' '}· Drag to reorder
              </p>
            </div>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Change file</button>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {pages.map((page, idx) => (
              <div
                key={`${page.origIndex}`}
                draggable={!page.deleted}
                onDragStart={(e) => !page.deleted && onPageDragStart(e, idx)}
                onDragOver={(e) => !page.deleted && onPageDragOver(e, idx)}
                onDrop={(e) => !page.deleted && onPageDrop(e, idx)}
                onDragEnd={onPageDragEnd}
                className={`relative rounded-xl overflow-hidden border-2 transition-all select-none ${
                  page.deleted
                    ? 'border-gray-200 opacity-30'
                    : dragOverIdx === idx && dragFromIdx !== idx
                    ? 'border-violet-500 ring-2 ring-violet-200 scale-105'
                    : 'border-gray-200 hover:border-violet-300 cursor-grab active:cursor-grabbing'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.dataUrl} alt={`Page ${idx + 1}`} className="w-full aspect-[3/4] object-cover" />

                {/* Page number */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1">
                  <p className="text-white text-[10px] text-center font-bold">{idx + 1}</p>
                </div>

                {/* Delete / restore button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleDelete(idx) }}
                  className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    page.deleted
                      ? 'bg-green-500 opacity-100'
                      : 'bg-red-500 opacity-0 group-hover:opacity-100'
                  } hover:scale-110`}
                  style={{ opacity: page.deleted ? 1 : undefined }}
                  title={page.deleted ? 'Restore page' : 'Delete page'}
                >
                  {page.deleted ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  ) : (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  )}
                </button>

                {/* Always-visible delete button overlay on hover */}
                {!page.deleted && (
                  <div className="absolute top-1 right-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleDelete(idx) }}
                      className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                      title="Delete page"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">{errorMsg}</div>
          )}

          {/* Save progress */}
          {status === 'processing' && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-dark">Saving PDF…</span>
                <span className="text-sm text-violet-500 font-bold">{saveProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${saveProgress}%` }} />
              </div>
            </div>
          )}

          {status === 'ready' && (
            <button
              onClick={save}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white font-syne font-bold py-4 px-8 rounded-xl text-lg transition-colors"
            >
              Save Organized PDF
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
              <p className="font-syne font-bold text-dark">PDF organized!</p>
              <p className="text-sm text-gray-500">{activePages.length} pages · {outputSize < 1024 * 1024 ? `${(outputSize / 1024).toFixed(0)} KB` : `${(outputSize / (1024 * 1024)).toFixed(1)} MB`}</p>
            </div>
          </div>
          <AdSlot position="pre_download" />
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a href={downloadUrl} download={outFileName} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-syne font-bold py-3 px-6 rounded-xl text-center transition-colors">Download PDF</a>
            <button onClick={reset} className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-xl transition-colors">Organize Another</button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-4">🔒 Your file never leaves your browser</p>
    </div>
  )
}
