'use client'

import { useState, useRef } from 'react'
import AdSlot from '@/components/AdSlot'
import { getPdfjs } from '@/lib/pdfjs'
import { STANDARD_MAX_FILE_BYTES, STANDARD_MAX_FILE_LABEL } from '@/lib/limits'
import { diffWords, diffStats, type DiffOp } from '@/lib/diff'

type Status = 'idle' | 'comparing' | 'done' | 'error'

interface PageDiff {
  pageNum: number
  ops: DiffOp[] | null // null for pages that only exist in one file
  onlyIn: 'a' | 'b' | null
}

async function extractPageTexts(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer()
  const pdfjs = await getPdfjs()
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise
  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .filter((it): it is typeof it & { str: string } => 'str' in it)
      .map((it) => it.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    pages.push(text)
  }
  return pages
}

export default function ComparePdfTool() {
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pageDiffs, setPageDiffs] = useState<PageDiff[]>([])
  const inputARef = useRef<HTMLInputElement>(null)
  const inputBRef = useRef<HTMLInputElement>(null)

  const pickFile = (which: 'a' | 'b', file: File | undefined) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload PDF files only.')
      setStatus('error')
      return
    }
    if (file.size > STANDARD_MAX_FILE_BYTES) {
      setErrorMsg(`File too large. Maximum size is ${STANDARD_MAX_FILE_LABEL}.`)
      setStatus('error')
      return
    }
    setErrorMsg('')
    if (status === 'error') setStatus('idle')
    if (which === 'a') setFileA(file); else setFileB(file)
  }

  const compare = async () => {
    if (!fileA || !fileB) return
    setStatus('comparing')
    setErrorMsg('')
    try {
      const [pagesA, pagesB] = await Promise.all([extractPageTexts(fileA), extractPageTexts(fileB)])
      const maxPages = Math.max(pagesA.length, pagesB.length)
      const diffs: PageDiff[] = []
      for (let i = 0; i < maxPages; i++) {
        if (i >= pagesA.length) { diffs.push({ pageNum: i + 1, ops: null, onlyIn: 'b' }); continue }
        if (i >= pagesB.length) { diffs.push({ pageNum: i + 1, ops: null, onlyIn: 'a' }); continue }
        diffs.push({ pageNum: i + 1, ops: diffWords(pagesA[i], pagesB[i]), onlyIn: null })
      }
      setPageDiffs(diffs)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Comparison failed. Please try again.')
      setStatus('error')
    }
  }

  const reset = () => {
    setFileA(null); setFileB(null); setStatus('idle'); setErrorMsg(''); setPageDiffs([])
  }

  const totals = pageDiffs.reduce(
    (acc, pd) => {
      if (!pd.ops) return acc
      const { additions, deletions } = diffStats(pd.ops)
      return { additions: acc.additions + additions, deletions: acc.deletions + deletions }
    },
    { additions: 0, deletions: 0 },
  )
  const changedPages = pageDiffs.filter((pd) => pd.ops ? pd.ops.some((o) => o.type !== 'equal') : true).length

  const Slot = ({ which, file }: { which: 'a' | 'b'; file: File | null }) => {
    const ref = which === 'a' ? inputARef : inputBRef
    const label = which === 'a' ? 'Original' : 'Revised'
    return (
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pickFile(which, e.dataTransfer.files[0]) }}
        className={`flex-1 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          file ? 'border-teal-400 bg-teal-50/40' : 'border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50/30'
        }`}
      >
        <input ref={ref} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={(e) => { pickFile(which, e.target.files?.[0]); e.target.value = '' }} />
        <p className="text-[11px] font-bold uppercase tracking-wider text-mute mb-2">{label}</p>
        {file ? (
          <p className="font-display font-semibold text-ink text-sm truncate">{file.name}</p>
        ) : (
          <p className="text-mute text-sm">Drop PDF or click to browse</p>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <AdSlot position="header" />

      {(status === 'idle' || status === 'error') && (
        <div className="bg-white rounded-2xl border border-line p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Slot which="a" file={fileA} />
            <Slot which="b" file={fileB} />
          </div>
          {errorMsg && <p className="text-red-500 text-sm mt-4 text-center">{errorMsg}</p>}
          <button
            onClick={compare}
            disabled={!fileA || !fileB}
            className="w-full mt-5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Compare PDFs
          </button>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1 text-xs text-green-700">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Both files stay in your browser
          </div>
        </div>
      )}

      {status === 'comparing' && (
        <div className="bg-white rounded-2xl border border-line p-8 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-display font-bold text-ink mb-1">Comparing documents…</p>
          <p className="text-mute text-sm">Extracting text and diffing page by page.</p>
        </div>
      )}

      {status === 'done' && (
        <div>
          <div className="bg-white rounded-2xl border border-line p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-ink font-semibold">{pageDiffs.length} page{pageDiffs.length !== 1 ? 's' : ''} compared</span>
              <span className="text-mute">{changedPages} page{changedPages !== 1 ? 's' : ''} with changes</span>
              <span className="text-green-700">+{totals.additions} words</span>
              <span className="text-red-600">−{totals.deletions} words</span>
            </div>
            <button onClick={reset} className="text-sm text-mute hover:text-ink transition-colors font-semibold">
              Compare different files
            </button>
          </div>

          <AdSlot position="pre_download" />

          <div className="space-y-4 mt-4">
            {pageDiffs.map((pd) => (
              <div key={pd.pageNum} className="bg-white rounded-2xl border border-line p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-mute mb-3">Page {pd.pageNum}</p>
                {pd.onlyIn ? (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    This page only exists in the {pd.onlyIn === 'a' ? 'Original' : 'Revised'} file.
                  </p>
                ) : pd.ops!.every((o) => o.type === 'equal') ? (
                  <p className="text-sm text-mute">No changes on this page.</p>
                ) : (
                  <p className="text-sm leading-relaxed">
                    {pd.ops!.map((op, i) => {
                      if (op.type === 'equal') return <span key={i} className="text-ink">{op.text}</span>
                      if (op.type === 'insert') return <span key={i} className="bg-green-100 text-green-800">{op.text}</span>
                      return <span key={i} className="bg-red-100 text-red-700 line-through">{op.text}</span>
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-teal-50 border border-teal-100 rounded-2xl p-4 text-sm text-teal-700 space-y-1">
        <p><strong>100% private:</strong> Both PDFs are compared entirely in your browser using PDF.js. Neither file is uploaded anywhere.</p>
        <p>Comparison is text-based — it diffs the words on each page, not visual layout or images. Pages are matched by position (page 1 vs page 1, etc.), so inserted or removed pages will shift later comparisons.</p>
      </div>

      <AdSlot position="footer" />
    </div>
  )
}
