import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const WatermarkTool = dynamic(() => import('./WatermarkTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Watermark PDF – Add Text Watermark Free Online',
  description:
    'Add a custom text watermark to your PDF online for free. Choose text, color, opacity, position, and rotation. Apply to all or specific pages. No signup — 100% browser-based.',
  alternates: { canonical: '/watermark-pdf' },
  openGraph: {
    title: 'Watermark PDF – Add Text Watermark Free Online | PDFForge',
    description: 'Add custom text watermarks to PDF pages. Control color, opacity, size, rotation, and position. Free, no signup, browser-based.',
    url: '/watermark-pdf', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watermark PDF – Free Online | PDFForge',
    description: 'Add custom text watermarks to any PDF. Full control over style and position.',
  },
}

const RELATED_SLUGS = ['protect-pdf', 'compress-pdf', 'rotate-pdf']

export default function WatermarkPdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-3 py-1.5 mb-4 text-xs text-cyan-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">Watermark PDF Online</h1>
          <p className="text-mute text-lg max-w-xl mx-auto">Add a custom text watermark to your PDF — CONFIDENTIAL, DRAFT, your company name. Control the color, opacity, position, and rotation.</p>
        </div>
      </section>
      <WatermarkTool />
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Add a Watermark to a PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-cyan-600 text-lg">{i + 1}</span>
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
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">A Watermark Marks Intent — It Doesn&apos;t Enforce It</h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              Text watermarks are drawn directly onto each page&apos;s content, the same way any other text
              on the page is rendered. That means once you download the watermarked file, the label is a
              genuine part of the document, not a floating overlay that a viewer can toggle off. It&apos;s the
              right tool for the job it&apos;s actually meant for: marking a document as a draft so nobody
              treats it as final, stamping CONFIDENTIAL on internal material before it&apos;s emailed around, or
              putting a company name across a preview PDF you&apos;re sending to a client before the paid
              version. What it isn&apos;t is a security feature — anyone with a capable PDF editor can select
              that text and delete it, or paint over it, the same way you added it in the first place. If
              you actually need to control who can open, print, or copy from a file, that&apos;s a job for{' '}
              <Link href="/protect-pdf" className="text-cyan-600 hover:underline">Protect PDF</Link>,
              which applies real password-based restrictions rather than a visible label.
            </p>
            <p>
              Opacity and position aren&apos;t just cosmetic choices — they trade off visibility against how
              easy the watermark is to work around. A large, centered watermark at 30–40% opacity and a
              diagonal rotation (the default -45° here mimics the classic &quot;CONFIDENTIAL&quot; stamp look) sits
              across the actual content of the page, so cropping or selectively copying around it is
              genuinely inconvenient. A small watermark tucked in a corner at low opacity is subtler and
              looks more like professional branding, but it&apos;s also trivial to crop out of a single page or
              screenshot. If the goal is deterring casual redistribution, favor the centered, higher-opacity
              option; if the goal is just attribution or a light branding touch, a corner mark is enough.
            </p>
            <p>
              The &quot;Apply To&quot; custom range is worth using deliberately rather than defaulting to every
              page. A DRAFT stamp usually belongs on every page of a working document, but a confidentiality
              notice sometimes only needs to appear on the pages that actually contain sensitive figures,
              leaving a clean cover page or signature page untouched. Since scanned pages tend to be the
              largest contributor to file size in a mixed document, if you&apos;re watermarking a scan-heavy PDF
              and the output feels larger than expected, run it through{' '}
              <Link href="/compress-pdf" className="text-cyan-600 hover:underline">Compress PDF</Link>{' '}
              afterward — the watermark text itself adds only a negligible amount of data.
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
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 border border-line hover:border-cyan-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-cyan-600 transition-colors">{tool.name}</p>
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
  { title: 'Upload Your PDF', body: 'Drop your PDF onto the upload area or click to browse. The file is processed entirely in your browser.' },
  { title: 'Customize Your Watermark', body: 'Type your watermark text, pick a color and opacity, set the font size, rotation, and position using the sidebar controls. A live preview shows how it will look.' },
  { title: 'Download Watermarked PDF', body: 'Click Add Watermark and download your PDF instantly. No email or signup required.' },
]

const FAQS = [
  { q: 'Can I add a watermark to specific pages only?', a: 'Yes. Under "Apply To" in the sidebar, choose Custom and enter page numbers or ranges, e.g. "1, 3, 5-8". Only those pages will receive the watermark.' },
  { q: 'Can I remove a watermark added with PDFForge?', a: 'Watermarks added by PDFForge are embedded in the page content as a text element. They can be removed with advanced PDF editing tools, but are not easily removable by casual users.' },
  { q: 'What text can I use as a watermark?', a: 'Any text up to 60 characters — CONFIDENTIAL, DRAFT, your company name, a copyright notice, or any custom message.' },
  { q: 'Can I control the watermark transparency?', a: 'Yes. The Opacity slider in the sidebar lets you set transparency from 5% (nearly invisible) to 100% (fully opaque). Most professional watermarks use 20–40% opacity.' },
  { q: 'Will adding a watermark affect PDF quality?', a: 'No. The watermark is added as a text layer in the PDF — it does not re-encode images or degrade existing content quality.' },
  { q: 'Is my PDF safe to watermark online with PDFForge?', a: 'Completely safe. All processing runs locally in your browser using pdf-lib (WebAssembly). Your file is never sent to any server.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'Watermark PDF — PDFForge', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Free online PDF watermark tool. Add custom text watermarks with full styling control. No signup, browser-based.', url: 'https://pdfforge.io/watermark-pdf' },
    { '@type': 'HowTo', name: 'How to Add a Watermark to a PDF Online', totalTime: 'PT30S', step: [{ '@type': 'HowToStep', position: 1, name: 'Upload PDF', text: 'Drop your PDF onto the upload area.' }, { '@type': 'HowToStep', position: 2, name: 'Set Watermark', text: 'Enter your text, choose color, opacity, and position.' }, { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Click Add Watermark and download your PDF.' }] },
  ],
}
