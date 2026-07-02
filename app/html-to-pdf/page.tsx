import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const HtmlToPdfTool = dynamic(() => import('./HtmlToPdfTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'HTML to PDF – Convert HTML Files to PDF Free Online | PDFForge',
  description:
    'Convert HTML files to PDF right in your browser. Fonts, colors, and layout are rendered as a snapshot of the page. Free, no signup, no watermarks.',
  alternates: { canonical: '/html-to-pdf' },
  openGraph: {
    title: 'HTML to PDF – Free Online Converter | PDFForge',
    description: 'Convert HTML files to PDF, 100% browser-based. Free, no signup.',
    url: '/html-to-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HTML to PDF – Free Online | PDFForge',
    description: 'Convert HTML to PDF right in your browser. Free, no signup.',
  },
}

const RELATED_SLUGS = ['word-to-pdf', 'excel-to-pdf', 'jpg-to-pdf']

export default function HtmlToPdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 mb-4 text-xs text-orange-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
            Runs 100% in your browser · Private · Free
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            HTML to PDF <span className="text-orange-600">Converter</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Convert HTML files to PDF using your own browser to render the page. Most CSS — fonts, colors, flexbox, gradients — comes through in the snapshot.
          </p>
        </div>
      </section>

      <HtmlToPdfTool />

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Convert HTML to PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-orange-600 text-lg">{i + 1}</span>
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
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            Why Page Breaks Land Where They Do
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              This tool is a good fit for turning a self-contained HTML file — an invoice template, a
              saved article, an email design you&apos;re proofing, a flyer or one-pager you built with plain
              CSS — into something you can archive, print, or send without asking the recipient to open
              it in a browser. It&apos;s less of a fit for anything that depends on a live server or that was
              designed with multi-page print layout in mind.
            </p>
            <p>
              The reason comes down to how the conversion actually works. Rather than a dedicated print
              engine that understands page boundaries, this renders your HTML in a hidden container and
              takes a single tall screenshot of the whole thing, then slices that image into A4-height
              strips to build the pages. The slicing happens purely by pixel position — it has no idea
              where a paragraph, table row, or image ends — so a line of text or a table row can land right
              on a page boundary and get visually split between two pages. For a short, single-page
              document this is rarely noticeable; for a long flowed document with many rows, it&apos;s worth
              expecting the occasional awkward break.
            </p>
            <p>
              It&apos;s also worth knowing that the HTML is inserted as static markup, not loaded as a live
              page — so any content that a `&lt;script&gt;` tag would normally generate at runtime (data
              fetched by JavaScript, content rendered by a front-end framework) won&apos;t appear, since script
              tags injected this way don&apos;t execute. If your HTML is a fully rendered export — the kind you&apos;d
              get from &quot;View Source&quot; after the page has already loaded — you&apos;re in good shape.
            </p>
            <p>
              For documents where you need Word-style headers, footers, or guaranteed clean page breaks,
              building the document in{' '}
              <Link href="/word-to-pdf" className="text-orange-600 hover:underline">Word</Link>{' '}
              and converting it is usually more predictable than fighting HTML pagination. And if what
              you&apos;re really trying to do is turn a batch of photos or scanned pages into a PDF rather than
              markup, <Link href="/jpg-to-pdf" className="text-orange-600 hover:underline">JPG to PDF</Link>{' '}
              is the more direct route.
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

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">You Might Also Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 border border-line hover:border-orange-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-orange-600 transition-colors">{tool.name}</p>
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
  { title: 'Upload your HTML file', body: 'Click or drag your .html file into the uploader. Nothing is uploaded — it\'s read straight into your browser.' },
  { title: 'Convert instantly', body: 'Your own browser renders the page and captures it as a snapshot, which is tiled across A4 pages to build the PDF.' },
  { title: 'Download your PDF', body: 'The converted PDF downloads automatically, with the page\'s fonts, colors, and layout embedded as rendered.' },
]

const FAQS = [
  { q: 'What CSS features are supported?', a: 'Most standard CSS renders well — fonts, colors, flexbox, gradients, and box layout. Since this uses a canvas snapshot of the rendered page rather than a true print engine, some advanced effects (backdrop filters, certain CSS transforms, iframes) may not capture perfectly.' },
  { q: 'Can I use @page rules to control paper size?', a: 'No — @page is a print-stylesheet feature meant for browser print dialogs and dedicated print-to-PDF engines, and this tool doesn\'t read it. Output is always tiled to standard A4 pages.' },
  { q: 'Are external fonts and images loaded?', a: 'Images and fonts hosted on servers that allow cross-origin requests (most CDNs and Google Fonts) are typically loaded. Resources on localhost, or blocked by CORS policy, may not appear in the output.' },
  { q: 'What is the file size limit?', a: 'There\'s no server upload cap — conversion runs entirely in your browser, so the practical limit is your device\'s memory. HTML files up to 50 MB are supported.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'HTML to PDF Converter — PDFForge',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free online HTML to PDF converter that runs entirely in your browser. No signup, no upload required.',
  url: 'https://pdfforge.io/html-to-pdf',
}
