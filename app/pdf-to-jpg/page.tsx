import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const PdfToJpgTool = dynamic(() => import('./PdfToJpgTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'PDF to JPG – Free Online Converter',
  description:
    'Convert PDF to JPG or PNG images online for free. Choose 72, 150, or 300 DPI. Download individual pages or all as a ZIP. No signup — 100% browser-based, private.',
  alternates: {
    canonical: '/pdf-to-jpg',
  },
  openGraph: {
    title: 'PDF to JPG – Convert PDF Pages to Images Free | PDFForge',
    description:
      'Convert every PDF page to JPG or PNG. Choose DPI quality. Download individually or as ZIP. Free, no signup, files stay in your browser.',
    url: '/pdf-to-jpg',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF to JPG – Free Online | PDFForge',
    description:
      'Convert PDF pages to JPG or PNG images. 72/150/300 DPI. No signup required.',
  },
}

const RELATED_SLUGS = ['jpg-to-pdf', 'compress-pdf', 'pdf-to-word']

export default function PdfToJpgPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))

  return (
    <>
      {/* ── Structured data ──────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-dark text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1.5 mb-4 text-xs text-purple-300">
            Client-side · Files stay on your device
          </div>
          <h1 className="font-syne text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Convert PDF to JPG Online
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Turn every PDF page into a high-quality JPG or PNG image. Pick your
            DPI, preview the results, and download individually or as a ZIP.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <PdfToJpgTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark text-center mb-10">
            How to Convert PDF to JPG
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-syne font-extrabold text-purple-500 text-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-syne font-bold text-dark mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-syne font-bold text-dark mb-2 text-base">
                  {faq.q}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related tools ─────────────────────────────────── */}
      <section className="py-12 px-4 bg-bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne text-xl font-extrabold text-dark mb-6 text-center">
            You Might Also Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 block"
              >
                <p className="font-syne font-bold text-dark group-hover:text-purple-500 transition-colors">
                  {tool.name}
                </p>
                <p className="text-gray-500 text-sm mt-1">{tool.shortDesc}</p>
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
    body: 'Click the upload area or drag and drop a PDF file. The tool reads every page instantly in your browser — no uploading to any server.',
  },
  {
    title: 'Choose Format & Quality',
    body: 'Select JPG or PNG output. Then pick your DPI: Web/Email (72 DPI), Standard (150 DPI), or Print-Ready (300 DPI) for crisp high-resolution images.',
  },
  {
    title: 'Download Your Images',
    body: 'Preview all converted pages in the grid. Download any individual image with one click, or grab all pages at once as a ZIP file.',
  },
]

const FAQS = [
  {
    q: 'How do I convert a PDF to JPG for free?',
    a: 'Upload your PDF using the tool above, select JPG as the format and your preferred DPI, then click Convert. You can preview every page and download them individually or all at once as a ZIP — completely free, no signup required.',
  },
  {
    q: 'What DPI should I use when converting PDF to JPG?',
    a: '72 DPI is ideal for web and email use — fast to generate, small file sizes. 150 DPI (Standard) is a great all-around choice for on-screen viewing and presentations. 300 DPI is best for printing — it produces sharp, publication-quality images but larger file sizes.',
  },
  {
    q: 'Should I use JPG or PNG when converting a PDF?',
    a: 'JPG is smaller and best for photographs, scanned documents, and most general use. PNG is lossless — ideal when you need crisp text, diagrams, or transparent backgrounds. Note: PDFs don\'t have transparency, so PNG and JPG will look nearly identical in most cases.',
  },
  {
    q: 'Can I convert only specific pages of a PDF to JPG?',
    a: 'All pages are converted when you click Convert. After processing, you can download individual pages by clicking the download button on each preview image — no need to download pages you don\'t want.',
  },
  {
    q: 'Why does high-DPI conversion take longer?',
    a: 'At 300 DPI, each page is rendered at over 4× the pixel area of 72 DPI — a typical A4 page becomes a 2480×3508 pixel image. This is processed in your browser using a canvas, which takes more CPU time for large PDFs. The images themselves are also larger.',
  },
  {
    q: 'Is my PDF safe to convert online with PDFForge?',
    a: 'Completely safe. PDFForge runs the entire conversion in your browser using WebAssembly (PDF.js). Your file is never sent to any server. We have zero access to your documents — everything stays on your device.',
  },
  {
    q: 'Can I convert a scanned PDF to JPG?',
    a: 'Yes. Scanned PDFs are already image-based, so they convert quickly and the output quality closely matches the original scan. Use 150 or 300 DPI to match the scan resolution for the best results.',
  },
  {
    q: 'What is the maximum PDF size I can convert?',
    a: 'Since processing happens in your browser, the limit depends on your device\'s RAM. Most modern devices handle PDFs up to 100–200MB without issues. Very large PDFs (500+ pages) may slow down your browser at high DPI settings.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'PDF to JPG Converter — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online PDF to JPG converter. Convert PDF pages to JPG or PNG images at 72, 150, or 300 DPI. No signup, browser-based.',
      url: 'https://pdfforge.io/pdf-to-jpg',
    },
    {
      '@type': 'HowTo',
      name: 'How to Convert PDF to JPG Online',
      description:
        'Convert PDF pages to JPG or PNG images using PDFForge — free, private, no signup.',
      totalTime: 'PT1M',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload PDF',
          text: 'Drop your PDF onto the upload area or click to browse.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Choose Format & DPI',
          text: 'Select JPG or PNG and pick your DPI: 72 for web, 150 for standard, 300 for print.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download Images',
          text: 'Preview all pages and download individually or as a ZIP file.',
        },
      ],
    },
  ],
}
