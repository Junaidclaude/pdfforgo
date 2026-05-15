import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const AddTextTool = dynamic(() => import('./AddTextTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Add Text to Image – Free Online Photo Text Editor | PDFForge',
  description:
    'Add text to any photo directly in your browser. Multiple text layers, 10 fonts, custom colors, rotation, shadows, and background boxes. Free, no signup, no uploads.',
  alternates: { canonical: '/add-text-to-image' },
  openGraph: {
    title: 'Add Text to Image Free Online | PDFForge',
    description: 'Place text anywhere on your photo. Drag, rotate, style with fonts and colors. Free, no uploads.',
    url: '/add-text-to-image', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Add Text to Image Free | PDFForge', description: 'Multi-layer text editor for images. Fonts, colors, rotation, shadows. No uploads.' },
}

const RELATED_SLUGS = ['meme-generator', 'compress-image', 'watermark-pdf']

export default function AddTextToImagePage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-3 py-1.5 mb-4 text-xs text-purple-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
            Multi-layer · Drag & drop · 100% browser-based
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Add Text to Image <span className="text-purple-600">Free</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Place text anywhere on your photo. Add multiple layers, choose fonts and colors, rotate, add shadows and background boxes. Download as JPG instantly.
          </p>
        </div>
      </section>

      <AddTextTool />

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">You Might Also Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 border border-line hover:border-purple-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-purple-600 transition-colors">{tool.name}</p>
                <p className="text-mute text-sm mt-1">{tool.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4"><AdSlot position="footer" /></div>
    </>
  )
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Add Text to Image — PDFForge',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://pdfforge.io/add-text-to-image',
}
