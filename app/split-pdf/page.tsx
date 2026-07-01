import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const SplitTool = dynamic(() => import('./SplitTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Split PDF – Free Online',
  description:
    'Split a PDF into multiple files online for free. Extract page ranges, split every N pages, or save each page separately. No signup — files processed in your browser.',
  alternates: {
    canonical: '/split-pdf',
  },
  openGraph: {
    title: 'Split PDF – Extract Pages Free Online | PDFForge',
    description:
      'Split any PDF by page range, chunk size, or individual pages. Free, instant, no signup — runs entirely in your browser.',
    url: '/split-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Split PDF – Free Online | PDFForge',
    description:
      'Extract pages from a PDF. Split by range, every N pages, or individually.',
  },
}

const RELATED_SLUGS = ['merge-pdf', 'compress-pdf', 'pdf-to-jpg']

export default function SplitPdfPage() {
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
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5 mb-4 text-xs text-orange-300">
            Client-side · Files stay on your device
          </div>
          <h1 className="font-syne text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Split PDF Files Online
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Extract specific pages, split by range, or separate every page into
            its own file. Instant download — no signup required.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <SplitTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark text-center mb-10">
            How to Split a PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-syne font-extrabold text-orange-500 text-lg">
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
            A Complete Guide to Splitting PDFs
          </h2>
          <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
            <p>
              &quot;Split a PDF&quot; actually covers two different jobs people search for interchangeably,
              and it helps to know which one you actually need. The first is <strong>extraction</strong>:
              pulling a specific handful of pages — say, pages 4 through 9 — out of a larger document to send
              on their own. The second is <strong>batch splitting</strong>: breaking one large file into
              several smaller files, usually along even boundaries, like turning a 100-page scanned book
              into ten 10-page chapters. This tool handles both, and the workflow you pick changes depending
              on which one you&apos;re actually trying to do.
            </p>
            <p>
              The most common reason people land here is a file that&apos;s too big for its purpose. A
              200-page merged scan needs to become individual invoices again. A signed contract bundle needs
              just the signature page pulled out for a records system. A textbook PDF needs to become
              per-chapter files so students can download only what they need for that week. In every case,
              the underlying problem is the same: someone combined things into one file for convenience, and
              now that convenience is working against you.
            </p>
            <p>
              <strong>If you&apos;re extracting a specific range</strong>, the fastest approach is to select
              exactly the pages you need and export them as one file — don&apos;t split into individual
              single-page files and then try to reassemble them, that&apos;s extra steps for no benefit. If
              you&apos;re not sure of the exact page numbers, preview thumbnails first rather than guessing
              from the page count alone; scanned documents in particular often have blank separator pages or
              cover sheets that throw off simple math like &quot;chapter 2 starts at page 21.&quot;
            </p>
            <p>
              <strong>If you&apos;re batch-splitting into equal chunks</strong>, think about how the pieces
              will actually be used before picking a split size. Splitting a 100-page report into 10-page
              chunks makes sense for review purposes, but if the real goal is &quot;one file per chapter,&quot;
              chapters are rarely exactly the same length — you&apos;ll get a cleaner result extracting each
              chapter&apos;s actual page range individually rather than forcing an even split and manually
              fixing the boundaries afterward.
            </p>
            <p>
              One thing worth knowing: splitting a PDF doesn&apos;t reduce total file size — the sum of the
              parts is roughly the same as (or very slightly larger than) the original whole. If your actual
              goal is a smaller file rather than separate files, split first and then run the specific pages
              you need through{' '}
              <Link href="/compress-pdf" className="text-primary hover:underline">Compress PDF</Link>, or
              compress before splitting if you want every resulting piece to already be small. And if what
              you actually want is to remove a few pages while keeping everything else as one document —
              rather than producing multiple output files —{' '}
              <Link href="/remove-pages" className="text-primary hover:underline">Remove Pages</Link> is the
              more direct tool for that job.
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
                <p className="font-syne font-bold text-dark group-hover:text-orange-500 transition-colors">
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
    body: 'Click the upload area or drag and drop a PDF file. The tool instantly reads the page count — no waiting.',
  },
  {
    title: 'Choose Split Mode',
    body: 'Select page ranges (e.g. 1-5, 6-10), split every N pages, or export each page as a separate PDF file.',
  },
  {
    title: 'Download Your Files',
    body: 'Download each split part individually or grab them all in a single ZIP archive — ready in seconds.',
  },
]

const FAQS = [
  {
    q: 'How do I split a PDF into separate pages?',
    a: 'Upload your PDF, select "Individual Pages" mode, then click Split. Each page is extracted into its own PDF and bundled in a ZIP for easy download.',
  },
  {
    q: 'Can I extract specific pages from a PDF?',
    a: 'Yes. Use "By Page Range" mode and enter your desired pages — for example "1-3, 7, 10-12". Each range becomes a separate PDF file.',
  },
  {
    q: 'Is there a file size limit for splitting PDFs?',
    a: 'No hard limit — all processing runs in your browser. For very large files (500MB+) performance depends on your device memory.',
  },
  {
    q: 'Will my PDF lose quality after splitting?',
    a: 'No. Splitting is a lossless operation. All text, images, fonts, and formatting are preserved exactly as in the original.',
  },
  {
    q: 'Can I split a password-protected PDF?',
    a: 'PDFs protected with an owner password (editing restrictions) can usually be split. PDFs requiring a password to open must be unlocked first using our Unlock PDF tool.',
  },
  {
    q: 'How do I download multiple split PDF files at once?',
    a: 'When your split produces more than one file, a "Download All as ZIP" button appears. Click it to get all files in a single ZIP archive.',
  },
  {
    q: 'Are my files safe when I split a PDF online?',
    a: 'Completely. PDFForge processes everything locally in your browser using WebAssembly. Your PDF is never sent to any server — we cannot see, access, or store your files.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Split PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online PDF splitter. Extract pages, split by range or chunk size. No signup. Browser-based.',
      url: 'https://pdfforge.io/split-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Split a PDF Online',
      description: 'Split a PDF file into multiple documents using PDFForge.',
      totalTime: 'PT1M',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload PDF',
          text: 'Click the upload area or drag and drop a PDF file.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Choose Split Mode',
          text: 'Select by page range, every N pages, or individual pages.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download',
          text: 'Download each file individually or as a ZIP archive.',
        },
      ],
    },
  ],
}
