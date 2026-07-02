import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const RemovePagesTool = dynamic(() => import('./RemovePagesTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Remove Pages from PDF – Free Online',
  description:
    'Delete specific pages from a PDF online for free. Click page thumbnails to select and remove them. Preview before deleting. No signup — 100% browser-based, private.',
  alternates: { canonical: '/remove-pages' },
  openGraph: {
    title: 'Remove PDF Pages – Delete Pages Free Online | PDFForge',
    description: 'Select and remove specific pages from your PDF. Preview thumbnails before deleting. Free, no signup, browser-based.',
    url: '/remove-pages', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Remove PDF Pages – Free Online | PDFForge', description: 'Delete specific pages from a PDF. No signup required.' },
}

const RELATED_SLUGS = ['split-pdf', 'organize-pdf', 'merge-pdf']

export default function RemovePagesPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 mb-4 text-xs text-red-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">Remove Pages from PDF</h1>
          <p className="text-mute text-lg max-w-xl mx-auto">Upload your PDF and click the pages you want to delete. Preview all pages as thumbnails before removing them — nothing is processed until you confirm.</p>
        </div>
      </section>
      <RemovePagesTool />
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Remove Pages from a PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-red-600 text-lg">{i + 1}</span>
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
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            What People Actually Delete, and What They Miss
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              Most page removal falls into a small set of recurring situations. Duplex scanners produce a
              blank verso page after every odd-length document, and those blank pages need to go before
              you file or send the scan. Cover sheets, fax headers, and internal routing slips get scanned
              in along with the document they&apos;re attached to and rarely belong in the version you actually
              share. And a signed contract or NDA template often needs a stray draft-watermark page or an
              old, superseded signature page pulled out before it goes back out for a fresh signature. The{' '}
              <strong>Odd/Even</strong> shortcuts in the toolbar are built specifically for the blank-verso
              case — a scan where every other page is blank has a very regular pattern that&apos;s tedious to
              click through page-by-page but instant with a bulk toggle.
            </p>
            <p>
              One thing worth knowing before you remove pages: this tool deletes the page objects
              themselves, but it has no idea what&apos;s printed on the pages you keep. If your document has
              &quot;Page 5 of 20&quot; typed into a footer, removing three pages won&apos;t renumber anything — the
              printed footer text on the remaining pages will still say what it said before, just
              mismatched against the new, shorter document. That&apos;s a manual fix in the source file (or a
              job for a full page editor) rather than something a page-removal tool can reasonably know how
              to do.
            </p>
            <p>
              File size is another place expectations can be off. If the pages you remove are mostly text,
              don&apos;t expect a dramatic size drop — text and vector content is small to begin with. But if
              you&apos;re removing high-resolution scanned pages or large embedded images, the savings can be
              substantial, since those pages&apos; image data made up most of the file&apos;s weight in the first
              place. Either way, the pages you keep are copied over untouched — no recompression, no
              quality loss — so the parts of your document that matter are pixel-for-pixel identical to the
              original.
            </p>
            <p>
              If you find yourself wanting to remove pages <em>and</em> shuffle the ones that remain into a
              new order, <Link href="/organize-pdf" className="text-red-600 hover:underline">Organize PDF</Link> does
              both in a single pass instead of making you run two tools back to back. And if the goal is
              really the opposite — keeping only a handful of specific, non-adjacent pages rather than
              deleting a few —{' '}
              <Link href="/extract-pages" className="text-red-600 hover:underline">Extract Pages</Link> flips
              the selection logic to match that.
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
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 border border-line hover:border-red-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-red-600 transition-colors">{tool.name}</p>
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
  { title: 'Upload Your PDF', body: 'Drop your PDF file onto the upload area. Thumbnails of every page are generated instantly in your browser.' },
  { title: 'Select Pages to Remove', body: 'Click any page thumbnail to mark it for deletion — it gets highlighted with a red X. Use the All/None/Odd/Even shortcuts for quick selection.' },
  { title: 'Download Cleaned PDF', body: 'Click Remove Pages and download your PDF with only the pages you kept. No email or signup required.' },
]

const FAQS = [
  { q: 'Can I remove multiple pages at once?', a: 'Yes. Click each page thumbnail to select it, or use the All, Odd, and Even buttons for bulk selection. All selected pages (shown with a red X) will be removed at once.' },
  { q: 'Can I undo a page removal?', a: 'The original PDF is never modified — click "Start Over" to reload the original file. You can also deselect pages by clicking them again before clicking Remove Pages.' },
  { q: 'What happens if I try to remove all pages?', a: 'PDFForge will warn you and prevent the operation. A PDF must have at least one page, so at least one page must remain.' },
  { q: 'Is my PDF safe when I remove pages online?', a: 'Completely safe. All processing runs locally in your browser. Your file is never sent to any server. We have zero access to your documents.' },
  { q: 'Will removing pages affect the remaining page quality?', a: 'No. PDFForge copies the original page data byte-for-byte into the new document — no re-encoding, no quality loss.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'Remove PDF Pages — PDFForge', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Free online tool to remove specific pages from a PDF. No signup, browser-based.', url: 'https://pdfforge.io/remove-pages' },
    { '@type': 'HowTo', name: 'How to Remove Pages from a PDF Online', totalTime: 'PT1M', step: [{ '@type': 'HowToStep', position: 1, name: 'Upload', text: 'Drop your PDF onto the tool.' }, { '@type': 'HowToStep', position: 2, name: 'Select', text: 'Click page thumbnails to mark them for removal.' }, { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Click Remove Pages and download the result.' }] },
  ],
}
