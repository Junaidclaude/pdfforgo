import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'
import Link from 'next/link'

const MergeVideoTool = dynamic(() => import('./MergeVideoTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Merge Videos Online Free – Combine MP4, MOV, AVI & More',
  description:
    'Merge multiple videos into one file online for free. Upload videos, drag to reorder, and merge with one click. Same video quality — no re-encoding needed. 100% browser-based, no uploads.',
  alternates: { canonical: '/merge-video' },
  openGraph: {
    title: 'Merge Videos Online Free | PDFForge',
    description: 'Combine MP4, MOV, AVI, WebM videos into one. Drag to reorder, one-click merge, original quality.',
    url: '/merge-video',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merge Videos Online Free | PDFForge',
    description: 'Combine multiple videos into one — drag to reorder, merge in one click.',
  },
}

const RELATED_SLUGS = ['youtube-transcript', 'youtube-thumbnail-downloader', 'compress-image']

const HOW_TO_STEPS = [
  {
    title: 'Upload Your Videos',
    body: 'Drop your video files onto the upload area or click to select. Supports MP4, MOV, AVI, MKV, WebM, and more.',
  },
  {
    title: 'Arrange the Order',
    body: 'Drag and drop rows to rearrange videos into the exact sequence you want before merging.',
  },
  {
    title: 'Merge & Download',
    body: 'Click Merge and download your combined video as a single MP4 file. No watermarks, no account needed.',
  },
]

const FAQS = [
  {
    q: 'Does merging reduce video quality?',
    a: 'When all videos share the same codec (e.g., H.264 MP4s), the tool performs a stream copy — bytes are joined without any re-encoding, so quality is identical to the originals. If formats differ, it re-encodes at high quality (CRF 18), which is visually lossless for most content.',
  },
  {
    q: 'What video formats are supported?',
    a: 'MP4, MOV, AVI, MKV, WebM, M4V, FLV, WMV, TS, and MTS are all accepted. For best results and fastest merge, use MP4 (H.264) files.',
  },
  {
    q: 'Is there a file size limit?',
    a: 'There is no hard limit — processing happens entirely in your browser. Very large files (over 2 GB each) may require more RAM. For best performance, process a few files at a time.',
  },
  {
    q: 'Are my videos uploaded to a server?',
    a: 'No. All processing runs locally in your browser using WebAssembly (FFmpeg.wasm). Your files never leave your device.',
  },
  {
    q: 'Why is the merge taking a while?',
    a: 'If videos share the same codec, merge is near-instant. If codecs differ, the tool re-encodes the video, which takes time proportional to total video length — typically a few minutes for long clips.',
  },
]

export default function MergeVideoPage() {
  const related = TOOLS.filter(t => RELATED_SLUGS.includes(t.slug))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* Hero */}
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 rounded-full px-3 py-1.5 mb-4 text-xs text-violet-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
            100% private · Runs in your browser
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Merge Videos <span className="text-violet-600">Online Free</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Combine multiple videos into one. Upload, drag to set the order, merge in one click — same quality as the originals.
          </p>
        </div>
      </section>

      <MergeVideoTool />

      <div className="max-w-4xl mx-auto px-4">
        <AdSlot position="footer" />
      </div>

      {/* How to */}
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            How to Merge Videos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-violet-600 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            Frequently Asked Questions
          </h2>
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

      {/* Related */}
      {related.length > 0 && (
        <section className="py-12 px-4 bg-paper">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">
              You Might Also Need
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(tool => (
                <Link
                  key={tool.slug}
                  href={`/${tool.slug}`}
                  className="group bg-white rounded-2xl p-5 border border-line hover:border-violet-300 transition-all hover:-translate-y-1 block"
                >
                  <p className="font-display font-bold text-ink group-hover:text-violet-600 transition-colors">
                    {tool.name}
                  </p>
                  <p className="text-mute text-sm mt-1">{tool.shortDesc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Video Merger — PDFForge',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      url: 'https://pdfforge.io/merge-video',
    },
    {
      '@type': 'HowTo',
      name: 'How to Merge Videos Online',
      totalTime: 'PT2M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload videos', text: 'Drop or select your video files.' },
        { '@type': 'HowToStep', position: 2, name: 'Set order', text: 'Drag rows to arrange the merge sequence.' },
        { '@type': 'HowToStep', position: 3, name: 'Merge', text: 'Click Merge and download the combined MP4.' },
      ],
    },
  ],
}
