import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const FillPdfFormTool = dynamic(() => import('./FillPdfFormTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Fill PDF Form – Fill Out PDF Forms Online Free',
  description:
    'Fill out PDF forms online for free — text fields, checkboxes, dropdowns, and radio buttons. Runs entirely in your browser. No signup, no upload, no watermarks.',
  alternates: { canonical: '/fill-pdf-form' },
  openGraph: {
    title: 'Fill PDF Form – Fill Out PDF Forms Free | PDFForge',
    description: 'Fill text fields, checkboxes, and dropdowns in any PDF form, 100% browser-based. Free, no signup.',
    url: '/fill-pdf-form',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fill PDF Form – Free Online | PDFForge',
    description: 'Fill out PDF forms in your browser. No signup, no watermarks.',
  },
}

const RELATED_SLUGS = ['sign-pdf', 'pdf-editor', 'protect-pdf']

export default function FillPdfFormPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 mb-4 text-xs text-orange-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-pulse" />
            Runs 100% in your browser · Private · Free
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Fill PDF <span className="text-orange-600">Forms</span> Online
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Type into text fields, tick checkboxes, pick dropdown options, and select radio buttons — then download a filled, print-ready PDF. No account, no upload.
          </p>
        </div>
      </section>

      <FillPdfFormTool />

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Fill a PDF Form</h2>
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
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">Fillable Forms vs. Everything Else</h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              Not every PDF that looks like a form actually is one. A genuine fillable form has real
              <strong> AcroForm fields</strong> baked into the file — the same text boxes, checkboxes, and
              dropdowns you can already click into in Adobe Acrobat or Preview. This tool reads those fields
              directly, lets you type values into a clean list on the side, and writes them back into the
              exact right spot in the PDF.
            </p>
            <p>
              A PDF that&apos;s just an image of a form — a scanned application, for instance — has none of
              that structure; there&apos;s nothing to detect or fill programmatically. For those, the more
              honest approach is placing text manually where it needs to go, which is what{' '}
              <Link href="/pdf-editor" className="text-primary hover:underline">PDF Editor</Link> is built for.
            </p>
            <p>
              Once you&apos;ve filled a form, you get a choice: keep it as an editable form (so it can still
              be opened and adjusted later), or flatten it, which bakes every value permanently into the page
              content. Flattening is the safer default for anything you&apos;re about to print, email, or
              submit — it guarantees the values look identical everywhere, rather than depending on how each
              PDF reader happens to render form fields.
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
  { title: 'Upload your PDF form', body: 'Drop a fillable PDF onto the tool. Nothing is uploaded — it\'s read straight into your browser.' },
  { title: 'Fill in the fields', body: 'Every text field, checkbox, dropdown, and radio button is listed on the side. Fill in what applies.' },
  { title: 'Download the result', body: 'Click Fill & Download to save your completed PDF, with values written directly into the form.' },
]

const FAQS = [
  { q: 'What is a "fillable" PDF form?', a: 'A PDF with real AcroForm fields built in — the text boxes, checkboxes, and dropdowns you can click into directly in Adobe Acrobat or Preview. This tool detects and fills those. A scanned or image-based form has no such fields and can\'t be auto-detected.' },
  { q: 'What does "flatten" mean, and should I use it?', a: 'Flattening bakes your entered values permanently into the page — after flattening, the fields are no longer editable, but the PDF renders identically everywhere. It\'s recommended if you\'re about to print, email, or submit the form. Leave it unchecked if you want to keep editing the values later.' },
  { q: 'Can this add form fields to a PDF that doesn\'t have any?', a: 'No — it only fills fields that already exist in the file. To add text to a PDF without form fields (like a scanned application), use PDF Editor to place text manually wherever it\'s needed.' },
  { q: 'Is my PDF uploaded anywhere?', a: 'No. Your PDF is read and filled entirely in your browser using pdf-lib — it\'s never transmitted anywhere.' },
  { q: 'Why do some fields show a generic name like "Text1" or "Field_23"?', a: 'That\'s the internal field name baked into the PDF by whatever software created the form. Some form creators name fields meaningfully; others leave auto-generated names. There\'s no way to recover better names if the original file doesn\'t have them.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Fill PDF Form — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free online tool to fill out PDF forms entirely in your browser. No signup, no upload required.',
      url: 'https://pdfforge.io/fill-pdf-form',
    },
    {
      '@type': 'HowTo',
      name: 'How to Fill a PDF Form Online',
      totalTime: 'PT1M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload', text: 'Drop a fillable PDF onto the tool.' },
        { '@type': 'HowToStep', position: 2, name: 'Fill', text: 'Enter values for each detected form field.' },
        { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download the completed PDF.' },
      ],
    },
  ],
}
