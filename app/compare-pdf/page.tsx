import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const ComparePdfTool = dynamic(() => import('./ComparePdfTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Compare PDF – Find Differences Between Two PDFs Free Online',
  description:
    'Compare two PDF files and see exactly what text was added, removed, or changed, page by page. Runs entirely in your browser — no upload, no signup required.',
  alternates: { canonical: '/compare-pdf' },
  openGraph: {
    title: 'Compare PDF – Find Differences Between Two PDFs | PDFForge',
    description: 'See word-level differences between two PDF documents, 100% browser-based. Free, no signup.',
    url: '/compare-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare PDF – Free Online | PDFForge',
    description: 'Compare two PDFs and see what changed. Runs in your browser. No signup.',
  },
}

const RELATED_SLUGS = ['ocr-pdf', 'pdf-to-word', 'merge-pdf']

export default function ComparePdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3 py-1.5 mb-4 text-xs text-teal-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block animate-pulse" />
            Runs 100% in your browser · Private · Free
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Compare PDF <span className="text-teal-600">Documents</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Upload two versions of a PDF and see exactly what changed — additions, deletions, and edits highlighted page by page. No upload, no signup.
          </p>
        </div>
      </section>

      <ComparePdfTool />

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Compare Two PDFs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-teal-600 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">What This Comparison Does and Doesn&apos;t Catch</h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              This tool extracts the text from each page of both PDFs and runs a word-level diff between
              matching pages — page 1 against page 1, page 2 against page 2, and so on — highlighting
              words that were added, removed, or left unchanged. It&apos;s the same kind of comparison
              you&apos;d get from comparing two drafts of a document: fast to scan, and precise about
              wording changes.
            </p>
            <p>
              Because it works on extracted text rather than rendered pixels, it won&apos;t catch purely
              visual changes — a shifted image, a different font, or reformatted spacing with identical
              wording won&apos;t show up as a difference. It also can&apos;t compare scanned PDFs directly,
              since a scan has no extractable text at all; run them through{' '}
              <Link href="/ocr-pdf" className="text-primary hover:underline">OCR PDF</Link> first to get a
              text layer, then compare the results.
            </p>
            <p>
              If pages were inserted or removed partway through a document, later pages will no longer line
              up — page 5 in the original might correspond to page 6 in the revised version. The comparison
              still runs, but everything past the insertion point will show as heavily changed even if the
              actual wording is identical, just shifted by a page.
            </p>
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

      <section className="py-12 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">You Might Also Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 border border-line hover:border-teal-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-teal-600 transition-colors">{tool.name}</p>
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
  { title: 'Upload both PDFs', body: 'Drop your Original and Revised files into the two upload slots. Nothing is uploaded — both are read straight into your browser.' },
  { title: 'Click Compare', body: 'Your browser extracts the text from every page of both files and diffs them page by page.' },
  { title: 'Review the differences', body: 'Added words are highlighted in green, removed words in red with a strikethrough. Unchanged pages are marked clearly.' },
]

const FAQS = [
  { q: 'Does this compare formatting or images, or just text?', a: 'Just text. It extracts the words on each page and diffs them — visual-only changes like reflowed spacing, a different font, or a moved image won\'t be detected if the wording is identical.' },
  { q: 'Can I compare a scanned PDF?', a: 'Not directly — a scan has no extractable text. Run it through OCR PDF first to generate a searchable version, then compare that against the other file.' },
  { q: 'What happens if the two PDFs have a different number of pages?', a: 'Pages are compared by position (page 1 vs page 1, etc). Extra pages in the longer file are flagged as existing only in that file, rather than being matched to the wrong page.' },
  { q: 'Is my file uploaded anywhere?', a: 'No. Both PDFs are read and compared entirely in your browser using PDF.js — neither file is ever transmitted anywhere.' },
  { q: 'Is there a limit to how many pages I can compare?', a: 'No hard limit — since this runs in your browser, the practical limit is your device\'s memory and how long you\'re willing to wait for very large documents to process.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Compare PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free online tool to compare two PDF files and highlight text differences, entirely in your browser. No signup, no upload required.',
      url: 'https://pdfforge.io/compare-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Compare Two PDF Files Online',
      totalTime: 'PT30S',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload', text: 'Drop both PDFs into the Original and Revised slots.' },
        { '@type': 'HowToStep', position: 2, name: 'Compare', text: 'Your browser diffs the text of both files page by page.' },
        { '@type': 'HowToStep', position: 3, name: 'Review', text: 'Added and removed words are highlighted for each page.' },
      ],
    },
  ],
}
