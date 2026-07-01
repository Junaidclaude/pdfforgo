import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const ExtractPagesTool = dynamic(() => import('./ExtractPagesTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Extract Pages from PDF – Free Online | PDFForge',
  description:
    'Extract specific pages from any PDF and save them as a single document or separate files. Select pages by clicking thumbnails. Free, no signup, 100% browser-based.',
  alternates: {
    canonical: '/extract-pages',
  },
  openGraph: {
    title: 'Extract Pages from PDF – Free Online | PDFForge',
    description:
      'Pick exactly which pages to keep and extract them from your PDF. Download as one combined PDF or individual files. Free, private, no signup.',
    url: '/extract-pages',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Extract Pages from PDF – Free | PDFForge',
    description:
      'Select pages to extract from your PDF. Download as single file or separate PDFs. No signup required.',
  },
}

const RELATED_SLUGS = ['split-pdf', 'remove-pages', 'organize-pdf']

export default function ExtractPagesPage() {
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
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 mb-4 text-xs text-emerald-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Extract Pages from PDF
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Select exactly which pages you want to keep and extract them from
            your PDF. Download as one combined document or as separate files.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <ExtractPagesTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            How to Extract Pages from a PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-emerald-600 text-lg">
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-emerald-300 transition-all hover:-translate-y-1 block"
              >
                <p className="font-display font-bold text-ink group-hover:text-emerald-600 transition-colors">
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
    body: 'Click the upload area or drag and drop your PDF. Page thumbnails are generated instantly in your browser — your file never leaves your device.',
  },
  {
    title: 'Select Pages to Extract',
    body: 'Click any thumbnail to select it. Selected pages are numbered in extraction order. Use the toolbar to select all, none, odd, even, or invert your selection.',
  },
  {
    title: 'Download Extracted Pages',
    body: 'Choose to save all selected pages as a single combined PDF, or download each page as a separate PDF file (packaged in a ZIP).',
  },
]

const FAQS = [
  {
    q: 'What is the difference between Extract Pages and Split PDF?',
    a: 'Split PDF divides a document into sequential ranges (e.g., pages 1–5, 6–10). Extract Pages lets you hand-pick any combination of pages in any order — for example, pages 2, 7, and 15 — and save only those. Extraction is more precise and flexible than splitting.',
  },
  {
    q: 'Can I extract pages in a different order than the original?',
    a: 'Yes. Pages are extracted in the order you click them, not necessarily the order they appear in the PDF. If you click page 5 first and then page 2, the resulting PDF will have page 5 first. The selection strip at the bottom shows the current extraction order.',
  },
  {
    q: 'What does "Separate PDFs" output mode do?',
    a: 'Separate PDFs creates one individual PDF file per selected page and packages them all into a single ZIP file for download. You can also download each page individually from the result list. This is useful when you need each page as a standalone document.',
  },
  {
    q: 'Is there a limit on how many pages I can extract?',
    a: 'No. You can extract any number of pages from any size PDF. All processing happens locally in your browser using pdf-lib (WebAssembly), so there are no server-side restrictions.',
  },
  {
    q: 'Does extracting pages preserve links, bookmarks, and form fields?',
    a: 'Hyperlinks embedded in page content are preserved. Document-level bookmarks (outlines) that reference other pages are not carried over to the extracted PDF, as those pages may not be present. Form fields within the extracted pages are preserved.',
  },
  {
    q: 'Can I extract pages from a password-protected PDF?',
    a: 'You need to unlock the PDF first. Use our Unlock PDF tool to remove password protection, then come back and extract the pages you need.',
  },
  {
    q: 'Is my PDF uploaded to a server?',
    a: 'No. Everything runs locally in your browser using WebAssembly. Your file is never sent to any server. PDFForge has zero access to your documents.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Extract Pages from PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online PDF page extractor. Select specific pages by thumbnail and download as a single PDF or separate files. No signup, browser-based.',
      url: 'https://pdfforge.io/extract-pages',
    },
    {
      '@type': 'HowTo',
      name: 'How to Extract Pages from a PDF Online',
      description:
        'Extract selected pages from a PDF using PDFForge — free, private, no signup.',
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
          name: 'Select Pages',
          text: 'Click page thumbnails to select the pages you want to extract.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download',
          text: 'Download selected pages as a single PDF or as separate files in a ZIP.',
        },
      ],
    },
  ],
}
