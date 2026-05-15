import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const HtmlToPdfTool = dynamic(() => import('./HtmlToPdfTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'HTML to PDF – Convert HTML Files to PDF Free Online | PDFForge',
  description:
    'Hi. Convert HTML files to PDF using a real browser engine. CSS, fonts, flexbox, and layout are preserved perfectly. Free, no signup, no watermarks.',
  alternates: { canonical: '/html-to-pdf' },
  openGraph: {
    title: 'HTML to PDF – Free Online Converter | PDFForge',
    description: 'Convert HTML files to perfect PDFs. Real browser rendering, free, no signup.',
    url: '/html-to-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HTML to PDF – Free Online | PDFForge',
    description: 'Convert HTML to PDF with perfect CSS rendering. Free, no signup.',
  },
}

const RELATED_SLUGS = ['word-to-pdf', 'excel-to-pdf', 'jpg-to-pdf']

export default function HtmlToPdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 mb-4 text-xs text-orange-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
            Real browser rendering · CSS preserved perfectly
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            HTML to PDF <span className="text-orange-600">Converter</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Convert HTML files to PDF using a full browser engine. Fonts, flexbox, grid, gradients — everything renders exactly as designed.
          </p>
        </div>
      </section>

      <HtmlToPdfTool />

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Convert HTML to PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-orange-600 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-orange-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-orange-600 transition-colors">{tool.name}</p>
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
  { title: 'Upload your HTML file', body: 'Click or drag your .html file into the uploader. The file is sent securely for browser-based rendering.' },
  { title: 'Convert instantly', body: 'A real headless Chromium browser renders your HTML exactly as it looks in Chrome — fonts, CSS, and layout all preserved.' },
  { title: 'Download your PDF', body: 'The converted PDF downloads automatically. All styles, images, and formatting are embedded in the output file.' },
]

const FAQS = [
  { q: 'What CSS features are supported?', a: 'All standard CSS including flexbox, grid, custom fonts, gradients, animations (as static renders), and media queries. The conversion uses a real Chromium engine, so anything that works in Chrome works here.' },
  { q: 'Can I use @page rules to control paper size?', a: 'Yes. Add @page { size: A4; margin: 2cm; } to your CSS and the PDF will respect those dimensions.' },
  { q: 'Are external fonts and images loaded?', a: 'External resources (Google Fonts, CDN images) are fetched during conversion if they are publicly accessible. Self-hosted or localhost resources will not be available.' },
  { q: 'What is the file size limit?', a: 'HTML files up to 4 MB are supported. This covers most pages — if your file is larger, try inlining images as base64 or reducing embedded assets.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'HTML to PDF Converter — PDFForge',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://pdfforge.io/html-to-pdf',
}
