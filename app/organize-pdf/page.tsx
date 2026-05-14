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
      <section className="bg-dark text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1.5 mb-4 text-xs text-violet-300">Client-side · Files stay on your device</div>
          <h1 className="font-syne text-3xl md:text-5xl font-extrabold mb-4 leading-tight">Organize PDF Pages Online</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Reorder and delete pages visually. Drag page thumbnails into the order you want, click × to remove unwanted pages, then save your organized PDF.</p>
        </div>
      </section>
      <OrganizeTool />
      <section className="py-16 px-4 bg-bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark text-center mb-10">How to Organize PDF Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-syne font-extrabold text-violet-500 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-syne font-bold text-dark mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-syne font-bold text-dark mb-2 text-base">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 px-4 bg-bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne text-xl font-extrabold text-dark mb-6 text-center">You Might Also Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 block">
                <p className="font-syne font-bold text-dark group-hover:text-violet-500 transition-colors">{tool.name}</p>
                <p className="text-gray-500 text-sm mt-1">{tool.shortDesc}</p>
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
