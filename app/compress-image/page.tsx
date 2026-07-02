import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const CompressImageTool = dynamic(() => import('./CompressImageTool'), {
  ssr: false,
  loading: () => <div className="max-w-3xl mx-auto px-4 py-10"><div className="h-52 bg-gray-100 rounded-2xl animate-pulse" /></div>,
})

export const metadata: Metadata = {
  title: 'Compress Image – Reduce JPG, PNG & WebP Size Free Online',
  description:
    'Compress JPG, PNG, and WebP images online for free. Adjust quality, convert to WebP for maximum compression. Batch compress multiple images. No signup, 100% browser-based.',
  alternates: { canonical: '/compress-image' },
  openGraph: {
    title: 'Compress Image – Reduce Image File Size Free | PDFForge',
    description: 'Compress JPG, PNG and WebP images with quality control. Batch compress multiple files at once. Free, private, no signup.',
    url: '/compress-image', type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Compress Image – Free Online | PDFForge', description: 'Reduce image file size with quality control. JPG, PNG, WebP. No signup.' },
}

const RELATED_SLUGS = ['edit-resize-image', 'convert-image', 'compress-pdf']

export default function CompressImagePage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 mb-4 text-xs text-blue-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">Compress Images Online</h1>
          <p className="text-mute text-lg max-w-xl mx-auto">Reduce JPG, PNG, and WebP file size without a noticeable quality loss. Batch compress multiple images at once — all in your browser.</p>
        </div>
      </section>
      <CompressImageTool />
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Compress Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4"><span className="font-display font-bold text-blue-600 text-lg">{i + 1}</span></div>
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
            Getting the Right Quality Setting Without Guessing
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              Compression usually gets used to solve a size problem, not a quality problem: a photo needs
              to fit under a website&apos;s upload limit, an email attachment is bouncing, or a page is loading
              slowly because of an oversized hero image. In most of those cases you&apos;re looking for the
              biggest size reduction you can get before the difference becomes visible — not the biggest
              reduction possible.
            </p>
            <p>
              For JPG, quality around 75–85% is usually the sweet spot: file size drops sharply from 100%
              with almost no visible change, while pushing much below 60% starts introducing blocky
              artifacts, especially around sharp edges and text. WebP tends to look better than JPG at the
              same quality number and same file size, because its encoder is simply newer and more
              efficient — if compatibility isn&apos;t a concern, it&apos;s usually the better default. PNG is a
              different case entirely: it&apos;s a lossless format, so the quality slider genuinely does nothing
              to it. If you upload a PNG and leave the output format on &quot;Keep Original,&quot; you&apos;ll get the
              same file size back — to actually shrink a PNG, you need to convert it to JPG or WebP, which
              trades a lossless format for a lossy one.
            </p>
            <p>
              Compression also has diminishing (or negative) returns in a couple of predictable situations.
              Recompressing a JPG that&apos;s already been compressed once doesn&apos;t reclaim much — most of the
              easy savings were already taken, and each additional lossy pass adds a small amount of new
              artifacting rather than removing old data. And images that are mostly flat color or text —
              screenshots, scanned documents, simple graphics — tend to compress unevenly as JPG, producing
              visible &quot;ringing&quot; around hard edges; those often look cleaner and just as small as WebP, or
              are better left as PNG if they need to stay crisp.
            </p>
            <p>
              If you need to change pixel dimensions as well as file size, pair this with{' '}
              <Link href="/edit-resize-image" className="text-blue-600 hover:underline">Resize Image</Link>{' '}
              — a smaller image at the same quality setting will always produce a smaller file. And if you
              specifically need a different file type rather than just a smaller one, use{' '}
              <Link href="/convert-image" className="text-blue-600 hover:underline">Convert Image</Link>.
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
              <Link key={tool.slug} href={`/${tool.slug}`} className="group bg-white rounded-2xl p-5 border border-line hover:border-blue-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-blue-600 transition-colors">{tool.name}</p>
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
  { title: 'Choose Settings', body: 'Select your output format (Keep Original, JPG, or WebP) and adjust the quality slider. Lower quality = smaller file; higher quality = better image.' },
  { title: 'Drop Your Images', body: 'Drag and drop one or multiple image files onto the upload area. All processing happens instantly in your browser — no upload to any server.' },
  { title: 'Download Compressed Files', body: 'Download each compressed image individually, or grab all files at once in a single ZIP archive.' },
]

const FAQS = [
  { q: 'How much can image compression reduce file size?', a: 'It depends on the original image and quality setting. At 80% quality, JPG images typically shrink 40–70%. Converting a PNG to WebP at 80% quality can reduce size by 60–80% with minimal visible difference.' },
  { q: 'What is the difference between JPG and WebP compression?', a: 'WebP is a modern format developed by Google that achieves significantly smaller file sizes than JPG at the same visual quality. WebP is supported in all modern browsers. Use JPG for maximum compatibility with older software.' },
  { q: 'Does compression affect image dimensions?', a: 'No. This tool only changes the file encoding quality — the pixel dimensions (width × height) stay exactly the same. Use the Resize Image tool to change dimensions.' },
  { q: 'Can I compress PNG files?', a: 'PNG is a lossless format, so the quality slider does not affect PNG files. To reduce PNG size, convert them to JPG or WebP using the "Convert to JPG" or "Convert to WebP" option.' },
  { q: 'Is there a file size limit?', a: 'No. All processing happens in your browser using the Canvas API. The only limit is your device\'s available memory. Files up to 50 MB are handled easily on modern hardware.' },
  { q: 'Are my images uploaded to a server?', a: 'No. Everything runs locally in your browser. Your images are never sent to PDFForge or any third party.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'Image Compressor — PDFForge', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url: 'https://pdfforge.io/compress-image' },
    { '@type': 'HowTo', name: 'How to Compress Images Online', totalTime: 'PT1M', step: [
      { '@type': 'HowToStep', position: 1, name: 'Choose format & quality', text: 'Select output format and quality level.' },
      { '@type': 'HowToStep', position: 2, name: 'Upload images', text: 'Drop your image files onto the upload area.' },
      { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download compressed files individually or as ZIP.' },
    ]},
  ],
}
