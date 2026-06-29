import type { Metadata } from 'next'
import Link from 'next/link'
import { TOOLS, NAV_CATEGORIES } from '@/lib/tools'
import ToolCard from '@/components/ToolCard'
import AdSlot from '@/components/AdSlot'

export const metadata: Metadata = {
  title: 'PDF Tools — Free Online PDF Converter, Editor & More | PDFForge',
  description:
    'All PDF tools in one place. Merge, split, compress, convert, edit, protect and more — free, fast, private. No signup required.',
  alternates: { canonical: '/pdf-tools' },
}

const PDF_CATEGORIES = NAV_CATEGORIES.filter((c) => c.key !== 'image')

export default function PdfToolsPage() {
  const pdfTools = TOOLS.filter((t) => t.category !== 'image')

  return (
    <>
      {/* Hero */}
      <section className="hero-bg py-14 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 py-1.5 mb-4 text-xs text-red-600 font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            {pdfTools.length} PDF Tools
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4 leading-tight">
            All <span className="text-red-500">PDF Tools</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Merge, split, compress, convert, edit and protect PDFs — all free, no uploads, no signup.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <AdSlot position="header" />
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {PDF_CATEGORIES.map((cat) => {
          const tools = TOOLS.filter((t) => t.category === cat.key)
          if (tools.length === 0) return null
          return (
            <section key={cat.key}>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1 h-6 rounded-full" style={{ background: cat.color }} />
                <h2 className="font-display text-xl font-bold text-ink">{cat.label}</h2>
                <span className="text-xs text-mute bg-gray-100 rounded-full px-2 py-0.5">{tools.length} tools</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        <AdSlot position="footer" />
      </div>
    </>
  )
}
