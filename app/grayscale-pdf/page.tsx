import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const GrayscaleTool = dynamic(() => import('./GrayscaleTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Grayscale PDF – Convert PDF to Black & White Free Online',
  description:
    'Convert a color PDF to grayscale (black and white) online for free. Reduces file size by up to 60%. No signup, 100% browser-based — your file never leaves your device.',
  alternates: {
    canonical: '/grayscale-pdf',
  },
  openGraph: {
    title: 'Grayscale PDF – Convert to Black & White Free | PDFForge',
    description:
      'Turn any color PDF into a grayscale document. Reduces file size significantly. Free, private, no signup — runs entirely in your browser.',
    url: '/grayscale-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grayscale PDF – Free Online | PDFForge',
    description:
      'Convert color PDFs to black and white. Smaller file size, great for printing. No signup required.',
  },
}

const RELATED_SLUGS = ['compress-pdf', 'pdf-to-jpg', 'pdf-to-png']

export default function GrayscalePdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-dark text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-500/10 border border-gray-500/20 rounded-full px-3 py-1.5 mb-4 text-xs text-gray-300">
            Client-side · Files stay on your device
          </div>
          <h1 className="font-syne text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Convert PDF to Grayscale
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Remove all color from your PDF and convert it to black and white.
            Perfect for printing, archiving, and reducing file size.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <GrayscaleTool />

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-16 px-4 bg-bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark text-center mb-10">
            How to Convert PDF to Grayscale
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-syne font-extrabold text-gray-600 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-syne font-bold text-dark mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark text-center mb-10">
            Frequently Asked Questions
          </h2>
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

      {/* ── Related tools ────────────────────────────────── */}
      <section className="py-12 px-4 bg-bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne text-xl font-extrabold text-dark mb-6 text-center">
            You Might Also Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 block"
              >
                <p className="font-syne font-bold text-dark group-hover:text-gray-600 transition-colors">
                  {tool.name}
                </p>
                <p className="text-gray-500 text-sm mt-1">{tool.shortDesc}</p>
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
    title: 'Upload Your PDF',
    body: 'Drag and drop your color PDF or click to browse. All processing happens locally in your browser — your file never reaches any server.',
  },
  {
    title: 'Automatic Conversion',
    body: 'Each page is rendered and converted to grayscale using a luminance-weighted formula (ITU-R BT.601) that produces natural-looking black and white output.',
  },
  {
    title: 'Download Grayscale PDF',
    body: 'Once complete, download your new grayscale PDF. Color PDFs typically shrink 30–60% in file size after conversion.',
  },
]

const FAQS = [
  {
    q: 'Why convert a PDF to grayscale?',
    a: 'Grayscale PDFs are significantly smaller in file size, cheaper to print (no color ink), and required by some document submission systems that do not accept color files. They are also useful for accessibility compliance and archiving.',
  },
  {
    q: 'How much smaller will the grayscale PDF be?',
    a: 'It depends on the original content. PDFs with lots of color images typically shrink 30–60%. PDFs that are mostly text and already use little color may see minimal size reduction.',
  },
  {
    q: 'Does grayscale conversion preserve text as selectable/searchable?',
    a: 'No. This tool renders each page as a high-resolution image, so the resulting PDF is image-based. Text will no longer be selectable or searchable after conversion. If you need to preserve searchable text, a desktop PDF editor is recommended.',
  },
  {
    q: 'What DPI is used during grayscale conversion?',
    a: 'Pages are rendered at 144 DPI (2× PDF point scale) before grayscale conversion, which produces clean, sharp output suitable for printing and screen viewing.',
  },
  {
    q: 'Is the grayscale formula accurate?',
    a: 'Yes. PDFForge uses the ITU-R BT.601 luminance formula: Gray = 0.299×R + 0.587×G + 0.114×B. This weights each color channel according to how the human eye perceives brightness, producing more natural results than a simple average.',
  },
  {
    q: 'Can I convert a password-protected PDF to grayscale?',
    a: 'You need to remove the password first. Use our Unlock PDF tool, then come back to convert to grayscale.',
  },
  {
    q: 'Is my PDF file uploaded to a server?',
    a: 'No. Everything runs in your browser via WebAssembly (pdfjs-dist + pdf-lib). Your file is never sent to PDFForge or any third party.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Grayscale PDF Converter — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online tool to convert color PDF to grayscale. Reduces file size. No signup, browser-based, private.',
      url: 'https://pdfforge.io/grayscale-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Convert PDF to Grayscale Online',
      description: 'Convert a color PDF to black and white using PDFForge — free, private, no signup.',
      totalTime: 'PT1M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload PDF', text: 'Drop your color PDF onto the upload area or click to browse.' },
        { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'The tool automatically renders and converts each page to grayscale.' },
        { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download the grayscale PDF when conversion is complete.' },
      ],
    },
  ],
}
