import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const ConvertImageTool = dynamic(() => import('./ConvertImageTool'), {
  ssr: false,
  loading: () => <div className="max-w-3xl mx-auto px-4 py-10"><div className="h-52 bg-gray-100 rounded-2xl animate-pulse" /></div>,
})

export const metadata: Metadata = {
  title: 'Convert Image – JPG to PNG, WebP & More Free Online',
  description:
    'Convert images between JPG, PNG, and WebP formats. Rotate 90/180/270° and flip horizontally or vertically in the same step. Batch process multiple images. No signup, 100% browser-based.',
  alternates: { canonical: '/convert-image' },
  openGraph: {
    title: 'Convert Image Format – JPG, PNG, WebP Free | PDFForge',
    description: 'Convert JPG to PNG, PNG to WebP, and more. Rotate and flip in the same step. Batch convert multiple images. Free, private, no signup.',
    url: '/convert-image', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Convert Image – Free Online | PDFForge', description: 'Convert JPG/PNG/WebP. Rotate and flip. Batch process. No signup.' },
}

const RELATED_SLUGS = ['compress-image', 'edit-resize-image', 'crop-image']

export default function ConvertImagePage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-full px-3 py-1.5 mb-4 text-xs text-pink-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">Convert, Rotate & Flip Images</h1>
          <p className="text-mute text-lg max-w-xl mx-auto">Convert between JPG, PNG, and WebP. Rotate by any angle and flip horizontally or vertically — all in one step, batch processing supported.</p>
        </div>
      </section>
      <ConvertImageTool />
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Convert & Transform Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center mb-4"><span className="font-display font-bold text-pink-600 text-lg">{i + 1}</span></div>
                <h3 className="font-display font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
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
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 border border-line hover:border-pink-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-pink-600 transition-colors">{tool.name}</p>
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
  { title: 'Choose Transformations', body: 'Select your output format (JPG, PNG, WebP), apply rotation (90°, 180°, 270°), and toggle horizontal or vertical flip. All transforms apply to all uploaded images.' },
  { title: 'Upload Images', body: 'Drop one or multiple image files. Processing happens instantly in your browser — all formats and transforms are applied using the Canvas API.' },
  { title: 'Download Results', body: 'Download each converted image individually or grab all files as a single ZIP archive.' },
]

const FAQS = [
  { q: 'What formats can I convert between?', a: 'You can convert any image to JPG, PNG, or WebP. JPG is best for photos (small size, slightly lossy). PNG is lossless and best for graphics with sharp edges or transparency. WebP offers the best compression with modern browser support.' },
  { q: 'Does converting JPG to PNG make it lossless?', a: 'Yes — converting JPG to PNG creates a lossless copy of the current pixel data. However, any compression artifacts from the original JPG encoding are already baked into the pixels and cannot be reversed.' },
  { q: 'Can I rotate and convert at the same time?', a: 'Yes. All transformations — format conversion, rotation, and flip — are applied in a single pass. Upload your images, set all your transformations, and download the results.' },
  { q: 'Does rotation change the image dimensions?', a: 'Yes. Rotating by 90° or 270° swaps the width and height of the image — a 1200×800 image becomes 800×1200 after a 90° rotation. Rotating 180° keeps the same dimensions.' },
  { q: 'What is the difference between Flip Horizontal and Flip Vertical?', a: 'Flip Horizontal mirrors the image left-to-right (like looking in a mirror). Flip Vertical mirrors it top-to-bottom (like turning it upside down). Both can be combined with rotation.' },
  { q: 'Are my images uploaded to a server?', a: 'No. All processing uses the browser Canvas API. Your files never leave your device.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'Image Converter — PDFForge', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url: 'https://pdfforge.io/convert-image' },
    { '@type': 'HowTo', name: 'How to Convert Image Format Online', totalTime: 'PT1M', step: [
      { '@type': 'HowToStep', position: 1, name: 'Choose format & transforms', text: 'Select output format, rotation, and flip settings.' },
      { '@type': 'HowToStep', position: 2, name: 'Upload images', text: 'Drop your image files onto the upload area.' },
      { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download converted images or ZIP.' },
    ]},
  ],
}
