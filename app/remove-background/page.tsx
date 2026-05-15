import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const RemoveBackgroundTool = dynamic(() => import('./RemoveBackgroundTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Remove Background – Free AI Background Remover Online | PDFForge',
  description:
    'Remove image backgrounds instantly with AI. 100% free, no signup, runs entirely in your browser — your images never leave your device. Supports JPG, PNG, WebP.',
  alternates: { canonical: '/remove-background' },
  openGraph: {
    title: 'Remove Image Background Free – AI-Powered | PDFForge',
    description: 'Instantly remove backgrounds from photos. AI runs in your browser, completely private. Free, no signup.',
    url: '/remove-background',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remove Background Free Online | PDFForge',
    description: 'AI background remover. Runs in your browser — no uploads, no signup.',
  },
}

const RELATED_SLUGS = ['compress-image', 'resize-image', 'crop-image']

export default function RemoveBackgroundPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 mb-4 text-xs text-green-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            AI runs in your browser · Zero uploads · 100% private
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Remove Image Background <span className="text-green-600">Free</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Instantly remove backgrounds from photos, products, portraits, and logos using on-device AI. No account, no uploads, no watermarks.
          </p>
        </div>
      </section>

      <RemoveBackgroundTool />

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Remove a Background</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-green-600 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">Why Use Our Background Remover?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-line flex gap-4">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0 text-green-700 text-lg">{f.icon}</div>
                <div>
                  <h3 className="font-display font-semibold text-ink text-sm mb-1">{f.title}</h3>
                  <p className="text-mute text-xs leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <h3 className="font-display font-bold text-ink mb-2 text-base">{f.q}</h3>
                <p className="text-mute text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">You Might Also Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 border border-line hover:border-green-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-green-600 transition-colors">{tool.name}</p>
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

const HOW_TO_STEPS = [
  { title: 'Upload your image', body: 'Drop or click to select a JPG, PNG, or WebP. You can process multiple images at once.' },
  { title: 'AI removes the background', body: 'The on-device AI model analyses your image and cleanly cuts out the subject in seconds.' },
  { title: 'Download your PNG', body: 'Get a transparent PNG, or pick a solid background colour before downloading.' },
]

const FEATURES = [
  { icon: '🔒', title: '100% Private', body: 'The AI model runs entirely in your browser using WebAssembly. Your images are never uploaded to any server.' },
  { icon: '⚡', title: 'Instant Results', body: 'After the model loads once, subsequent images process in seconds — even offline.' },
  { icon: '🖼️', title: 'Batch Processing', body: 'Remove backgrounds from multiple images in one go. Download individually or as a ZIP.' },
  { icon: '🎨', title: 'Custom Backgrounds', body: 'Keep it transparent, or fill with white, black, or any custom colour before downloading.' },
  { icon: '✨', title: 'No Watermarks', body: 'Output PNGs are clean with no watermarks, branding, or quality reduction.' },
  { icon: '🆓', title: 'Completely Free', body: 'No account, no credit card, no daily limits. Use it as many times as you need.' },
]

const FAQS = [
  { q: 'Does my image get uploaded to a server?', a: 'No. The AI model (ONNX-based) is downloaded once to your browser and runs locally via WebAssembly. Your images never leave your device.' },
  { q: 'What image formats are supported?', a: 'JPG, PNG, and WebP are supported. GIFs are not supported as background removal works on static frames only.' },
  { q: 'Why does the first image take longer?', a: 'The first run downloads the AI model (~50MB) and caches it in your browser. All subsequent images process instantly without re-downloading.' },
  { q: 'How accurate is the background removal?', a: 'The model works well on subjects with clear edges — people, products, animals, and logos. Complex scenes with similar foreground/background colours may need refinement.' },
  { q: 'Can I use the output commercially?', a: 'Yes. The tool is free and the output images are yours. There are no watermarks or usage restrictions on the downloaded files.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Background Remover — PDFForge',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://pdfforge.io/remove-background',
}
