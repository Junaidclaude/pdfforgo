import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const YoutubeThumbnailTool = dynamic(() => import('./YoutubeThumbnailTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'YouTube Thumbnail Downloader — Free, HD | PDFForge',
  description:
    'Download any YouTube video\'s thumbnail in every available resolution, up to full HD 1280×720. Paste a link, pick a size, download instantly. Free, no signup.',
  alternates: { canonical: '/youtube-thumbnail-downloader' },
  openGraph: {
    title: 'YouTube Thumbnail Downloader — Free, HD | PDFForge',
    description: 'Download YouTube thumbnails in every resolution, up to full HD.',
    url: '/youtube-thumbnail-downloader',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Thumbnail Downloader | PDFForge',
    description: 'Download YouTube thumbnails free, up to full HD.',
  },
}

const RELATED_SLUGS = ['youtube-transcript', 'caption-character-counter', 'hashtag-generator']

export default function YoutubeThumbnailPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 mb-4 text-xs text-red-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
            Free · No signup · Up to full HD
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            YouTube Thumbnail Downloader <span className="text-red-600">Free</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Paste a YouTube link and download its thumbnail in every resolution YouTube stores — up to 1280×720.
          </p>
        </div>
      </section>

      <YoutubeThumbnailTool />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            Where These Images Actually Come From (and What You Can Do With Them)
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              Unlike some of the other tools here, this one never touches our own servers at all — when you
              click download, your browser fetches the image bytes directly from{' '}
              <code>i.ytimg.com</code>, YouTube&apos;s own public image CDN, the exact same CDN your browser
              already loads thumbnails from every time you browse YouTube. Pasting a link just extracts the
              video ID and builds the predictable URL YouTube itself uses for each resolution; there&apos;s
              no processing or intermediary step involved.
            </p>
            <p>
              The resolution list isn&apos;t guaranteed to be complete for every video, and there&apos;s a
              specific reason why. Only videos uploaded in HD actually have a 1280×720{' '}
              <code>maxresdefault</code> thumbnail stored — older uploads, or ones YouTube processed at
              lower quality, simply don&apos;t have that file. Oddly, YouTube doesn&apos;t return a normal
              404 for a missing size; it silently serves a small grey 120×90 placeholder image instead,
              which would otherwise trick a naive tool into offering a &quot;HD&quot; download that&apos;s
              actually a blank grey square. This tool checks the actual pixel dimensions of what loaded and
              quietly drops any resolution that turns out to be that placeholder, so what you see listed is
              only what genuinely exists for that video.
            </p>
            <p>
              Beyond the obvious (grabbing a thumbnail to reference or reuse), this gets used for a couple
              of specific things: competitive research — pulling thumbnails from videos that are doing well
              in a niche to study what colors, expressions, and text treatments are working — and
              production reference, matching the crop, contrast, or layout of your own channel&apos;s
              thumbnails against others at a glance. It&apos;s also just a fast way to grab a still image
              tied to a video without scrubbing to a frame and screenshotting it yourself.
            </p>
            <p>
              One thing worth keeping in mind: a video&apos;s thumbnail is normally the uploader&apos;s own
              creative work (or a frame plus overlay they created), and it&apos;s protected the same way any
              other image is. Downloading it for personal reference, research, or analysis is generally
              fine, but reusing someone else&apos;s thumbnail in something you publish — a competing video,
              an article, a social post — without permission carries the same copyright risk as lifting any
              other image you didn&apos;t make. When in doubt, treat it as a reference to learn from rather
              than an asset to republish.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-paper">
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

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">You Might Also Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 border border-line hover:border-red-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-red-600 transition-colors">{tool.name}</p>
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

const FAQS = [
  { q: 'Why is HD (maxresdefault) not available for some videos?', a: 'Only videos uploaded in HD have a 1280×720 thumbnail. Older or lower-resolution uploads only have smaller sizes — this tool automatically hides sizes that don\'t exist for a given video.' },
  { q: 'Does this work for any public YouTube video?', a: 'Yes, any public video. Thumbnails are served from YouTube\'s public image CDN, the same one your browser uses to display them.' },
  { q: 'What format are the downloads?', a: 'JPG, matching the format YouTube stores thumbnails in.' },
  { q: 'Is this free?', a: 'Yes, completely free with no signup or account required.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Thumbnail Downloader — PDFForge',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://pdfforge.io/youtube-thumbnail-downloader',
}
