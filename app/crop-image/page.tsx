import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const CropImageTool = dynamic(() => import('./CropImageTool'), {
  ssr: false,
  loading: () => <div className="max-w-4xl mx-auto px-4 py-10"><div className="h-72 bg-gray-100 rounded-2xl animate-pulse" /></div>,
})

export const metadata: Metadata = {
  title: 'Crop Image – Crop Photos Online Free',
  description:
    'Crop images online for free with an interactive drag selection. Choose freeform or fixed aspect ratios (1:1, 16:9, 4:3). No signup, 100% browser-based.',
  alternates: { canonical: '/crop-image' },
  openGraph: {
    title: 'Crop Image – Free Online Photo Cropper | PDFForge',
    description: 'Crop photos with a drag-and-resize selection box. Fixed aspect ratios (1:1, 16:9, 4:3) or freeform. Free, private, no signup.',
    url: '/crop-image', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Crop Image – Free Online | PDFForge', description: 'Crop photos with drag selection. Aspect ratio presets. No signup.' },
}

const RELATED_SLUGS = ['edit-resize-image', 'compress-image', 'convert-image']

export default function CropImagePage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 mb-4 text-xs text-orange-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">Crop Images Online</h1>
          <p className="text-mute text-lg max-w-xl mx-auto">Draw a selection on your image to crop it. Drag and resize the box freely or lock to a preset aspect ratio. Rule of thirds guides included.</p>
        </div>
      </section>
      <CropImageTool />
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Crop an Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4"><span className="font-display font-bold text-orange-600 text-lg">{i + 1}</span></div>
                <h3 className="font-display font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            Picking the Right Crop Ratio for Where the Image Is Going
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              Most cropping needs come down to matching whatever container the image is about to sit in.
              A profile photo almost always wants 1:1 so it doesn&apos;t get stretched or off-center inside a
              circular avatar frame. A story or reel wants 9:16, a normal feed post is closer to 4:5 or
              1:1, and a banner or cover photo wants something wide like 16:9 or 3:2. Using the matching
              preset instead of eyeballing a freeform crop means the platform won&apos;t re-crop your image
              again on its own terms after you upload it.
            </p>
            <p>
              Freeform cropping is the better choice when the goal isn&apos;t a standard shape but a specific
              framing decision — isolating a product from a busy background, tightening a group photo
              around the people who matter, or cutting a screenshot down to just the relevant panel. The
              rule-of-thirds grid overlaid on the selection is there for exactly this case: placing your
              subject near one of the four intersection points rather than dead center tends to produce a
              more balanced composition, a habit borrowed straight from photography.
            </p>
            <p>
              One thing worth knowing about output quality: the crop itself is lossless — it reads pixel
              data directly from the source at full resolution with no scaling or re-sampling involved. Any
              quality loss you might see comes only from the output format you choose afterward: PNG stays
              fully lossless, while JPG re-encodes the cropped result at a high (but not perfect) quality
              setting. If you&apos;re archiving the crop or plan to edit it further, PNG avoids that extra
              generation of compression.
            </p>
            <p>
              If you need the cropped result at an exact pixel size afterward — say, a square crop that
              also needs to be precisely 800×800 — follow up with{' '}
              <Link href="/edit-resize-image" className="text-orange-600 hover:underline">Resize Image</Link>.
              And if the platform you&apos;re uploading to needs a specific file type rather than just a shape,{' '}
              <Link href="/convert-image" className="text-orange-600 hover:underline">Convert Image</Link>{' '}
              handles that in a separate pass.
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
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 border border-line hover:border-orange-300 transition-all hover:-translate-y-1 block">
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
  { title: 'Upload Your Image', body: 'Drop a JPG, PNG, or WebP image onto the upload area. The image is displayed at full size with the crop selection initialized to the entire image.' },
  { title: 'Draw Your Crop', body: 'Click and drag on the image to define a new crop area. Drag the box to move it, or drag the 8 handles to resize it. Select an aspect ratio preset to constrain the shape.' },
  { title: 'Download Cropped Image', body: 'Click "Crop Image" to apply the selection. Choose your output format (JPG, PNG, WebP) and download the cropped result.' },
]

const FAQS = [
  { q: 'Can I crop to an exact pixel size?', a: 'The tool shows the current selection size in pixels (width × height) in real time as you drag. You can adjust the handles to match exact dimensions. For pixel-perfect crops, use the resize tool after cropping.' },
  { q: 'What aspect ratio presets are available?', a: 'Free (any shape), 1:1 (square, perfect for profile photos), 4:3 (standard photo/screen), 16:9 (widescreen), 3:2 (35mm film), and 9:16 (portrait/stories). The selection box automatically adjusts when you switch presets.' },
  { q: 'What are the rule of thirds lines in the crop box?', a: 'The grid lines divide the crop area into 9 equal sections — a photography composition guide. Placing your subject at one of the four intersection points typically produces more visually appealing results than centering.' },
  { q: 'Does cropping reduce image quality?', a: 'No. The crop operation reads pixel data directly from the source image at full resolution. There is no re-encoding or quality reduction — you get a clean extract of the selected region.' },
  { q: 'What output formats are supported?', a: 'You can save the cropped image as JPG (smallest, best for photos), PNG (lossless, best for graphics), or WebP (modern format, excellent compression). Select your preferred format before clicking "Crop Image".' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'Image Cropper — PDFForge', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url: 'https://pdfforge.io/crop-image' },
    { '@type': 'HowTo', name: 'How to Crop an Image Online', totalTime: 'PT1M', step: [
      { '@type': 'HowToStep', position: 1, name: 'Upload image', text: 'Drop your image onto the upload area.' },
      { '@type': 'HowToStep', position: 2, name: 'Draw selection', text: 'Drag to define the crop area. Adjust with handles or pick an aspect ratio preset.' },
      { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Click Crop Image and download the result.' },
    ]},
  ],
}
