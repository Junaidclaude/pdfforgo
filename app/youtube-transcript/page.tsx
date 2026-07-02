import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const YoutubeTranscriptTool = dynamic(() => import('./YoutubeTranscriptTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'YouTube Transcript Generator — Free, No Signup | PDFForge',
  description:
    'Get the full transcript of any YouTube video with existing captions. Paste a link, view timestamped text, copy or download as TXT/SRT. Free, no signup, no API key.',
  alternates: { canonical: '/youtube-transcript' },
  openGraph: {
    title: 'YouTube Transcript Generator — Free | PDFForge',
    description: 'Paste a YouTube link, get the full transcript instantly. Free, no signup.',
    url: '/youtube-transcript',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Transcript Generator | PDFForge',
    description: 'Extract YouTube video transcripts free — no signup, no API key.',
  },
}

const RELATED_SLUGS = ['youtube-thumbnail-downloader', 'caption-character-counter', 'hashtag-generator']

export default function YoutubeTranscriptPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 mb-4 text-xs text-red-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
            Free · No signup · No API key
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            YouTube Transcript Generator <span className="text-red-600">Free</span>
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Paste a YouTube link and get the full transcript instantly — timestamped, searchable, and ready to copy or download.
          </p>
        </div>
      </section>

      <YoutubeTranscriptTool />

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-red-600 text-lg">{i + 1}</span>
                </div>
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
            What Actually Happens When You Paste a Link
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              This is one of the few tools on this site that isn&apos;t purely client-side, and it&apos;s
              worth being clear about why: YouTube&apos;s caption data isn&apos;t something a browser can
              fetch directly from another site due to how the platform is set up, so when you submit a
              link, your browser sends the video URL to our server, which requests the video&apos;s own
              caption track from YouTube and hands the parsed, timestamped result back to you. It&apos;s not
              scraping a third-party transcript database and it doesn&apos;t touch YouTube&apos;s official
              (quota-limited, API-key-gated) Data API — it reads the same public caption track your own
              browser would pull if you turned on subtitles — but the fetch itself happens server-side, not
              inside your browser.
            </p>
            <p>
              The practical uses for this tend to fall into a few buckets: pulling notes from a recorded
              lecture or webinar without rewatching the whole thing, grabbing an accurate quote for an
              article or research note instead of transcribing it by ear, and repurposing a video into a
              blog post or newsletter draft without retyping it from scratch. It&apos;s also just a faster
              way to search inside a long video — paste the link, then use your browser&apos;s own
              find-in-page (Ctrl/Cmd+F) against the transcript text to jump straight to the section that
              covers what you actually need, instead of scrubbing the timeline.
            </p>
            <p>
              One thing this tool genuinely can&apos;t do anything about: if a video&apos;s uploader never
              enabled captions — neither YouTube&apos;s auto-generated ones nor a manually uploaded track —
              there&apos;s no caption data to read, and you&apos;ll see &quot;No captions are available for
              this video&quot; rather than a transcript. It doesn&apos;t fall back to transcribing the audio
              itself. In practice this covers the large majority of videos, since YouTube auto-generates
              captions for most uploads by default, but very old videos, some livestream replays, and
              videos where the uploader explicitly disabled captions will come back empty. Occasionally
              YouTube will also rate-limit or bot-challenge requests coming from server infrastructure
              rather than a real browser — if you see a message about being temporarily rate-limited,
              that&apos;s YouTube&apos;s own defense kicking in, unrelated to the specific video, and
              it&apos;s usually worth trying again in a few minutes.
            </p>
            <p>
              For output, plain text without timestamps is what you want for pasting into a document or
              article; text with timestamps is better for note-taking where you might want to jump back to
              the source; and the .srt download is built specifically to drop into a video editor as a
              subtitle track if you&apos;re repurposing the footage itself, not just the words.
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

const HOW_TO_STEPS = [
  { title: 'Paste the link', body: 'Copy any public YouTube video URL (watch, youtu.be, shorts) and paste it in the box above.' },
  { title: 'We fetch the captions', body: 'We read the video\'s own caption track — auto-generated or manually uploaded — directly from YouTube, no third-party API.' },
  { title: 'Copy or download', body: 'View the transcript with timestamps, copy it, or download as a plain .txt file or .srt subtitle file.' },
]

const FAQS = [
  { q: 'Does this use the official YouTube API?', a: 'No. It reads the same public caption track your browser would when you turn on subtitles — no API key, no quota, no cost.' },
  { q: 'Why does it say "No captions are available"?', a: 'Some videos genuinely have no captions (auto-generated or manual) enabled by the uploader. In that case there is nothing to extract.' },
  { q: 'Can I get transcripts in other languages?', a: 'Yes — if the video has multiple caption tracks, a language dropdown appears so you can switch between them.' },
  { q: 'What format can I download?', a: 'Plain text (.txt, with or without timestamps) or subtitle format (.srt) that can be loaded into most video editors.' },
  { q: 'Is this free?', a: 'Yes, completely free with no signup or account required.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Transcript Generator — PDFForge',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://pdfforge.io/youtube-transcript',
}
