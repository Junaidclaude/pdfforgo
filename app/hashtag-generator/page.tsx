import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const HashtagGeneratorTool = dynamic(() => import('./HashtagGeneratorTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Hashtag Generator — Free, No Signup | PDFForge',
  description:
    'Generate relevant hashtags for Instagram, TikTok, and X from a topic or keyword. Curated hashtag sets across dozens of popular niches. Free, no signup.',
  alternates: { canonical: '/hashtag-generator' },
  openGraph: {
    title: 'Hashtag Generator — Free | PDFForge',
    description: 'Generate hashtags for any topic. Free, no signup.',
    url: '/hashtag-generator',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hashtag Generator | PDFForge',
    description: 'Generate hashtags for any topic, free.',
  },
}

const RELATED_SLUGS = ['caption-character-counter', 'meme-generator', 'youtube-transcript']

export default function HashtagGeneratorPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-3 py-1.5 mb-4 text-xs text-purple-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block animate-pulse" />
            Free · No signup · No API
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Hashtag Generator <span className="text-purple-600">Free</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Enter a topic, get a curated set of relevant hashtags for Instagram, TikTok, and X. Pick the ones you want and copy.
          </p>
        </div>
      </section>

      <HashtagGeneratorTool />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            Curated Tags vs. &quot;Trending Now&quot;: What This Tool Actually Gives You
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              It&apos;s worth being upfront about where these hashtags actually come from, because it
              changes how you should use them: this isn&apos;t a service that scrapes Instagram or TikTok
              for what&apos;s trending this hour. It&apos;s a hand-built dataset of roughly twenty niches —
              travel, food, fitness, fashion, tech, gaming, and so on — each carrying about twenty hashtags
              that have been broadly popular and relevant in that space for a long time. When you type a
              topic, the tool first checks for an exact niche match, then checks if any word in your query
              matches a niche&apos;s keywords, then falls back to a looser substring match. If nothing
              matches at all, it still generates something useful — a handful of tags derived from your
              actual keyword (yourword, yourwordgram, yourwordlife, and so on) plus a small set of generic,
              works-everywhere tags like #instagood and #photooftheday.
            </p>
            <p>
              That tradeoff is deliberate. A curated, static list can&apos;t break when a platform changes
              its trending API or rate-limits a scraper, and it won&apos;t chase a fad that&apos;s dead in
              three days — the tags here are the kind that stay relevant month over month. What it
              genuinely can&apos;t do is tell you what&apos;s spiking <em>right now</em> — a breaking meme
              format, a moment tied to a live event, a regionally-specific trend. If real-time
              trend-chasing is the goal for a specific campaign, this is the wrong tool for that particular
              job; for steady, evergreen discoverability on a normal post, it&apos;s exactly the right one.
            </p>
            <p>
              On strategy: resist the urge to use all 30 generated tags on every post. The broadest tags
              (#travel, #fitness) have enormous volume, which also means your post is buried instantly
              among millions of others using the same tag — mixing in a few more specific tags related to
              your actual content (a city name, a specific workout style, a sub-niche) tends to surface
              better to people who&apos;d actually care. That&apos;s why every tag here is individually
              clickable — deselect the ones that don&apos;t fit this particular post rather than pasting the
              full block every time.
            </p>
            <p>
              If you&apos;re pairing hashtags with a caption, run the combined text through the{' '}
              <Link href="/caption-character-counter" className="text-purple-600 hover:underline">Caption Character Counter</Link>{' '}
              before posting — hashtags eat into the same character budget as your caption, and it&apos;s
              easy to blow past Instagram&apos;s 150-character bio limit or crowd out your actual message on
              a shorter-form platform.
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-purple-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-purple-600 transition-colors">{tool.name}</p>
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
  { q: 'Where do these hashtags come from?', a: 'A curated, hand-picked dataset of evergreen, widely-used hashtags across dozens of popular niches — not a live trend-scraping service, so results are consistent and won\'t break if a platform changes its API.' },
  { q: 'Will these hashtags help my post go viral?', a: 'Hashtags improve discoverability, but reach depends on many factors. Use these as a relevant, evergreen starting point rather than a guarantee.' },
  { q: 'Can I generate hashtags for a niche that isn\'t listed?', a: 'Yes — if your keyword doesn\'t match a curated niche, the tool still generates keyword-derived and generic tags automatically.' },
  { q: 'Is this free?', a: 'Yes, completely free with no signup or account required.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Hashtag Generator — PDFForge',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://pdfforge.io/hashtag-generator',
}
