import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const ResizeImageTool = dynamic(() => import('./ResizeImageTool'), {
  ssr: false,
  loading: () => <div className="max-w-3xl mx-auto px-4 py-10"><div className="h-52 bg-gray-100 rounded-2xl animate-pulse" /></div>,
})

export const metadata: Metadata = {
  title: 'Resize Image – Resize JPG, PNG & WebP Free Online',
  description:
    'Resize images by exact pixel dimensions or percentage. Lock aspect ratio or set custom width and height. Batch resize multiple images. No signup, 100% browser-based.',
  alternates: { canonical: '/edit-resize-image' },
  openGraph: {
    title: 'Resize Image – Resize Photos Free Online | PDFForge',
    description: 'Resize JPG, PNG, WebP images by pixels or percentage. Aspect ratio lock. Batch resize. Free, private, no signup.',
    url: '/edit-resize-image', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Resize Image – Free Online | PDFForge', description: 'Resize images by pixels or %. Lock aspect ratio. No signup.' },
}

const RELATED_SLUGS = ['compress-image', 'crop-image', 'convert-image']

export default function ResizeImagePage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 rounded-full px-3 py-1.5 mb-4 text-xs text-violet-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
            Private by default · Only Remove Background uploads to our server
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Resize Images <span className="text-violet-600">Online Free</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Set exact pixel dimensions or scale by percentage. Pick from presets (HD, 4K, Instagram) or enter custom sizes. Batch resize multiple images at once.
          </p>
        </div>
      </section>
      <ResizeImageTool />
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Resize Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4"><span className="font-display font-bold text-violet-600 text-lg">{i + 1}</span></div>
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
            Resize, Crop, or Remove the Background — and What Actually Leaves Your Device
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              This tool bundles a lot into one workspace — pixel or percentage resizing with presets for
              things like HD, 4K, and Instagram sizes, plus a full lightweight editor with crop, filters,
              rotation and flip, blur, and background removal. It&apos;s worth knowing which of those you
              actually need: resizing scales the whole image down or up while keeping all of it, while
              cropping (either here in the Edit panel or with the dedicated{' '}
              <Link href="/crop-image" className="text-violet-600 hover:underline">Crop Image</Link> tool)
              removes part of the frame to change the composition. If you just need a smaller file for the
              same photo, resize; if you need a different shape or want to cut something out of view, crop.
            </p>
            <p>
              On enlarging: the resize engine uses the browser&apos;s Canvas API with high-quality
              interpolation, which is a smoothing technique, not an AI reconstruction. It can stretch a
              small image up to a larger canvas and the result will be usable, but it can&apos;t invent detail
              that wasn&apos;t in the original — enlarge a photo by 20–30% and it usually still looks sharp;
              push a 300px thumbnail up to poster size and it will look visibly soft. That&apos;s the fundamental
              limit of any canvas-based resize, as opposed to a dedicated AI upscaler that generates
              plausible new detail.
            </p>
            <p>
              The one part of this tool that works differently from everything else here is Remove
              Background. Resizing, cropping, filters, rotation, and blur all run locally in your browser
              using the Canvas API — nothing about those operations ever leaves your device. Remove
              Background is the exception: it bakes in whatever edits you&apos;ve already applied, sends that
              image to our server to run the background-removal model, and returns a transparent PNG a few
              seconds later. It&apos;s the only step on this page that touches a network request, which is why
              the badge at the top of this page calls it out specifically rather than claiming the whole
              tool is private by default.
            </p>
            <p>
              Once you&apos;ve resized or edited a batch of images, if some of them still need a smaller file
              size for upload, run them through{' '}
              <Link href="/compress-image" className="text-violet-600 hover:underline">Compress Image</Link>{' '}
              — resizing and compressing solve different problems and often get used back to back.
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
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 border border-line hover:border-violet-300 transition-all hover:-translate-y-1 block">
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
  { title: 'Set Target Size', body: 'Choose "By Pixels" to enter exact width and height, or "By Percentage" to scale up or down proportionally. Lock the aspect ratio to prevent distortion.' },
  { title: 'Upload Images', body: 'Drop one or multiple images onto the upload area. All images get the same target dimensions. Resizing happens entirely in your browser — only the Remove Background mode sends your image to our server.' },
  { title: 'Download Resized Images', body: 'Download each resized image individually or grab all as a ZIP. Output format matches the original file type.' },
]

const FAQS = [
  { q: 'What does "lock aspect ratio" mean?', a: 'When aspect ratio is locked, you only set the target width. Each image\'s height is automatically calculated to preserve its original proportions — preventing stretching or squishing.' },
  { q: 'Can I resize multiple images at once?', a: 'Yes. Upload as many images as you want. All images will be resized to the same target dimensions (or percentage). Download them individually or as a ZIP.' },
  { q: 'Does resizing reduce image quality?', a: 'Scaling down (making images smaller) has minimal visible quality loss. Scaling up (enlarging) will soften details as the tool uses bicubic-equivalent canvas interpolation. For AI upscaling, a dedicated tool is needed.' },
  { q: 'What is the maximum image size I can resize?', a: 'There is no hard limit. Processing uses the browser Canvas API. Images up to 6000×6000 px work well on modern devices. Very large images (over 10,000 px wide) may require significant memory.' },
  { q: 'What file formats are supported?', a: 'JPG, PNG, WebP, GIF, and BMP are all supported for upload. Output format matches the original file type. Use the Convert Image tool to change the format.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'Image Resizer — PDFForge', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url: 'https://pdfforge.io/edit-resize-image' },
    { '@type': 'HowTo', name: 'How to Resize Images Online', totalTime: 'PT1M', step: [
      { '@type': 'HowToStep', position: 1, name: 'Set dimensions', text: 'Enter target pixels or percentage scale.' },
      { '@type': 'HowToStep', position: 2, name: 'Upload images', text: 'Drop your images onto the upload area.' },
      { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download resized images or ZIP.' },
    ]},
  ],
}
