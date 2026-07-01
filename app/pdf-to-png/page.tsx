import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const PdfToPngTool = dynamic(() => import('./PdfToPngTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'PDF to PNG – Convert PDF Pages to PNG Free Online',
  description:
    'Convert PDF pages to lossless PNG images online for free. Choose 72, 150, or 300 DPI. Download individual pages or all as a ZIP. No signup — 100% browser-based, private.',
  alternates: {
    canonical: '/pdf-to-png',
  },
  openGraph: {
    title: 'PDF to PNG – Convert PDF to Lossless PNG Free | PDFForge',
    description:
      'Convert every PDF page to a lossless PNG image. Choose resolution (72–300 DPI). Download individually or as ZIP. Free, no signup, files stay in your browser.',
    url: '/pdf-to-png',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF to PNG – Free Online | PDFForge',
    description:
      'Convert PDF pages to lossless PNG images. 72/150/300 DPI. No signup required.',
  },
}

const RELATED_SLUGS = ['pdf-to-jpg', 'jpg-to-pdf', 'compress-pdf']

export default function PdfToPngPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))

  return (
    <>
      {/* ── Structured data ──────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3 py-1.5 mb-4 text-xs text-teal-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Convert PDF to PNG Online
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Turn every PDF page into a lossless PNG image. Perfect for sharp
            text, diagrams, and screenshots. Choose your DPI and download
            individually or as a ZIP.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <PdfToPngTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            How to Convert PDF to PNG
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-teal-600 text-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <h3 className="font-display font-bold text-ink mb-2 text-base">{faq.q}</h3>
                <p className="text-mute text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related tools ─────────────────────────────────── */}
      <section className="py-12 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">
            You Might Also Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 border border-line hover:border-teal-300 transition-all hover:-translate-y-1 block"
              >
                <p className="font-display font-bold text-ink group-hover:text-teal-600 transition-colors">
                  {tool.name}
                </p>
                <p className="text-mute text-sm mt-1">{tool.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AD_SLOT: footer_banner */}
      <div className="max-w-6xl mx-auto px-4">
        <AdSlot position="footer" />
      </div>
    </>
  )
}

// ── Static data ────────────────────────────────────────────────────────────

const HOW_TO_STEPS = [
  {
    title: 'Upload Your PDF',
    body: 'Click the upload area or drag and drop a PDF file. All rendering happens locally in your browser — your file never leaves your device.',
  },
  {
    title: 'Choose Resolution',
    body: 'Select 72 DPI for web and email (smallest files), 150 DPI for balanced quality, or 300 DPI for print-ready high-resolution PNG images.',
  },
  {
    title: 'Download PNG Images',
    body: 'Preview converted pages and download any image individually, or grab all pages at once as a ZIP file.',
  },
]

const FAQS = [
  {
    q: 'Why convert PDF to PNG instead of JPG?',
    a: 'PNG is a lossless format — every pixel is stored exactly as rendered, with no compression artifacts. This makes it ideal for PDFs with sharp text, technical diagrams, charts, or screenshots where quality must not degrade. JPG is better suited for photographs where smaller file size matters more than pixel-perfect accuracy.',
  },
  {
    q: 'What DPI should I use for PDF to PNG conversion?',
    a: '72 DPI is fine for web display and email attachments. 150 DPI gives a good balance of quality and file size for most uses. 300 DPI is the standard for print — it produces the largest files but the sharpest output, suitable for professional printing.',
  },
  {
    q: 'How large are PNG files compared to JPG?',
    a: 'PNG files are significantly larger than JPG because they are lossless. A single A4 page at 150 DPI is typically 1–3 MB as PNG versus 100–300 KB as JPG. At 300 DPI, PNG files can exceed 10 MB per page.',
  },
  {
    q: 'Does PDF to PNG support transparency?',
    a: 'PDF pages are rendered on a white background before export. Standard PDF content (text, images, graphics) will look identical. True page-level transparency is not preserved — transparent areas become white, matching standard PDF viewer behavior.',
  },
  {
    q: 'Is my PDF safe to convert online?',
    a: 'Completely safe. All conversion happens locally in your browser using PDF.js (WebAssembly). Your file is never sent to any server. We have zero access to your documents.',
  },
  {
    q: 'Can I convert a scanned PDF to PNG?',
    a: 'Yes. Scanned PDFs are image-based and convert quickly. Since the source is already a rasterized image, the output PNG quality will match the original scan resolution. Use 150 or 300 DPI to capture all detail.',
  },
  {
    q: 'What is the maximum PDF size I can convert?',
    a: 'There is no hard file size limit — processing happens entirely in your browser. Most devices handle PDFs up to 100 MB without issues. Very large PDFs at 300 DPI may be slow on older hardware due to canvas memory requirements.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'PDF to PNG Converter — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online PDF to PNG converter. Convert PDF pages to lossless PNG images at 72, 150, or 300 DPI. No signup, browser-based.',
      url: 'https://pdfforge.io/pdf-to-png',
    },
    {
      '@type': 'HowTo',
      name: 'How to Convert PDF to PNG Online',
      description:
        'Convert PDF pages to PNG images using PDFForge — free, private, no signup.',
      totalTime: 'PT1M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload PDF', text: 'Drop your PDF onto the upload area or click to browse.' },
        { '@type': 'HowToStep', position: 2, name: 'Choose DPI', text: 'Select 72 for web, 150 for standard, 300 for print-quality PNG.' },
        { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Preview all pages and download individually or as a ZIP file.' },
      ],
    },
  ],
}
