import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const OrganizeTool = dynamic(() => import('./OrganizeTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Organize PDF – Reorder & Delete Pages Free Online',
  description:
    'Drag and drop to reorder PDF pages and delete unwanted ones online for free. Preview all pages as thumbnails. No signup — 100% browser-based, private.',
  alternates: { canonical: '/organize-pdf' },
  openGraph: {
    title: 'Organize PDF – Reorder Pages Free Online | PDFForge',
    description: 'Reorder and delete PDF pages visually. Drag thumbnails to rearrange. Free, no signup, browser-based.',
    url: '/organize-pdf', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Organize PDF – Free Online | PDFForge', description: 'Reorder and delete PDF pages. No signup required.' },
}

const RELATED_SLUGS = ['remove-pages', 'split-pdf', 'merge-pdf']

export default function OrganizePdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5 mb-4 text-xs text-violet-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">Organize PDF Pages Online</h1>
          <p className="text-mute text-lg max-w-xl mx-auto">Reorder and delete pages visually. Drag page thumbnails into the order you want, click × to remove unwanted pages, then save your organized PDF.</p>
        </div>
      </section>
      <OrganizeTool />
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Organize PDF Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-violet-600 text-lg">{i + 1}</span>
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
            The Double-Sided Scan Problem (and Other Reasons to Reorder)
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              The single most common reason people land on this tool is a scanning quirk that has nothing
              to do with the PDF itself: scanning a double-sided document on a single-sided scanner. You
              run the fronts through first — pages 1, 3, 5, 7 — flip the stack, and run the backs, which
              come out as 8, 6, 4, 2. The resulting PDF has all the right content but in a sequence no one
              can read. Dragging thumbnails back into 1, 2, 3, 4… order fixes it in under a minute, and
              it&apos;s the kind of fix that&apos;s genuinely painful to do any other way.
            </p>
            <p>
              A second common case is assembling a packet from pieces that were correct individually but
              wrong together — moving a cover page to the front after merging, pulling a table of contents
              back to page one, or shifting a signature page to the end so it&apos;s the last thing a reviewer
              sees. Because reordering and deletion share the same view here, you can also clean out a
              stray blank page or a duplicate scan in the same pass, instead of reordering first and then
              running a separate removal step.
            </p>
            <p>
              A couple of practical notes on how the tool behaves: dragging is genuinely just a visual
              reorder — nothing is re-rendered or re-compressed, so a 40-page reordered PDF saves just as
              fast as a 4-page one. Marking a page for deletion with the × doesn&apos;t remove it immediately;
              it&apos;s held in a &quot;marked&quot; state (shown dimmed) until you click Save, and clicking the same ×
              again restores it, so you can safely experiment before committing. The one hard rule: you
              can&apos;t delete every page — a PDF needs at least one page to exist, and the tool won&apos;t let you
              mark the last remaining page.
            </p>
            <p>
              If all you need is to trim a document down without touching page order,{' '}
              <Link href="/remove-pages" className="text-violet-600 hover:underline">Remove Pages</Link> is
              a more focused tool for that. And if your actual goal is combining several separate PDFs into
              one before you reorder anything, start with{' '}
              <Link href="/merge-pdf" className="text-violet-600 hover:underline">Merge PDF</Link> and
              bring the combined file back here to arrange it.
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
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 border border-line hover:border-violet-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-violet-600 transition-colors">{tool.name}</p>
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
  { title: 'Upload Your PDF', body: 'Drop your PDF onto the upload area. All pages are rendered as thumbnails in your browser — no uploading to any server.' },
  { title: 'Drag to Reorder & Delete', body: 'Drag page thumbnails into your desired order. Hover over a page and click × to mark it for deletion. Click again to restore it.' },
  { title: 'Save Your PDF', body: 'Click Save Organized PDF and download your reordered document. The new page order and any deleted pages are applied.' },
]

const FAQS = [
  { q: 'Can I reorder pages in a PDF for free?', a: 'Yes. Upload your PDF, drag the page thumbnails into the order you want, and click Save. The entire process runs in your browser at no cost, with no signup required.' },
  { q: 'Can I both reorder and delete pages at once?', a: 'Yes. You can drag pages to reorder them and click × on any page to delete it — all in the same session. Only the final arrangement is saved when you click Save.' },
  { q: 'Is there a page limit?', a: 'There is no hard page limit. Very large PDFs (200+ pages) may take a moment to generate thumbnails, but are fully supported. Processing happens in your browser.' },
  { q: 'Will reordering affect PDF quality or file size?', a: 'No. Pages are copied byte-for-byte from the original — no re-encoding, no quality loss. File size will be approximately equal to or smaller than the original.' },
  { q: 'Is my PDF safe to organize online?', a: 'Completely safe. All processing runs locally in your browser using pdf-lib and PDF.js (WebAssembly). Your file is never sent to any server.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'Organize PDF — PDFForge', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Free online PDF organizer. Drag to reorder pages and delete unwanted pages. No signup, browser-based.', url: 'https://pdfforge.io/organize-pdf' },
    { '@type': 'HowTo', name: 'How to Organize PDF Pages Online', totalTime: 'PT1M', step: [{ '@type': 'HowToStep', position: 1, name: 'Upload', text: 'Drop your PDF onto the tool to generate page thumbnails.' }, { '@type': 'HowToStep', position: 2, name: 'Arrange', text: 'Drag thumbnails to reorder. Click × to delete pages.' }, { '@type': 'HowToStep', position: 3, name: 'Save', text: 'Click Save Organized PDF and download.' }] },
  ],
}
