import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const CaptionCounterTool = dynamic(() => import('./CaptionCounterTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Social Media Character Counter — Free | PDFForge',
  description:
    'Live character counter for X/Twitter, Instagram, TikTok, YouTube, Facebook, and LinkedIn. See exactly how much room you have left as you type. Free, no signup.',
  alternates: { canonical: '/caption-character-counter' },
  openGraph: {
    title: 'Social Media Character Counter — Free | PDFForge',
    description: 'Character limits for every major platform, live as you type.',
    url: '/caption-character-counter',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media Character Counter | PDFForge',
    description: 'Character limits for every major platform, live as you type.',
  },
}

const RELATED_SLUGS = ['hashtag-generator', 'youtube-transcript', 'meme-generator']

export default function CaptionCounterPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-3 py-1.5 mb-4 text-xs text-cyan-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block animate-pulse" />
            Free · Every platform · Updates live
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Social Media Character Counter <span className="text-cyan-600">Free</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Type your caption once, see exactly how it fits X, Instagram, TikTok, YouTube, Facebook, and LinkedIn — all at the same time.
          </p>
        </div>
      </section>

      <CaptionCounterTool />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            Why the Same Caption Behaves Differently on Every Platform
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              The reason this tool shows eight numbers instead of one is that &quot;character limit&quot;
              means two different things depending on the platform. X enforces its 280-character cap as a
              hard limit — go over and the post simply won&apos;t publish. Instagram, TikTok, Facebook, and
              LinkedIn work differently: their <em>real</em> limits are enormous (2,200, 2,200, 63,206, and
              3,000 characters respectively), but the feed itself only shows a fraction of that before
              collapsing the rest behind &quot;more&quot; — 125 characters on Instagram, 150 on TikTok, 477
              on Facebook, 210 on LinkedIn. Most people who scroll past your post in their feed never tap
              &quot;more,&quot; so the caption&apos;s real audience is often just that first truncated chunk,
              not the full text you wrote.
            </p>
            <p>
              That changes how you should write. Put the actual hook, offer, or point in the first sentence
              or two — before the truncation cutoff for that platform — rather than opening with a
              scene-setting intro that only pays off three sentences in. Hashtags, credits, and
              calls-to-action are safer placed after the visible cutoff, since anyone who cares enough to
              expand the caption will see them, but they&apos;re doing nothing for the people who
              don&apos;t. The counter updates live as you type specifically so you can see, per platform,
              exactly where that cutoff lands in your actual text.
            </p>
            <p>
              One honest caveat: this counts Unicode characters, which is a very close match to how these
              platforms count but not a perfect one in every edge case. X&apos;s own composer, for example,
              always counts a link as a fixed 23 characters regardless of how long the actual URL is, and
              has its own weighting rules for certain scripts and emoji. For the overwhelming majority of
              captions — plain text, standard emoji, normal punctuation — the count here will match what you
              see in each platform&apos;s own editor almost exactly; just don&apos;t treat it as a
              byte-perfect guarantee if your caption is right at the edge of a limit and full of raw links.
            </p>
            <p>
              If you&apos;re finishing a caption with hashtags, the{' '}
              <Link href="/hashtag-generator" className="text-cyan-600 hover:underline">Hashtag Generator</Link>{' '}
              is worth checking first — it&apos;s easy to eat 60-80 characters on hashtags alone, which
              matters more on platforms like Instagram Bio (150-character limit total) than on a
              2,200-character caption.
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-cyan-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-cyan-600 transition-colors">{tool.name}</p>
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
  { q: 'Why does Instagram show a limit AND a "truncated after" warning?', a: 'Instagram allows captions up to 2,200 characters, but only shows the first ~125 characters before collapsing the rest behind "more" in the feed. Both numbers matter for engagement.' },
  { q: 'Are these limits accurate?', a: 'Yes, they reflect each platform\'s current published character limits as of 2026. Platforms occasionally adjust these, so treat them as a close, practical reference.' },
  { q: 'Does this tool store or upload my text?', a: 'No. Everything runs locally in your browser — nothing is sent anywhere.' },
  { q: 'Is this free?', a: 'Yes, completely free with no signup required.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Social Media Character Counter — PDFForge',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://pdfforge.io/caption-character-counter',
}
