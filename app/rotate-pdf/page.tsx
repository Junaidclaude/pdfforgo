import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const RotateTool = dynamic(() => import('./RotateTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Rotate PDF – Free Online',
  description:
    'Rotate PDF pages online for free. Rotate all pages or specific pages by 90°, 180°, or 270°. No signup required — processed entirely in your browser, 100% private.',
  alternates: {
    canonical: '/rotate-pdf',
  },
  openGraph: {
    title: 'Rotate PDF – Rotate Pages Free Online | PDFForge',
    description:
      'Rotate all or specific PDF pages 90° left, 90° right, or 180°. Free, instant, no signup — browser-based.',
    url: '/rotate-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rotate PDF – Free Online | PDFForge',
    description:
      'Rotate PDF pages 90° or 180°. Rotate all or specific pages. No signup.',
  },
}

const RELATED_SLUGS = ['merge-pdf', 'split-pdf', 'pdf-to-jpg']

export default function RotatePdfPage() {
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
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5 mb-4 text-xs text-yellow-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Rotate PDF Pages Online
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Fix sideways or upside-down PDF pages instantly. Rotate all pages
            or choose specific ones — 90° left, 90° right, or 180°.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <RotateTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            How to Rotate a PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-yellow-600 text-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-mute text-sm leading-relaxed">
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
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <h3 className="font-display font-bold text-ink mb-2 text-base">
                  {faq.q}
                </h3>
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-yellow-300 transition-all hover:-translate-y-1 block"
              >
                <p className="font-display font-bold text-ink group-hover:text-yellow-600 transition-colors">
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
    body: 'Click the upload area or drag and drop a PDF file. The tool reads the page count instantly in your browser.',
  },
  {
    title: 'Choose Rotation & Pages',
    body: 'Select 90° left, 90° right, or 180°. Then pick which pages to rotate — all, odd, even, or specific page numbers.',
  },
  {
    title: 'Download Rotated PDF',
    body: 'Click Rotate PDF and download your corrected document immediately. No email or account required.',
  },
]

const FAQS = [
  {
    q: 'How do I rotate all pages in a PDF?',
    a: 'Upload your PDF, choose your rotation angle (90° left, 90° right, or 180°), leave the page selection on "All pages", then click Rotate PDF. All pages will be rotated and you can download the result.',
  },
  {
    q: 'Can I rotate only specific pages in a PDF?',
    a: 'Yes. After uploading, select "Custom" under "Pages to Rotate" and enter your page numbers — for example "1, 3, 5-8". Only those pages will be rotated.',
  },
  {
    q: 'How do I fix a sideways or upside-down PDF?',
    a: 'Upload the PDF and rotate it 90° right or left to fix a sideways page. For an upside-down PDF, use the 180° rotation option.',
  },
  {
    q: 'Does rotating a PDF reduce quality?',
    a: 'No. PDF rotation only updates the Rotate metadata field in the file — it does not re-encode any images or text. The document quality is completely unchanged.',
  },
  {
    q: 'Will the rotated PDF be larger than the original?',
    a: 'It will be nearly identical in size. Only a small amount of metadata is changed. The rest of the file is preserved byte-for-byte.',
  },
  {
    q: 'Can I rotate a password-protected PDF?',
    a: 'PDFs with owner passwords (editing/printing restrictions) can usually be rotated. PDFs requiring a password to open must be unlocked first — use our free Unlock PDF tool.',
  },
  {
    q: 'Is my PDF safe when I rotate it online?',
    a: 'Completely. PDFForge runs entirely in your browser. Your file is never sent to any server. We have zero access to your documents — everything stays on your device.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Rotate PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online PDF rotation tool. Rotate all or specific pages 90° or 180°. No signup, browser-based.',
      url: 'https://pdfforge.io/rotate-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Rotate PDF Pages Online',
      description:
        'Rotate pages in a PDF file using PDFForge — free, private, no signup.',
      totalTime: 'PT30S',
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
          name: 'Choose Rotation',
          text: 'Select 90° left, 90° right, or 180°, then choose which pages to rotate.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download',
          text: 'Click Rotate PDF and download the corrected document.',
        },
      ],
    },
  ],
}
