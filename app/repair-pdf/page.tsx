import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const RepairTool = dynamic(() => import('./RepairTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Repair PDF – Fix Corrupted PDF Files Free Online',
  description:
    'Repair and recover damaged or corrupted PDF files online for free. Re-saves clean PDF structure, removes invalid objects, and reduces file bloat. No signup, browser-based.',
  alternates: {
    canonical: '/repair-pdf',
  },
  openGraph: {
    title: 'Repair PDF – Fix Corrupted PDF Files Free | PDFForge',
    description:
      'Recover damaged PDF files by repairing invalid objects, malformed structure, and xref errors. Free, private, no signup — runs in your browser.',
    url: '/repair-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Repair PDF – Fix Corrupted PDFs Free | PDFForge',
    description:
      'Fix corrupted or damaged PDF files. Removes invalid objects and cleans the file structure. No signup required.',
  },
}

const RELATED_SLUGS = ['compress-pdf', 'unlock-pdf', 'protect-pdf']

export default function RepairPdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 mb-4 text-xs text-amber-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Repair Corrupted PDF
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Fix damaged PDF files that won&apos;t open or display errors. Repairs
            invalid objects, corrupted structure, and bloated xref tables — all
            in your browser.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <RepairTool />

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            How to Repair a Corrupted PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-amber-600 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guide ────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            What &quot;Corrupted PDF&quot; Actually Means — and Where Repair Hits Its Limits
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              A PDF isn&apos;t a flat image — it&apos;s a small database of objects (pages, fonts, images, an outline
              tree) stitched together by a cross-reference table that tells a reader where every object
              lives inside the file. &quot;Corruption&quot; almost always means that index, or one of the objects it
              points to, got damaged: a download that stopped halfway through, an app that crashed or lost
              power mid-save, an email gateway that mangled an attachment, or a PDF generator that wrote an
              incomplete file. The document&apos;s actual content — the text, the images — is often still sitting
              intact inside the file; what&apos;s broken is the map to find it.
            </p>
            <p>
              This is exactly why the tool works in tiers rather than trying one fix. It first attempts a
              normal, strict parse — if that succeeds, the file wasn&apos;t really broken, just re-saved cleanly.
              If that fails, it re-parses while tolerating invalid objects instead of aborting on the first
              one it can&apos;t make sense of, which recovers files where the xref table or a handful of objects
              are damaged but the rest of the structure is sound. If that still fails, it additionally
              strips an encryption wrapper, which fixes PDFs that combine structural damage with an
              owner-level lock. Each tier that succeeds re-saves the document with a fresh, valid
              cross-reference table — which is also why repaired files sometimes come out noticeably
              smaller: bloated or duplicated xref data and orphaned objects don&apos;t get carried into the
              rewrite.
            </p>
            <p>
              What this can&apos;t do is reconstruct data that&apos;s actually gone. If the bytes making up a page&apos;s
              content stream were themselves overwritten, truncated mid-write, or replaced with garbage —
              not just misindexed, but genuinely destroyed — there&apos;s nothing for any repair tool to recover;
              the content simply isn&apos;t in the file anymore. Similarly, if the file isn&apos;t a PDF at all (a
              renamed file, or a download that grabbed an error page instead of the actual document), no
              amount of lenient parsing will produce a PDF out of it. In practice, the failure message
              &quot;too severely damaged to recover&quot; means the parser couldn&apos;t find enough valid structure
              anywhere in the file to rebuild from — not that the tool gave up early.
            </p>
            <p>
              If your file opens with a warning but still opens, it&apos;s worth running through repair anyway —
              stricter viewers, print workflows, or automated ingestion systems (court filing portals,
              document management systems) are often far less forgiving than the software you happened to
              open it with. And if a repaired file also needs a password removed first,{' '}
              <Link href="/unlock-pdf" className="text-amber-600 hover:underline">Unlock PDF</Link> handles
              open-password PDFs that repair alone can&apos;t get past.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
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

      {/* ── Related tools ────────────────────────────────── */}
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-amber-300 transition-all hover:-translate-y-1 block"
              >
                <p className="font-display font-bold text-ink group-hover:text-amber-600 transition-colors">
                  {tool.name}
                </p>
                <p className="text-mute text-sm mt-1">{tool.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <AdSlot position="footer" />
      </div>
    </>
  )
}

const HOW_TO_STEPS = [
  {
    title: 'Upload Your Damaged PDF',
    body: 'Drop the corrupted PDF onto the upload area. The repair tool will attempt to parse it using pdf-lib\'s lenient reader — no server needed.',
  },
  {
    title: 'Automatic Repair',
    body: 'The tool tries up to three levels of repair: strict parse → lenient parse (ignores invalid objects) → remove encryption wrapper. It reports exactly what was fixed.',
  },
  {
    title: 'Download Clean PDF',
    body: 'Download the repaired PDF with a clean, optimised structure. Redundant data is stripped during the re-save, often resulting in a smaller file.',
  },
]

const FAQS = [
  {
    q: 'What types of PDF corruption can this tool fix?',
    a: 'The tool can recover PDFs with corrupted or duplicated object streams, invalid cross-reference (xref) tables, malformed page tree structures, and owner-locked encryption wrappers. It cannot recover PDFs where the page content streams themselves are destroyed (e.g., partially overwritten files).',
  },
  {
    q: 'Why won\'t my PDF open — what usually causes corruption?',
    a: 'The most common causes are incomplete downloads (file cut off mid-transfer), failed save operations (power loss or crash during save), email attachment corruption, storage media errors, or partially failed PDF generation from software. This tool addresses all of these except physical media errors.',
  },
  {
    q: 'Does the repaired PDF keep all pages and content?',
    a: 'In most cases, yes. Content that is stored in valid page streams is preserved exactly. If an object is unrecoverable, it is removed cleanly rather than causing the entire document to fail.',
  },
  {
    q: 'My PDF says "file is damaged" but it still opens — should I repair it?',
    a: 'Yes. A PDF that opens with a warning has a structural issue that may cause problems in stricter PDF viewers (e.g., for legal submission or printing). Running it through the repair tool produces a clean, standards-compliant file.',
  },
  {
    q: 'Can this tool fix a PDF that was encrypted or password-protected?',
    a: 'If the PDF has an owner restriction (permissions lock) but no open password, the repair tool can strip it. If the PDF requires an open password to view, use the Unlock PDF tool first (you will need the correct password), then repair.',
  },
  {
    q: 'Is there a file size limit for repair?',
    a: 'No hard limit. Processing happens entirely in your browser, so the only constraint is your device\'s available RAM. Files up to 200 MB should work on modern hardware.',
  },
  {
    q: 'Is my PDF sent to a server?',
    a: 'No. The entire repair process runs locally using pdf-lib (WebAssembly) in your browser. Your file is never uploaded to PDFForge or any third party.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Repair PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online PDF repair tool. Fix corrupted, damaged, or malformed PDF files. No signup, browser-based, private.',
      url: 'https://pdfforge.io/repair-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Repair a Corrupted PDF Online',
      description: 'Fix a damaged PDF using PDFForge — free, private, no signup.',
      totalTime: 'PT1M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload Damaged PDF', text: 'Drop the corrupted PDF onto the upload area or click to browse.' },
        { '@type': 'HowToStep', position: 2, name: 'Repair', text: 'The tool automatically attempts three levels of repair and reports what was fixed.' },
        { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download the repaired, clean PDF file.' },
      ],
    },
  ],
}
