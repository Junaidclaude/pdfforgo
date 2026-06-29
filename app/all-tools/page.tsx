import type { Metadata } from 'next'
import Link from 'next/link'
import { TOOLS, NAV_CATEGORIES } from '@/lib/tools'
import ToolCard from '@/components/ToolCard'
import AdSlot from '@/components/AdSlot'

export const metadata: Metadata = {
  title: 'All Tools — Free PDF & Image Tools Online | PDFForge',
  description:
    'Every tool on PDFForge: PDF tools, image editors, converters and more — all free, browser-based, no signup.',
  alternates: { canonical: '/all-tools' },
}

export default function AllToolsPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-bg py-14 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-3 py-1.5 mb-4 text-xs text-violet-600 font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            {TOOLS.length} Tools Total
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4 leading-tight">
            All <span className="text-violet-600">Tools</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Every PDF and image tool we offer — free, fast, private. No signup required.
          </p>

          {/* Quick jump */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <Link href="/pdf-tools"
              className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
              PDF Tools
            </Link>
            <Link href="/image-tools"
              className="inline-flex items-center gap-1.5 bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-600 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Image Tools
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <AdSlot position="header" />
      </div>

      {/* All categories */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {NAV_CATEGORIES.map((cat) => {
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
