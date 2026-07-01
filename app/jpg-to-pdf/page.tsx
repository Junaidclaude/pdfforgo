import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const JpgToPdfTool = dynamic(() => import('./JpgToPdfTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'JPG to PDF – Free Online Converter',
  description:
    'Convert JPG, PNG, and other images to PDF online for free. Combine multiple images into one PDF. Choose page size, orientation, and margins. No signup — 100% browser-based.',
  alternates: {
    canonical: '/jpg-to-pdf',
  },
  openGraph: {
    title: 'JPG to PDF – Convert Images to PDF Free Online | PDFForge',
    description:
      'Convert JPG, PNG, WebP and other images to a PDF document. Combine multiple images into one PDF. Choose A4, Letter, or fit-to-image. Free, no signup.',
    url: '/jpg-to-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JPG to PDF – Free Online | PDFForge',
    description:
      'Convert images to PDF. Combine multiple JPGs into one document. No signup required.',
  },
}

const RELATED_SLUGS = ['pdf-to-jpg', 'merge-pdf', 'compress-pdf']

export default function JpgToPdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))

  return (
    <>
      {/* ── Structured data ──────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5 mb-4 text-xs text-indigo-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Convert JPG to PDF Online
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Turn one or more images into a PDF document in seconds. Upload your
            JPGs, PNGs, or other images, set the page options, and download your
            PDF.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <JpgToPdfTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            How to Convert JPG to PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-indigo-600 text-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-mute text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guide ─────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            Turning a Pile of Photos Into One Document
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              The single most common reason people land here is a phone camera: a stack of photos of a
              multi-page form, receipt, or handwritten document, taken one page at a time, that now needs to
              become a single file to email, upload to a portal, or print. Email attachments and most upload
              forms expect one file, not eight separate JPGs — converting to a single PDF is what actually
              solves the problem, not just changing the format.
            </p>
            <p>
              <strong>Order matters more than people expect.</strong> Once combined, the page order in the
              PDF is exactly the order you arranged the images in — there&apos;s no automatic detection of
              which photo is &quot;page 1.&quot; If you photographed pages out of sequence (which happens
              constantly with multi-page forms), fix the order before converting rather than after; it&apos;s
              much easier to drag-reorder thumbnails than to fix page order inside a PDF afterward.
            </p>
            <p>
              <strong>Photo quality carries straight through.</strong> A blurry, poorly-lit, or crooked photo
              becomes a blurry, poorly-lit, crooked PDF page — conversion doesn&apos;t fix or enhance the
              source image. If a page needs to be legible for someone else (a signed contract, a form for an
              official process), it&apos;s worth a few seconds to retake a photo that&apos;s genuinely
              readable rather than converting a marginal one and hoping it&apos;s good enough. Even, direct
              overhead lighting without a shadow across the page is the single biggest factor in a phone
              photo actually looking like a scan.
            </p>
            <p>
              Mixed image sizes and orientations are completely fine to combine — a portrait phone photo and
              a landscape screenshot can sit in the same PDF as different-sized pages, the same way a{' '}
              <Link href="/merge-pdf" className="text-primary hover:underline">merged PDF</Link> can mix
              page sizes. You don&apos;t need to crop or resize images to match before combining them.
            </p>
            <p>
              If the resulting PDF ends up larger than expected — a batch of full-resolution phone photos
              adds up fast — run it through{' '}
              <Link href="/compress-pdf" className="text-primary hover:underline">Compress PDF</Link>{' '}
              afterward rather than downscaling each photo individually first; it&apos;s faster and gives you
              a size/quality tradeoff to tune in one place instead of guessing per image.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <h3 className="font-display font-bold text-ink mb-2 text-base">
                  {faq.q}
                </h3>
                <p className="text-mute text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related tools ─────────────────────────────────── */}
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-indigo-300 transition-all hover:-translate-y-1 block"
              >
                <p className="font-display font-bold text-ink group-hover:text-indigo-600 transition-colors">
                  {tool.name}
                </p>
                <p className="text-mute text-sm mt-1">{tool.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AD_SLOT: footer_banner */}
      <div className="max-w-6xl mx-auto px-4">
        <AdSlot position="footer" />
      </div>
    </>
  )
}

// ── Static data ────────────────────────────────────────────────────────────

const HOW_TO_STEPS = [
  {
    title: 'Upload Your Images',
    body: 'Click the upload area or drag and drop one or more images — JPG, PNG, WebP, GIF, or BMP. Add images in batches; they all appear in the list.',
  },
  {
    title: 'Set Page Options',
    body: 'Choose page size (Fit Image, A4, or Letter), orientation, and margin. Drag images in the grid to set the order they appear in the PDF.',
  },
  {
    title: 'Download Your PDF',
    body: 'Click Convert to PDF and download your document instantly. All images become pages in a single PDF file — no email or signup required.',
  },
]

const FAQS = [
  {
    q: 'How do I convert multiple JPGs to one PDF?',
    a: 'Upload all your JPG files at once (or in batches using the "+ Add more images" area). Drag them into the order you want, then click Convert to PDF. All images are combined into a single multi-page PDF.',
  },
  {
    q: 'What image formats can I convert to PDF?',
    a: 'PDFForge supports JPG/JPEG, PNG, WebP, GIF, and BMP. You can mix different formats in the same PDF — for example, combine a PNG screenshot with several JPG photos.',
  },
  {
    q: 'What page size should I choose?',
    a: '"Fit Image" creates a page that matches each image\'s exact dimensions — ideal for photos and screenshots. A4 is the international standard (used in most countries for documents). Letter (8.5×11 inches) is the US standard. Images are scaled to fit within the chosen page size while preserving their aspect ratio.',
  },
  {
    q: 'Can I change the order of images in the PDF?',
    a: 'Yes. After uploading, drag the image thumbnails in the grid to reorder them. The order in the grid is the order they will appear as pages in the PDF.',
  },
  {
    q: 'Does converting JPG to PDF reduce image quality?',
    a: 'No. PDFForge embeds your original image data directly into the PDF — there is no re-encoding or quality loss. The PDF will display the images at their original resolution.',
  },
  {
    q: 'Is it safe to convert images to PDF online with PDFForge?',
    a: 'Completely safe. All processing runs locally in your browser using WebAssembly (pdf-lib). Your images are never uploaded to any server. We have zero access to your files.',
  },
  {
    q: 'Can I convert a PNG with a transparent background to PDF?',
    a: 'Yes. PNG files with transparency are supported. Since PDF pages have a white background by default, transparent areas will appear white in the PDF output.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'JPG to PDF Converter — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online JPG to PDF converter. Convert one or multiple images to a PDF document. No signup, browser-based.',
      url: 'https://pdfforge.io/jpg-to-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Convert JPG to PDF Online',
      description:
        'Turn images into a PDF document using PDFForge — free, private, no signup.',
      totalTime: 'PT30S',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload Images',
          text: 'Drop your JPG, PNG, or other images onto the upload area or click to browse.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Set Options',
          text: 'Choose page size, orientation, and margin. Reorder images by dragging.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download PDF',
          text: 'Click Convert to PDF and download your combined document.',
        },
      ],
    },
  ],
}
