import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const BlurFaceTool = dynamic(() => import('./BlurFaceTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Blur Face & Objects – Free Online Privacy Tool | PDFForge',
  description:
    'Automatically detect and blur faces in photos with AI, or manually select any region to blur. Free, no uploads, runs entirely in your browser.',
  alternates: { canonical: '/blur-face' },
  openGraph: {
    title: 'Blur Face Free Online – AI-Powered Privacy Tool | PDFForge',
    description: 'Auto-detect faces or manually blur any area in your image. 100% private, runs in browser.',
    url: '/blur-face',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blur Face Free Online | PDFForge',
    description: 'AI face blur + manual region selection. No uploads, no signup.',
  },
}

const RELATED_SLUGS = ['remove-background', 'compress-image', 'convert-image']

export default function BlurFacePage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 mb-4 text-xs text-blue-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
            AI runs in browser · Zero uploads · 100% private
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Blur Face & Objects <span className="text-blue-600">Free</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Automatically detect and blur faces using on-device AI, or manually draw over any region — people, license plates, documents, or anything sensitive.
          </p>
        </div>
      </section>

      <BlurFaceTool />

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Blur Faces in a Photo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-blue-600 text-lg">{i + 1}</span>
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
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-line flex gap-4">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-lg">{f.icon}</div>
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-blue-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-blue-600 transition-colors">{tool.name}</p>
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
  { title: 'Upload your image', body: 'Drop or click to select a photo. Choose Auto mode to detect faces, or Manual mode to draw blur regions yourself.' },
  { title: 'Review and adjust', body: 'In Auto mode, faces are blurred instantly. Add extra regions by switching to Manual. Adjust blur intensity with the slider.' },
  { title: 'Download', body: 'Click Download to save your privacy-protected image as a high-quality JPG.' },
]

const FEATURES = [
  { icon: '🤖', title: 'AI Face Detection', body: 'BlazeFace model runs in-browser to detect faces automatically — no manual work needed.' },
  { icon: '✏️', title: 'Manual Region Draw', body: 'Click and drag to blur any area: license plates, documents, screens, or anything sensitive.' },
  { icon: '🔒', title: '100% Private', body: 'Everything runs locally in your browser. Your images are never sent to any server.' },
  { icon: '🎛️', title: 'Adjustable Intensity', body: 'Choose soft, medium, heavy blur, or pixelate mode with a live preview on the canvas.' },
  { icon: '🗂️', title: 'Multi-Region', body: 'Add as many blur regions as needed. Remove individual regions or clear all at once.' },
  { icon: '🆓', title: 'Completely Free', body: 'No account, no credit card, no limits. Use as many times as you need.' },
]

const FAQS = [
  { q: 'Is my photo uploaded anywhere?', a: 'No. The AI model and all processing run locally in your browser using WebGL. Your image never leaves your device.' },
  { q: 'What if Auto mode misses a face?', a: 'Switch to Manual mode (or add to Auto results) and draw a box over any missed region. Both modes can be combined.' },
  { q: 'Can I blur license plates and documents?', a: 'Yes. Use Manual mode to draw a selection over any area — license plates, ID cards, addresses, or any sensitive content.' },
  { q: 'What blur styles are available?', a: 'Soft (12px), Medium (24px), Heavy (40px), and Pixelate (60px+). You can also set a custom value with the slider.' },
  { q: 'What is the output format?', a: 'Images are downloaded as high-quality JPG (92% quality). The blur is permanently applied to the output.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Blur Face — PDFForge',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://pdfforge.io/blur-face',
}
