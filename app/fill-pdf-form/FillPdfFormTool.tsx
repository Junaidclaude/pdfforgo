'use client'

import { useState, useRef } from 'react'
import AdSlot from '@/components/AdSlot'
import { STANDARD_MAX_FILE_BYTES, STANDARD_MAX_FILE_LABEL } from '@/lib/limits'

type Status = 'idle' | 'loading' | 'ready' | 'saving' | 'error'

type FieldEntry =
  | { kind: 'text'; name: string; multiline: boolean; value: string }
  | { kind: 'checkbox'; name: string; value: boolean }
  | { kind: 'dropdown'; name: string; options: string[]; value: string }
  | { kind: 'radio'; name: string; options: string[]; value: string }
  | { kind: 'optionlist'; name: string; options: string[]; value: string[] }

export default function FillPdfFormTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [pdfBytesRef, setPdfBytesRef] = useState<ArrayBuffer | null>(null)
  const [fields, setFields] = useState<FieldEntry[]>([])
  const [skippedCount, setSkippedCount] = useState(0)
  const [flatten, setFlatten] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFOptionList } = await import('pdf-lib')
      const doc = await PDFDocument.load(buffer)
      const form = doc.getForm()
      const acroFields = form.getFields()

      if (acroFields.length === 0) {
        setErrorMsg('This PDF doesn\'t contain any fillable form fields.')
        setStatus('error')
        return
      }

      const entries: FieldEntry[] = []
      let skipped = 0
      for (const f of acroFields) {
        const name = f.getName()
        if (f instanceof PDFTextField) {
          entries.push({ kind: 'text', name, multiline: f.isMultiline(), value: f.getText() ?? '' })
        } else if (f instanceof PDFCheckBox) {
          entries.push({ kind: 'checkbox', name, value: f.isChecked() })
        } else if (f instanceof PDFDropdown) {
          entries.push({ kind: 'dropdown', name, options: f.getOptions(), value: f.getSelected()[0] ?? '' })
        } else if (f instanceof PDFRadioGroup) {
          entries.push({ kind: 'radio', name, options: f.getOptions(), value: f.getSelected() ?? '' })
        } else if (f instanceof PDFOptionList) {
          entries.push({ kind: 'optionlist', name, options: f.getOptions(), value: f.getSelected() })
        } else {
          skipped++ // buttons, signatures — not fillable as text/values
        }
      }

      if (entries.length === 0) {
        setErrorMsg('This PDF has form fields, but none of them (buttons, signature fields) can be filled here.')
        setStatus('error')
        return
      }

      setPdfBytesRef(buffer)
      setFields(entries)
      setSkippedCount(skipped)
      setStatus('ready')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not read this PDF.')
      setStatus('error')
    }
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { load(e.target.files[0]); e.target.value = '' }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingOver(false)
    if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0])
  }

  const updateField = (index: number, value: string | boolean | string[]) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, value } as FieldEntry : f)))
  }

  const reset = () => {
    setStatus('idle'); setFileName(''); setPdfBytesRef(null); setFields([]); setSkippedCount(0); setErrorMsg('')
  }

  const save = async () => {
    if (!pdfBytesRef) return
    setStatus('saving')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const doc = await PDFDocument.load(pdfBytesRef)
      const form = doc.getForm()

      for (const f of fields) {
        if (f.kind === 'text') form.getTextField(f.name).setText(f.value || undefined)
        else if (f.kind === 'checkbox') { const cb = form.getCheckBox(f.name); f.value ? cb.check() : cb.uncheck() }
        else if (f.kind === 'dropdown') { if (f.value) form.getDropdown(f.name).select(f.value) }
        else if (f.kind === 'radio') { if (f.value) form.getRadioGroup(f.name).select(f.value) }
        else if (f.kind === 'optionlist') { if (f.value.length > 0) form.getOptionList(f.name).select(f.value) }
      }

      if (flatten) form.flatten()

      const out = await doc.save()
      const blob = new Blob([new Uint8Array(out).buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName.replace(/\.pdf$/i, '-filled.pdf')
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
      setStatus('ready')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save this PDF.')
      setStatus('error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <AdSlot position="header" />

      {(status === 'idle' || status === 'error') && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${
            isDraggingOver ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50/30'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileInputChange} />
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
          </div>
          <p className="font-display font-bold text-ink text-lg mb-1">Drop your fillable PDF here</p>
          <p className="text-mute text-sm">PDF forms only · Max {STANDARD_MAX_FILE_LABEL}</p>
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
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-display font-bold text-ink mb-1">Reading form fields…</p>
          <p className="text-mute text-sm">{fileName}</p>
        </div>
      )}

      {(status === 'ready' || status === 'saving') && (
        <div className="bg-white rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-display font-bold text-ink">{fileName}</p>
              <p className="text-mute text-xs mt-0.5">
                {fields.length} fillable field{fields.length !== 1 ? 's' : ''}
                {skippedCount > 0 ? ` · ${skippedCount} field${skippedCount !== 1 ? 's' : ''} not editable here` : ''}
              </p>
            </div>
            <button onClick={reset} className="text-sm text-mute hover:text-ink transition-colors font-semibold shrink-0">
              Use different file
            </button>
          </div>

          <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
            {fields.map((f, i) => (
              <div key={f.name + i}>
                <label className="block text-xs font-semibold text-mute mb-1.5 truncate" title={f.name}>{f.name}</label>
                {f.kind === 'text' && (
                  f.multiline ? (
                    <textarea value={f.value} onChange={(e) => updateField(i, e.target.value)} rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  ) : (
                    <input type="text" value={f.value} onChange={(e) => updateField(i, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  )
                )}
                {f.kind === 'checkbox' && (
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={f.value} onChange={(e) => updateField(i, e.target.checked)}
                      className="w-4 h-4 accent-orange-600" />
                    <span className="text-sm text-ink">{f.value ? 'Checked' : 'Unchecked'}</span>
                  </label>
                )}
                {f.kind === 'dropdown' && (
                  <select value={f.value} onChange={(e) => updateField(i, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="">— Select —</option>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {f.kind === 'radio' && (
                  <div className="flex flex-wrap gap-3">
                    {f.options.map((o) => (
                      <label key={o} className="inline-flex items-center gap-1.5 cursor-pointer text-sm text-ink">
                        <input type="radio" name={`radio-${i}`} checked={f.value === o} onChange={() => updateField(i, o)}
                          className="w-4 h-4 accent-orange-600" />
                        {o}
                      </label>
                    ))}
                  </div>
                )}
                {f.kind === 'optionlist' && (
                  <select multiple value={f.value} onChange={(e) => updateField(i, Array.from(e.target.selectedOptions, (o) => o.value))}
                    className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>

          {errorMsg && <p className="text-red-500 text-sm mt-4">{errorMsg}</p>}

          <AdSlot position="pre_download" />

          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" checked={flatten} onChange={(e) => setFlatten(e.target.checked)} className="w-4 h-4 accent-orange-600" />
            <span className="text-sm text-ink">Flatten form after filling <span className="text-mute">(makes values permanent — recommended for printing/sharing)</span></span>
          </label>

          <button
            onClick={save}
            disabled={status === 'saving'}
            className="w-full mt-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {status === 'saving' ? 'Saving…' : 'Fill & Download PDF'}
          </button>
        </div>
      )}

      <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-orange-700 space-y-1">
        <p><strong>100% private:</strong> Your PDF is filled entirely in your browser using pdf-lib. Nothing is uploaded to any server.</p>
        <p>This works on PDFs with real AcroForm fields (the kind you can already click into in Adobe Acrobat). It can&apos;t add fields to a PDF that doesn&apos;t have any — for that, use PDF Editor to place text manually.</p>
      </div>

      <AdSlot position="footer" />
    </div>
  )
}
