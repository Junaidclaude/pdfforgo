import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const PageNumbersTool = dynamic(() => import('./PageNumbersTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Add Page Numbers to PDF – Free Online',
  description:
    'Add page numbers to your PDF online for free. Choose format, position, font size, and starting number. No signup — 100% browser-based, private.',
  alternates: { canonical: '/page-numbers' },
  openGraph: {
    title: 'Add Page Numbers to PDF – Free Online | PDFForge',
    description: 'Add page numbers in any format and position to your PDF. Free, no signup, browser-based.',
    url: '/page-numbers', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Add Page Numbers to PDF – Free Online | PDFForge', description: 'Add page numbers to any PDF. Multiple formats, positions, and font sizes.' },
}

const RELATED_SLUGS = ['watermark-pdf', 'rotate-pdf', 'compress-pdf']

export default function PageNumbersPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-3 py-1.5 mb-4 text-xs text-sky-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">Add Page Numbers to PDF</h1>
          <p className="text-mute text-lg max-w-xl mx-auto">Number your PDF pages in seconds. Choose your format (1, Page 1, Page 1 of 10), position, font size, and where to start counting.</p>
        </div>
      </section>
      <PageNumbersTool />
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Add Page Numbers to a PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-sky-600 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">Numbering a Document That Has an Unnumbered Cover Page</h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              This tool numbers every page of the PDF you upload, in order, starting from whatever number
              you set in &quot;Start at.&quot; That&apos;s exactly what most documents need — but it means there&apos;s no
              built-in way to leave a single cover or title page blank while numbering everything after it
              as &quot;1.&quot; A lot of reports, theses, and legal filings want precisely that: an unnumbered cover,
              then page 1 starting on the content that follows it.
            </p>
            <p>
              The workaround is a two-tool combination rather than a setting. Use{' '}
              <Link href="/split-pdf" className="text-sky-600 hover:underline">Split PDF</Link> to pull
              the cover page off as its own file, run this tool on the remaining pages with &quot;Start at&quot; set
              to 1, then use{' '}
              <Link href="/merge-pdf" className="text-sky-600 hover:underline">Merge PDF</Link> to stitch
              the untouched cover back onto the front of the newly numbered set. It&apos;s three quick steps
              instead of one, but each step runs in seconds and you end up with exactly the numbering
              convention that formal documents actually expect.
            </p>
            <p>
              The &quot;Start at&quot; field has one more consequence worth knowing if you use the &quot;Page n of N&quot;
              or &quot;n / N&quot; formats. The &quot;N&quot; isn&apos;t a count of the physical pages in the file you uploaded —
              it&apos;s the highest number the sequence reaches. If you start at 5 on a 10-page PDF, the last
              page is labeled &quot;Page 14 of 14,&quot; not &quot;Page 14 of 10.&quot; That&apos;s the correct behavior when this
              PDF is one segment of a larger combined document and you want the numbering to reflect the
              full document&apos;s true length, but it will look wrong if you just wanted to offset the count
              without changing what &quot;total pages&quot; means — in that case, leave &quot;Start at&quot; on 1 and adjust
              expectations instead.
            </p>
            <p>
              Format choice is mostly about the reader&apos;s context: a bare number works for internal drafts,
              &quot;Page n&quot; reads naturally in printed handouts, and &quot;Page n of N&quot; or &quot;n / N&quot; are the formats
              reviewers expect in contracts and academic submissions, since they make it obvious if a page
              is missing from a printed set. Whichever you pick, the numbers are drawn into the page margin,
              so as long as your original content has reasonable margins already, nothing gets covered.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">Frequently Asked Questions</h2>
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
      <section className="py-12 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">You Might Also Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 border border-line hover:border-sky-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-sky-600 transition-colors">{tool.name}</p>
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
  { title: 'Upload Your PDF', body: 'Drop your PDF onto the upload area. The file is processed entirely in your browser.' },
  { title: 'Set Number Options', body: 'Choose your format (plain number, "Page n", "Page n of N"), position (top/bottom, left/center/right), font size, and starting number.' },
  { title: 'Download Numbered PDF', body: 'Click Add Page Numbers and download your PDF with page numbers added to every page.' },
]

const FAQS = [
  { q: 'Can I start page numbering from a number other than 1?', a: 'Yes. Set any starting number in the "Start at" field. For example, start at 5 if this is part of a larger document that already has 4 pages.' },
  { q: 'What page number formats are available?', a: 'You can choose from: plain number (1), "Page 1", "Page 1 of 10" (includes total pages), or "1 / 10" — useful for academic and legal documents.' },
  { q: 'Where can I place the page numbers?', a: 'You can place numbers at the top or bottom of each page, aligned left, center, or right. The margin distance from the edge is adjustable.' },
  { q: 'Will page numbers affect the existing PDF content?', a: 'Numbers are drawn in the page margin area. As long as the original content doesn\'t extend to the very edge of the page, the numbers will not overlap it.' },
  { q: 'Is my PDF safe to number online with PDFForge?', a: 'Completely safe. All processing runs locally in your browser using pdf-lib (WebAssembly). Your file is never sent to any server.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'Add Page Numbers to PDF — PDFForge', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Free online tool to add page numbers to PDF files. Multiple formats and positions. No signup, browser-based.', url: 'https://pdfforge.io/page-numbers' },
    { '@type': 'HowTo', name: 'How to Add Page Numbers to a PDF Online', totalTime: 'PT30S', step: [{ '@type': 'HowToStep', position: 1, name: 'Upload', text: 'Drop your PDF onto the tool.' }, { '@type': 'HowToStep', position: 2, name: 'Configure', text: 'Choose format, position, and starting number.' }, { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Click Add Page Numbers and download.' }] },
  ],
}
