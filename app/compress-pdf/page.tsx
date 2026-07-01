import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const CompressTool = dynamic(() => import('./CompressTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Compress PDF – Free Online',
  description:
    'Compress PDF files online for free. Reduce PDF file size without losing quality. Choose lossless or image-based compression. No signup — 100% browser-based, private.',
  alternates: {
    canonical: '/compress-pdf',
  },
  openGraph: {
    title: 'Compress PDF – Reduce PDF Size Free Online | PDFForge',
    description:
      'Reduce PDF file size instantly. Lossless or image-based compression. Free, no signup, files stay in your browser.',
    url: '/compress-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compress PDF – Free Online | PDFForge',
    description:
      'Reduce PDF file size instantly. Choose compression level. No signup required.',
  },
}

const RELATED_SLUGS = ['merge-pdf', 'split-pdf', 'pdf-to-word']

export default function CompressPdfPage() {
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
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 mb-4 text-xs text-blue-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Compress PDF Files Online
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Reduce PDF file size without losing quality. Choose lossless
            structure optimization or image-based compression for maximum
            savings.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <CompressTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            How to Compress a PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-blue-600 text-lg">
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

      {/* ── Guide ─────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            Why PDFs Get Huge (and What Actually Shrinks Them)
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              A 3-page PDF that&apos;s 40 MB is almost never a text problem — it&apos;s an image problem.
              Scanned documents, screenshots pasted into a Word export, or high-resolution photos dropped
              into a report are the usual culprits. Text and vector graphics take up almost no space by
              comparison, so compression tools work primarily by re-encoding the embedded images at a
              lower resolution and quality, not by touching the text itself.
            </p>
            <p>
              That&apos;s why the &quot;quality&quot; setting matters more than most people expect. A scanned
              contract that only needs to be read on screen can usually drop to a much lower quality than a
              photography portfolio meant for print — the same compression level that looks fine for one
              can look noticeably soft on the other. It&apos;s worth trying a middle setting first and
              comparing file size against visual quality before going aggressive.
            </p>
            <p>
              If you&apos;re specifically trying to hit an email attachment limit (commonly 25 MB on Gmail,
              often lower on corporate mail servers), compressing is usually enough on its own. For PDFs
              that are large mainly because they contain <em>many</em> pages rather than heavy images,
              consider whether the recipient actually needs every page —{' '}
              <Link href="/extract-pages" className="text-primary hover:underline">Extract Pages</Link> or{' '}
              <Link href="/remove-pages" className="text-primary hover:underline">Remove Pages</Link> can
              cut file size more than compression alone when the bulk of the document isn&apos;t relevant.
            </p>
            <p>
              One thing compression won&apos;t fix: a PDF that&apos;s bloated because of duplicate embedded
              fonts or leftover editing history from the software that created it. Those cases benefit more
              from{' '}
              <Link href="/repair-pdf" className="text-primary hover:underline">Repair PDF</Link>, which
              rebuilds the file&apos;s internal structure rather than re-compressing images.
            </p>
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-blue-300 transition-all hover:-translate-y-1 block"
              >
                <p className="font-display font-bold text-ink group-hover:text-blue-600 transition-colors">
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
    body: 'Click the upload area or drag and drop your PDF. The tool reads the page count instantly — no waiting for a server.',
  },
  {
    title: 'Choose Compression Level',
    body: 'Pick Lossless (preserves text), Balanced (good quality, big savings), or Maximum (smallest file possible).',
  },
  {
    title: 'Download Compressed PDF',
    body: 'See the before/after file size, then download your optimized PDF immediately. No email or signup needed.',
  },
]

const FAQS = [
  {
    q: 'How much can I reduce a PDF file size?',
    a: 'It depends on the PDF content. Lossless compression typically saves 5–20%. Image-based compression (Balanced/Maximum) can reduce file size by 50–90%, especially for scanned documents or PDFs with many images.',
  },
  {
    q: 'What is the difference between lossless and image compression?',
    a: 'Lossless compression removes redundant PDF structure data — text stays searchable and quality is identical. Image-based compression renders each page as a JPEG, which is much smaller but text becomes non-selectable.',
  },
  {
    q: 'Will compressing a PDF reduce its quality?',
    a: 'Lossless compression has zero quality impact. Balanced and Maximum modes render pages as JPEG images — visual quality is very good at Balanced, lower at Maximum. Choose based on your use case.',
  },
  {
    q: 'Is it safe to compress PDFs online with PDFForge?',
    a: 'Yes — completely safe. All processing runs locally in your browser using WebAssembly and the Canvas API. Your PDF is never uploaded to any server. We have no access to your files.',
  },
  {
    q: 'Why is my compressed PDF larger than the original?',
    a: 'This can happen with very small or already-optimized PDFs. If lossless compression increases the size, that PDF is already well-compressed. Try Balanced compression instead, or if the original is already tiny, no action is needed.',
  },
  {
    q: 'Can I compress a password-protected PDF?',
    a: 'PDFs with owner passwords (editing/printing restrictions) can usually be compressed. PDFs requiring a password to open must be unlocked first — use our free Unlock PDF tool.',
  },
  {
    q: 'Does compression work on scanned PDFs?',
    a: 'Yes! Scanned PDFs are image-heavy and often compress very well with Balanced or Maximum mode, sometimes achieving 70–85% size reduction.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Compress PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online PDF compressor. Lossless and image-based compression. No signup, browser-based.',
      url: 'https://pdfforge.io/compress-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Compress a PDF File Online',
      description:
        'Reduce PDF file size using PDFForge — free, private, no signup.',
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
          name: 'Choose Level',
          text: 'Select Lossless, Balanced, or Maximum compression.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download',
          text: 'See the size reduction and download your compressed PDF.',
        },
      ],
    },
  ],
}
