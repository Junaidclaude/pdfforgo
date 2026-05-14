import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const PdfEditorTool = dynamic(() => import('./PdfEditorTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'PDF Editor – Edit PDF Online Free | Add Text, Drawings & Shapes',
  description:
    'Edit PDF files directly in your browser. Add text, freehand drawings, shapes, arrows, highlights, and whiteout boxes. No uploads, 100% private, no signup required.',
  alternates: { canonical: '/pdf-editor' },
  openGraph: {
    title: 'PDF Editor – Edit PDF Free Online | PDFForge',
    description: 'Add text, draw, annotate, and highlight PDFs directly in your browser. Free, private, no signup.',
    url: '/pdf-editor', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'PDF Editor – Free Online | PDFForge', description: 'Edit PDFs with text, shapes, drawings & highlights. No uploads.' },
}

const RELATED_SLUGS = ['watermark-pdf', 'page-numbers', 'rotate-pdf']

export default function PdfEditorPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 rounded-full px-3 py-1.5 mb-4 text-xs text-violet-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
            100% private · Files never leave your browser
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            PDF Editor <span className="text-violet-600">Online Free</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Add text, draw freehand, insert shapes, arrows, highlights, and whiteout boxes. Edit any PDF directly in your browser — no uploads, no signup.
          </p>
        </div>
      </section>

      <PdfEditorTool />

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Edit a PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-violet-600 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">Editor Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-line flex gap-4">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0 text-violet-700 text-lg">{f.icon}</div>
                <div>
                  <h3 className="font-display font-semibold text-ink text-sm mb-1">{f.title}</h3>
                  <p className="text-mute text-xs leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-paper">
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-violet-300 transition-all hover:-translate-y-1 block">
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
  { title: 'Open Your PDF', body: 'Click or drag your PDF file into the editor. The file stays in your browser — nothing is uploaded to any server.' },
  { title: 'Edit & Annotate', body: 'Use the toolbar to add text, draw freehand, insert shapes, arrows, highlights, or whitebox areas over any part of the PDF.' },
  { title: 'Download Edited PDF', body: 'Click "Download PDF" to save your edited file. All annotations are permanently embedded in the output PDF.' },
]

const FEATURES = [
  { icon: 'T', title: 'Add & Edit Text', body: 'Place text anywhere on the page. Choose font, size, color, bold, italic, and underline.' },
  { icon: '✏', title: 'Freehand Drawing', body: 'Draw freely with your mouse or touchpad. Adjust stroke width, color, and opacity.' },
  { icon: '□', title: 'Shapes', body: 'Insert rectangles and ellipses with custom stroke and fill colors.' },
  { icon: '→', title: 'Lines & Arrows', body: 'Draw straight lines and arrows to point out or connect content.' },
  { icon: '▐', title: 'Highlight', body: 'Highlight text or areas with a semi-transparent color overlay.' },
  { icon: '■', title: 'Whiteout / Redact', body: 'Cover sensitive content with a white box to visually redact it from the document.' },
  { icon: '↖', title: 'Select & Move', body: 'Click any annotation to select, reposition, or delete it.' },
  { icon: '🔍', title: 'Zoom In/Out', body: 'Zoom from 50% to 300% for precision work on fine details.' },
  { icon: '📄', title: 'Multi-Page Support', body: 'Navigate all pages via the sidebar. Add annotations to any page independently.' },
]

const FAQS = [
  { q: 'Does this edit the actual PDF text?', a: 'This editor adds annotations on top of the existing PDF content. It does not modify the original text — for that, a full OCR or text-extraction reflow engine is required. To cover text, use the Whiteout tool.' },
  { q: 'Is my PDF uploaded to a server?', a: 'No. Everything runs in your browser using PDF.js (for rendering) and pdf-lib (for export). Your file never leaves your device.' },
  { q: 'Can I edit scanned PDFs?', a: 'Yes — you can add text, shapes, and annotations on top of scanned pages. The underlying content is a raster image, so you cannot edit its text directly.' },
  { q: 'Are annotations saved permanently?', a: 'When you download the PDF, annotations are permanently embedded in the output file using pdf-lib. The original file is not modified.' },
  { q: 'What keyboard shortcuts are available?', a: 'V: Select, T: Text, D: Draw, R: Rectangle, E: Ellipse, L: Line, A: Arrow, H: Highlight, W: Whiteout. Delete/Backspace removes the selected annotation. Escape deselects.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'PDF Editor — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      url: 'https://pdfforge.io/pdf-editor',
    },
    {
      '@type': 'HowTo',
      name: 'How to Edit a PDF Online',
      totalTime: 'PT2M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Open PDF', text: 'Upload your PDF file.' },
        { '@type': 'HowToStep', position: 2, name: 'Annotate', text: 'Add text, shapes, and drawings.' },
        { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download the edited PDF.' },
      ],
    },
  ],
}
