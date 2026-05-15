import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const MemeGeneratorTool = dynamic(() => import('./MemeGeneratorTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Meme Generator – Free Online Meme Maker | PDFForge',
  description:
    'Create memes instantly. Choose from 12 popular templates or upload your own image. Add unlimited text layers, drag to reposition, customize font, color, and outline. Free, no signup.',
  alternates: { canonical: '/meme-generator' },
  openGraph: {
    title: 'Free Online Meme Generator | PDFForge',
    description: 'Make memes in seconds. Popular templates, drag-and-drop text, custom fonts. Free, no signup.',
    url: '/meme-generator', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Free Meme Generator | PDFForge', description: 'Create memes with popular templates or your own image. Drag, resize, customize.' },
}

const RELATED_SLUGS = ['add-text-to-image', 'compress-image', 'convert-image']

export default function MemeGeneratorPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5 mb-4 text-xs text-yellow-700 font-semibold">
            <span className="text-base">😂</span>
            12 popular templates · Unlimited text layers · 100% free
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Meme Generator <span className="text-yellow-500">Free Online</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Pick a classic template or upload your own image. Add text anywhere, drag to reposition, customize font, color, and outline. Download instantly.
          </p>
        </div>
      </section>

      <MemeGeneratorTool />

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">You Might Also Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 border border-line hover:border-yellow-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-yellow-600 transition-colors">{tool.name}</p>
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
  name: 'Meme Generator — PDFForge',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://pdfforge.io/meme-generator',
}
