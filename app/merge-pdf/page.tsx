import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

// Load the interactive tool client-side only (uses pdf-lib / WebAssembly)
const MergeTool = dynamic(() => import('./MergeTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Merge PDF – Free Online',
  description:
    'Merge multiple PDF files into one document online for free. Drag to reorder pages. No signup required — files are processed entirely in your browser and never uploaded.',
  alternates: {
    canonical: '/merge-pdf',
  },
  openGraph: {
    title: 'Merge PDF – Combine PDF Files Free Online | PDFForge',
    description:
      'Combine multiple PDFs into one document instantly. Drag to reorder. No signup, no watermarks, 100% private.',
    url: '/merge-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merge PDF – Free Online | PDFForge',
    description: 'Combine multiple PDFs into one document. No signup required.',
  },
}

const RELATED_SLUGS = ['split-pdf', 'compress-pdf', 'rotate-pdf']

export default function MergePdfPage() {
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
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 mb-4 text-xs text-primary-light">
            Client-side · Files stay on your device
          </div>
          <h1 className="font-syne text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Merge PDF Files Online
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Combine multiple PDFs into one. Drag to reorder. Download
            instantly. No signup, no watermarks — 100% free.
          </p>
        </div>
      </section>

      {/* ── Tool (client component) ───────────────────────── */}
      <MergeTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark text-center mb-10">
            How to Merge PDF Files
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-syne font-extrabold text-primary text-lg">
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

      {/* ── Guide ─────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark mb-6">
            When You Actually Need to Merge PDFs
          </h2>
          <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
            <p>
              The most common reason people end up here is paperwork that arrived in the wrong shape: a
              signed contract that came back as three separate scans, an invoice and its supporting
              receipts sitting in different files, or a set of chapter PDFs that need to become one
              submission. Merging turns that scattered set into a single document you can actually send,
              print, or archive without explaining to the recipient which order to read things in.
            </p>
            <p>
              A few things are worth knowing before you merge. First, <strong>page order matters more than
              it seems</strong> — once merged, most people don&apos;t reorder again, so it&apos;s worth
              double-checking the drag order against the physical document if you&apos;re combining scans.
              Second, <strong>mixed page sizes are fine</strong>: a merged PDF can contain both A4 and Letter
              pages, or portrait and landscape pages, without any conversion — each page keeps its own
              dimensions.
            </p>
            <p>
              If you&apos;re merging scanned documents specifically, consider running each scan through{' '}
              <Link href="/compress-pdf" className="text-primary hover:underline">Compress PDF</Link> first
              — scanned pages are usually the biggest contributor to an oversized final file, and merging
              won&apos;t reduce their size for you. And if any of the source files are locked with an owner
              password (print/edit restrictions rather than an open password), merging usually still works;
              if a file requires a password just to open, run it through{' '}
              <Link href="/unlock-pdf" className="text-primary hover:underline">Unlock PDF</Link> first.
            </p>
            <p>
              Because merging happens entirely in your browser, there&apos;s no practical limit tied to
              upload speed or server queues — the only real constraint is your device&apos;s own memory when
              handling very large combined files (say, merging dozens of high-resolution scans). For typical
              use — combining a handful of contracts, reports, or scanned pages — it&apos;s essentially
              instant regardless of your connection.
            </p>
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
                <p className="font-syne font-bold text-dark group-hover:text-primary transition-colors">
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
    title: 'Upload Your PDFs',
    body: 'Click the upload area or drag and drop multiple PDF files. You can add up to 20 files at once and add more at any time.',
  },
  {
    title: 'Arrange the Order',
    body: 'Drag the file rows up or down to set the order you want. The merged PDF will follow this exact sequence.',
  },
  {
    title: 'Download Your PDF',
    body: 'Click "Merge PDFs" and your combined document is ready instantly. No email required — direct download.',
  },
]

const FAQS = [
  {
    q: 'Is it safe to merge PDFs online with PDFForge?',
    a: 'Yes — 100% safe. PDFForge runs entirely in your browser using WebAssembly. Your files are never uploaded to any server. Nothing leaves your device.',
  },
  {
    q: 'How many PDF files can I merge at once?',
    a: 'You can merge up to 20 PDF files in one session. For larger batches, merge in groups and then combine the resulting files.',
  },
  {
    q: 'Will merging PDFs reduce the quality of my documents?',
    a: 'No. The merge is completely lossless — all text, images, fonts, vector graphics, and formatting are preserved exactly as they appear in the originals.',
  },
  {
    q: 'Can I merge password-protected PDFs?',
    a: 'PDFs with an owner password (editing restrictions) can usually be merged. PDFs that require a password to open must be unlocked first — use our free Unlock PDF tool.',
  },
  {
    q: 'Does PDFForge add a watermark to the merged file?',
    a: 'Never. PDFForge is completely free with no watermarks, no hidden fees, and no restrictions on the output file.',
  },
  {
    q: 'What happens to my files after I merge them?',
    a: 'Nothing — because they never leave your browser. All processing is done locally on your device. When you close the tab, the files are gone. We have zero access to your documents.',
  },
  {
    q: 'Does merging PDFs work on mobile devices?',
    a: 'Yes. PDFForge works on any modern browser including Safari on iPhone, Chrome on Android, and all desktop browsers — no app needed.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Merge PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online tool to merge multiple PDF files into one document. No signup required. Files processed locally in your browser.',
      url: 'https://pdfforge.io/merge-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Merge PDF Files Online',
      description:
        'Combine multiple PDF files into one document using PDFForge for free.',
      totalTime: 'PT1M',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload PDFs',
          text: 'Click the upload area or drag and drop multiple PDF files.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Arrange Order',
          text: 'Drag the file rows to set the order for the merged PDF.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download',
          text: 'Click Merge PDFs and download your combined document instantly.',
        },
      ],
    },
  ],
}
