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

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            Template or Blank Canvas: Picking the Right Starting Point
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              The template picker exists because most memes aren&apos;t really about the image — they&apos;re
              about applying new text to an image everyone already recognizes. Drake, Distracted Boyfriend,
              Two Buttons, Change My Mind: the joke works because the visual format is already understood,
              so you can skip straight to writing the punchline. Uploading your own image is the right call
              when the photo itself is the joke — a specific screenshot, a personal photo, a reaction shot
              only you have — and it works exactly the same way once loaded: same text tools, same
              drag-to-position, same download.
            </p>
            <p>
              The default top/bottom text placement (top text near the top edge, bottom text near the
              bottom) follows the classic meme convention deliberately, but nothing stops you from dragging
              either layer anywhere on the canvas — useful for formats like Expanding Brain or Change My
              Mind where the text needs to sit closer to a specific panel. For legibility, the outline is
              doing more work than the fill color: white text with a thick black outline reads on almost
              any background, which is why Impact and Anton (both in the font list) are the defaults —
              their thick, uniform strokes hold an outline cleanly even at the smaller sizes needed for
              longer captions. Thinner fonts like Comic Sans can look fine on-screen but tend to lose the
              outline&apos;s crispness once you&apos;re at the small end of the size range.
            </p>
            <p>
              One thing happening invisibly: the template images are loaded from an external CDN with
              cross-origin permissions enabled specifically so the canvas can still export a downloadable
              image afterward — without that, the browser would block the download for any template-based
              meme (a common gotcha in simpler meme tools). Your own uploaded images don&apos;t need this
              since they&apos;re read directly from your device rather than fetched over the network.
            </p>
            <p>
              If you need more than the classic two-line format — multiple independent text blocks with
              rotation, drop shadows, or background boxes — the{' '}
              <Link href="/add-text-to-image" className="text-yellow-600 hover:underline">Add Text to Image</Link>{' '}
              tool has the fuller layer controls; this one stays deliberately simpler so a standard meme
              takes seconds, not minutes.
            </p>
          </div>
        </div>
      </section>

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
