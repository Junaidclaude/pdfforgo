import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { TOOLS } from '@/lib/tools'

const WordToPdfTool = dynamic(() => import('./WordToPdfTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Word to PDF – Convert DOCX to PDF Free Online',
  description:
    'Convert Word documents to PDF online for free. Preserves formatting, fonts, and images. Upload .docx or .doc files up to 4 MB. Powered by CloudConvert. No signup required.',
  alternates: { canonical: '/word-to-pdf' },
  openGraph: {
    title: 'Word to PDF – Convert DOCX Free Online | PDFForge',
    description: 'Convert .docx and .doc files to PDF with perfect formatting. Powered by CloudConvert. Free, no signup.',
    url: '/word-to-pdf', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Word to PDF – Free Online | PDFForge', description: 'Convert Word documents to PDF. No signup required.' },
}

const RELATED_SLUGS = ['pdf-to-word', 'compress-pdf', 'merge-pdf']

export default function WordToPdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 mb-4 text-xs text-blue-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
            Powered by CloudConvert · Secure · Fast
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">Convert Word to PDF Online</h1>
          <p className="text-mute text-lg max-w-xl mx-auto">Upload your .docx or .doc file and get a pixel-perfect PDF back in seconds. Fonts, images, and layout are preserved exactly.</p>
        </div>
      </section>
      <WordToPdfTool />
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Convert Word to PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-blue-600 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
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
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 border border-line hover:border-blue-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-blue-600 transition-colors">{tool.name}</p>
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
  { title: 'Upload Your Word File', body: 'Drop your .docx or .doc file onto the upload area or click to browse. Files up to 4 MB are supported.' },
  { title: 'Wait for Conversion', body: 'CloudConvert processes your document server-side, preserving fonts, images, tables, and all formatting. This usually takes 5–15 seconds.' },
  { title: 'Download Your PDF', body: 'Click Download PDF to save your converted document. It is automatically deleted from CloudConvert servers after download.' },
]

const FAQS = [
  { q: 'Does Word to PDF preserve formatting?', a: 'Yes. CloudConvert uses LibreOffice and Microsoft-compatible conversion, preserving fonts, images, tables, headers, footers, and page layout with high accuracy.' },
  { q: 'What is the maximum Word file size?', a: 'The maximum file size is 4 MB, due to Vercel\'s request body limit on the free plan. For larger files, consider using Microsoft Word or LibreOffice directly.' },
  { q: 'Is my Word document safe to convert online?', a: 'Your file is transmitted securely over HTTPS to CloudConvert for conversion. CloudConvert automatically deletes converted files within 24 hours. PDFForge does not store any copies of your files.' },
  { q: 'Do I need a CloudConvert account?', a: 'No. PDFForge uses CloudConvert\'s API on your behalf. You get 25 free conversions per day without creating an account.' },
  { q: 'Can I convert a .doc file (older Word format)?', a: 'Yes. Both .doc (Word 97–2003) and .docx (modern format) are supported.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'Word to PDF — PDFForge', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Free online Word to PDF converter powered by CloudConvert. No signup required.', url: 'https://pdfforge.io/word-to-pdf' },
    { '@type': 'HowTo', name: 'How to Convert Word to PDF Online', totalTime: 'PT30S', step: [{ '@type': 'HowToStep', position: 1, name: 'Upload', text: 'Drop your .docx or .doc file.' }, { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'CloudConvert processes the file.' }, { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download your PDF.' }] },
  ],
}
