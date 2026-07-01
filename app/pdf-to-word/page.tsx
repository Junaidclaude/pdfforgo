import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { TOOLS } from '@/lib/tools'

const PdfToWordTool = dynamic(() => import('./PdfToWordTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'PDF to Word – Convert PDF to DOCX Free Online',
  description:
    'Convert PDF to editable Word documents (.docx) online for free. Preserves text, images, and formatting. Upload PDFs up to 4 MB. Powered by CloudConvert. No signup required.',
  alternates: { canonical: '/pdf-to-word' },
  openGraph: {
    title: 'PDF to Word – Convert PDF to DOCX Free Online | PDFForge',
    description: 'Convert PDF files to editable Word documents. Preserves formatting. Powered by CloudConvert. Free, no signup.',
    url: '/pdf-to-word', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'PDF to Word – Free Online | PDFForge', description: 'Convert PDF to editable Word DOCX. No signup required.' },
}

const RELATED_SLUGS = ['word-to-pdf', 'compress-pdf', 'split-pdf']

export default function PdfToWordPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 mb-4 text-xs text-green-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            Powered by CloudConvert · Secure · Fast
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">Convert PDF to Word Online</h1>
          <p className="text-mute text-lg max-w-xl mx-auto">Turn any PDF into an editable Word document (.docx). Text, images, tables, and layout are preserved as accurately as possible.</p>
        </div>
      </section>
      <PdfToWordTool />
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Convert PDF to Word</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-green-600 text-lg">{i + 1}</span>
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
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">What &quot;Editable&quot; Actually Means Here</h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              PDF was designed to look the same everywhere, not to be edited — it stores text as
              positioned glyphs on a page rather than as flowing paragraphs. Converting to Word means
              reconstructing that structure: figuring out which glyphs form a paragraph, where a table
              starts and ends, and which image is a logo versus a photo. That reconstruction is never
              perfect for every document, which is why results vary by source file.
            </p>
            <p>
              The conversion works best on PDFs that were originally created from a word processor —
              contracts, reports, resumes exported from Word or Google Docs. Complex multi-column layouts,
              PDFs built from design software (magazines, brochures), and scanned documents are the harder
              cases: scans in particular contain no real text at all, just a picture of text, so they need
              OCR (optical character recognition) rather than a straight structural conversion.
            </p>
            <p>
              If your result looks close but not perfect, it&apos;s usually faster to fix spacing/formatting
              directly in Word than to keep re-converting — small inconsistencies in font substitution or
              table borders are normal and quick to clean up by hand. For the reverse direction, or if you
              just need to add annotations rather than fully re-edit the text,{' '}
              <Link href="/pdf-editor" className="text-primary hover:underline">PDF Editor</Link> lets you
              mark up the original PDF directly without converting it at all.
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
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 border border-line hover:border-green-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-green-600 transition-colors">{tool.name}</p>
                <p className="text-mute text-sm mt-1">{tool.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

const HOW_TO_STEPS = [
  { title: 'Upload Your PDF', body: 'Drop your PDF onto the upload area or click to browse. Files up to 4 MB are supported.' },
  { title: 'Wait for Conversion', body: 'CloudConvert extracts text, images, and layout from your PDF and converts it to a .docx file. This takes 10–20 seconds.' },
  { title: 'Download Your Word File', body: 'Click Download Word File to save your .docx. You can then edit it in Microsoft Word, Google Docs, or LibreOffice.' },
]

const FAQS = [
  { q: 'How accurate is PDF to Word conversion?', a: 'Accuracy depends on the PDF type. Text-based PDFs (created by Word, Excel, etc.) convert very accurately. Scanned PDFs may require OCR and will convert with lower accuracy. Tables and complex layouts may need minor adjustments after conversion.' },
  { q: 'Can I convert a scanned PDF to Word?', a: 'Yes, but the result depends on CloudConvert\'s OCR capability. Scanned PDFs are images of text, not actual text, so the accuracy is lower than with digital PDFs. For best results, use a high-resolution scan.' },
  { q: 'Is my PDF safe when converting to Word?', a: 'Your file is transmitted securely over HTTPS to CloudConvert. CloudConvert automatically deletes files within 24 hours. PDFForge does not store any copies of your files.' },
  { q: 'What is the maximum PDF size for conversion?', a: 'The maximum file size is 4 MB, due to Vercel\'s request body limit on the free plan. For larger files, consider using Adobe Acrobat or a desktop converter.' },
  { q: 'Will the converted Word file preserve fonts?', a: 'Common fonts are preserved. Unusual or embedded fonts may be substituted with similar alternatives. Overall formatting including margins, headings, and paragraph spacing is maintained.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'PDF to Word — PDFForge', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Free online PDF to Word converter powered by CloudConvert. No signup required.', url: 'https://pdfforge.io/pdf-to-word' },
    { '@type': 'HowTo', name: 'How to Convert PDF to Word Online', totalTime: 'PT30S', step: [{ '@type': 'HowToStep', position: 1, name: 'Upload', text: 'Drop your PDF onto the tool.' }, { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'CloudConvert processes the file.' }, { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download your .docx Word file.' }] },
  ],
}
