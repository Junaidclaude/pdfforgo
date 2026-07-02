import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const ExcelToPdfTool = dynamic(() => import('./ExcelToPdfTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Excel to PDF – Convert XLSX & XLS to PDF Free Online',
  description:
    'Convert Excel spreadsheets (.xlsx, .xls, .csv) to PDF online for free. Preserves formatting, charts, and merged cells. No signup. Runs entirely in your browser.',
  alternates: {
    canonical: '/excel-to-pdf',
  },
  openGraph: {
    title: 'Excel to PDF – Convert XLSX to PDF Free | PDFForge',
    description:
      'Convert Excel .xlsx, .xls, and .csv files to PDF. Formatting, charts, and all sheets preserved. Free, no signup, 100% browser-based.',
    url: '/excel-to-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Excel to PDF – Free Online | PDFForge',
    description:
      'Convert Excel spreadsheets to PDF. XLSX, XLS, CSV supported. No signup required.',
  },
}

const RELATED_SLUGS = ['word-to-pdf', 'pdf-to-word', 'compress-pdf']

export default function ExcelToPdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 mb-4 text-xs text-green-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            XLSX · XLS · CSV · Runs 100% in your browser
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Convert Excel to PDF Online
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Turn any Excel spreadsheet into a shareable, print-ready PDF.
            Formatting, charts, merged cells, and all sheets are faithfully
            preserved in the output.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <ExcelToPdfTool />

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            How to Convert Excel to PDF
          </h2>
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

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            Frequently Asked Questions
          </h2>
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

      {/* ── Related tools ────────────────────────────────── */}
      <section className="py-12 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">
            You Might Also Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 border border-line hover:border-green-300 transition-all hover:-translate-y-1 block"
              >
                <p className="font-display font-bold text-ink group-hover:text-green-600 transition-colors">
                  {tool.name}
                </p>
                <p className="text-mute text-sm mt-1">{tool.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <AdSlot position="footer" />
      </div>
    </>
  )
}

const HOW_TO_STEPS = [
  {
    title: 'Upload Your Spreadsheet',
    body: 'Drag and drop an .xlsx, .xls, or .csv file, or click to browse. Nothing is uploaded — parsing happens right in your browser.',
  },
  {
    title: 'Accurate Conversion',
    body: 'Your spreadsheet is parsed and rendered as a formatted table, preserving cell formatting, column widths, and merged cells, then turned into a PDF locally.',
  },
  {
    title: 'Download the PDF',
    body: 'Your converted PDF is ready in seconds. Download it directly — your file never left your device, so there\'s nothing to clean up on any server.',
  },
]

const FAQS = [
  {
    q: 'Does Excel to PDF preserve formatting, charts, and merged cells?',
    a: 'Cell formatting (fonts, colors, borders) and merged cells are preserved by rendering each sheet as an HTML table before converting to PDF. Native Excel charts are not currently rendered — they won\'t appear in the output PDF.',
  },
  {
    q: 'Are all worksheets included in the PDF?',
    a: 'By default, all visible sheets in the workbook are included in the PDF, each starting on a new page. Hidden sheets are not exported. If you want only specific sheets, hide the others in Excel before uploading.',
  },
  {
    q: 'Can I convert a CSV file to PDF?',
    a: 'Yes. CSV files are fully supported. The data is rendered as a formatted table in the PDF. For complex formatting, convert your CSV to .xlsx in Excel first for more control over the output layout.',
  },
  {
    q: 'What happens to Excel formulas in the PDF?',
    a: 'Formulas are calculated and the resulting values are shown in the PDF — the formula text itself is not visible. The PDF captures the spreadsheet exactly as it appears on screen, not the underlying formula expressions.',
  },
  {
    q: 'What is the maximum file size for Excel to PDF conversion?',
    a: 'There\'s no server upload cap — conversion runs entirely in your browser, so the practical limit is your device\'s memory. Files up to 50 MB are handled comfortably on modern hardware.',
  },
  {
    q: 'Is my spreadsheet data kept private?',
    a: 'Yes. Conversion runs entirely in your browser using JavaScript — your file is never uploaded anywhere, so there\'s nothing to transmit or store on our end.',
  },
  {
    q: 'How many conversions can I do per day?',
    a: 'As many as you like — there\'s no daily limit or quota. Since conversion happens locally in your browser, there\'s no server-side usage to ration.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Excel to PDF Converter — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online Excel to PDF converter. Convert XLSX, XLS, and CSV files to PDF. Formatting preserved. No signup, runs entirely in your browser.',
      url: 'https://pdfforge.io/excel-to-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Convert Excel to PDF Online',
      description: 'Convert an Excel spreadsheet to PDF using PDFForge — free, 100% browser-based.',
      totalTime: 'PT1M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload Excel File', text: 'Drop your .xlsx, .xls, or .csv file onto the upload area or click to browse.' },
        { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'Your browser parses the spreadsheet and renders it as a PDF with formatting intact.' },
        { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download the converted PDF file.' },
      ],
    },
  ],
}
