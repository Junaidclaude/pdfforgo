import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const OcrPdfTool = dynamic(() => import('./OcrPdfTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'OCR PDF – Extract Text from Scanned PDFs Free Online',
  description:
    'Extract text from scanned PDFs and images using OCR, right in your browser. Copy the text, download a .txt file, or get a searchable PDF. Free, no signup, no upload.',
  alternates: { canonical: '/ocr-pdf' },
  openGraph: {
    title: 'OCR PDF – Extract Text from Scanned PDFs | PDFForge',
    description: 'Run OCR on scanned PDFs entirely in your browser. Free, private, no signup.',
    url: '/ocr-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OCR PDF – Free Online | PDFForge',
    description: 'Extract text from scanned PDFs with OCR. Runs in your browser. No signup.',
  },
}

const RELATED_SLUGS = ['pdf-to-word', 'pdf-editor', 'compress-pdf']

export default function OcrPdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5 mb-4 text-xs text-indigo-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block animate-pulse" />
            Runs 100% in your browser · Private · Free
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            OCR PDF <span className="text-indigo-600">Text Extractor</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Pull real, selectable text out of scanned PDFs and image-based documents. Copy it, save it as a .txt file, or get back a searchable PDF — no upload, no signup.
          </p>
        </div>
      </section>

      <OcrPdfTool />

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to OCR a PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-indigo-600 text-lg">{i + 1}</span>
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
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">Why a PDF Needs OCR At All</h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              A PDF created by scanning a paper document — or exporting a photo of a page — contains no
              real text at all. It&apos;s a picture, the same as a JPG, with the shapes of letters baked
              into pixels rather than stored as characters. You can&apos;t select it, search it, or copy
              it, because as far as the file format is concerned, there&apos;s nothing there but an image.
            </p>
            <p>
              OCR (optical character recognition) is what bridges that gap: it looks at each page, detects
              where letters and words are, and works out what they most likely say. This tool runs that
              process using Tesseract.js — a WebAssembly build of the open-source Tesseract OCR engine —
              directly in your browser, rendering each page to a canvas at a higher resolution than screen
              display for better accuracy, then recognizing text line by line.
            </p>
            <p>
              Once recognized, you get three ways to use the result: copy the plain text straight out,
              download it as a .txt file, or download a <strong>searchable PDF</strong> — your original
              scan with an invisible text layer placed over it, so the pages look exactly the same but can
              now be searched, selected, and copied like any normal PDF.
            </p>
            <p>
              Accuracy depends heavily on scan quality. Clean, upright, high-contrast scans of printed text
              in English work best. Skewed pages, low resolution, handwriting, and unusual fonts will all
              reduce accuracy — if a result looks off, a higher-resolution re-scan usually helps more than
              anything else. If you need to edit the recognized text directly on top of the original PDF
              rather than export it, <Link href="/pdf-editor" className="text-primary hover:underline">PDF Editor</Link>&apos;s
              Extract Text tool runs the same OCR engine and places each line as an editable annotation.
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-indigo-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-indigo-600 transition-colors">{tool.name}</p>
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
  { title: 'Upload your scanned PDF', body: 'Drop your PDF onto the tool or click to browse. Nothing is uploaded — it\'s read straight into your browser.' },
  { title: 'OCR runs automatically', body: 'Each page is rendered and scanned for text using Tesseract.js. A progress bar shows which page is being read.' },
  { title: 'Copy, save, or export', body: 'Copy the extracted text, download it as .txt, or download a searchable version of your original PDF.' },
]

const FAQS = [
  { q: 'What is a "searchable PDF"?', a: 'It\'s your original scanned PDF with an invisible layer of the recognized text placed on top, aligned to where that text appears. The pages look identical, but you can now select, search (Ctrl+F), and copy text from them — something a plain scan can\'t do.' },
  { q: 'Does this work on photos of documents, not just scans?', a: 'It works on any PDF where the pages are effectively images — whether that came from a flatbed scanner or a PDF built from photos. Straight, well-lit, high-resolution shots give the best results.' },
  { q: 'Which languages are supported?', a: 'This tool currently recognizes English text. Non-English or mixed-language documents may produce inaccurate results.' },
  { q: 'Can it read handwriting?', a: 'No. Like virtually all OCR engines, this is built for printed/typed text. Handwriting recognition is a fundamentally different, much harder problem and isn\'t supported.' },
  { q: 'Is my file uploaded anywhere?', a: 'No. OCR runs entirely in your browser using Tesseract.js (a WebAssembly build of the Tesseract engine) — your PDF is never transmitted anywhere.' },
  { q: 'Why is it slow on some PDFs?', a: 'OCR is computationally heavy, and it runs on your device rather than a server, so processing time scales with page count and your device\'s speed. Large multi-page scans can take a minute or more — the progress bar shows which page is currently being read.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'OCR PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free online OCR tool that extracts text from scanned PDFs entirely in your browser. No signup, no upload required.',
      url: 'https://pdfforge.io/ocr-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to OCR a Scanned PDF Online',
      totalTime: 'PT1M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload', text: 'Drop your scanned PDF onto the tool.' },
        { '@type': 'HowToStep', position: 2, name: 'OCR', text: 'Your browser recognizes text on each page automatically.' },
        { '@type': 'HowToStep', position: 3, name: 'Export', text: 'Copy the text, download a .txt file, or download a searchable PDF.' },
      ],
    },
  ],
}
