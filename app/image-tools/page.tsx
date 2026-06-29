import type { Metadata } from 'next'
import { TOOLS } from '@/lib/tools'
import ToolCard from '@/components/ToolCard'
import AdSlot from '@/components/AdSlot'

export const metadata: Metadata = {
  title: 'Image Tools — Free Online Image Editor, Converter & More | PDFForge',
  description:
    'All image tools in one place. Compress, resize, crop, convert, remove background, blur faces and more — free, private, browser-based.',
  alternates: { canonical: '/image-tools' },
}

const IMAGE_CATEGORIES = [
  { label: 'Edit & Transform', keys: ['edit-resize-image', 'crop-image', 'convert-image', 'compress-image'] },
  { label: 'AI & Creative', keys: ['remove-background', 'blur-face', 'meme-generator', 'add-text-to-image'] },
]

export default function ImageToolsPage() {
  const imageTools = TOOLS.filter((t) => t.category === 'image')

  return (
    <>
      {/* Hero */}
      <section className="hero-bg py-14 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-full px-3 py-1.5 mb-4 text-xs text-pink-600 font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {imageTools.length} Image Tools
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4 leading-tight">
            All <span className="text-pink-500">Image Tools</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Compress, resize, crop, convert, remove backgrounds and blur faces — all free, runs in your browser.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <AdSlot position="header" />
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {IMAGE_CATEGORIES.map((cat) => {
          const tools = imageTools.filter((t) => cat.keys.includes(t.slug))
          if (tools.length === 0) return null
          return (
            <section key={cat.label}>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1 h-6 rounded-full bg-pink-400" />
                <h2 className="font-display text-xl font-bold text-ink">{cat.label}</h2>
                <span className="text-xs text-mute bg-gray-100 rounded-full px-2 py-0.5">{tools.length} tools</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          )
        })}

        {/* Any image tools not in above categories */}
        {(() => {
          const categorised = IMAGE_CATEGORIES.flatMap((c) => c.keys)
          const rest = imageTools.filter((t) => !categorised.includes(t.slug))
          if (rest.length === 0) return null
          return (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1 h-6 rounded-full bg-pink-400" />
                <h2 className="font-display text-xl font-bold text-ink">More Tools</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {rest.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
              </div>
            </section>
          )
        })()}
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        <AdSlot position="footer" />
      </div>
    </>
  )
}
