import type { Metadata } from 'next'
import ToolCard from '@/components/ToolCard'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

export const metadata: Metadata = {
  title: 'PDFForge — Free Online PDF Tools | No Signup Required',
  description:
    'Free online PDF tools that work entirely in your browser. Merge, split, compress, convert, rotate, watermark and protect PDFs instantly. No signup. No watermarks. 100% free.',
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-dark text-white py-20 md:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-sm text-primary-light">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            100% Free &nbsp;·&nbsp; No Signup Required &nbsp;·&nbsp; No Watermarks
          </div>

          <h1 className="font-syne text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-balance">
            All the PDF Tools You Need,{' '}
            <span className="text-primary">Completely Free</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Merge, split, compress, and convert PDFs directly in your browser.
            Your files never leave your device — no account needed.
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <TrustBadge>No file size limits</TrustBadge>
            <TrustBadge>No watermarks added</TrustBadge>
            <TrustBadge>Files stay on your device</TrustBadge>
            <TrustBadge>Works offline</TrustBadge>
          </div>
        </div>
      </section>

      {/* ── Ad: below hero ── */}
      <div className="bg-bg-dark">
        <div className="max-w-6xl mx-auto px-4">
          <AdSlot position="header" />
        </div>
      </div>

      {/* ── Tool Grid ── */}
      <section id="tools" className="py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Choose Your PDF Tool</h2>
            <p className="section-subtitle">
              Professional-grade PDF tools that run entirely in your browser
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why PDFForge ── */}
      <section className="bg-dark py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-syne text-3xl md:text-4xl font-extrabold text-white mb-4">
            Why Choose PDFForge?
          </h2>
          <p className="text-gray-500 text-lg mb-12">
            Built for speed, privacy, and simplicity
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <WhyCard
              emoji="🔒"
              title="Your Files Are Private"
              body="All processing happens locally in your browser. We never upload, store, or see your files. Ever."
            />
            <WhyCard
              emoji="⚡"
              title="Blazing Fast"
              body="PDF operations complete in seconds using WebAssembly-powered libraries — no server round-trips."
            />
            <WhyCard
              emoji="✨"
              title="No Account Needed"
              body="Just open a tool and start working. No registration, no email, no credit card — forever free."
            />
          </div>
        </div>
      </section>

      {/* ── Schema.org structured data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'PDFForge',
            url: 'https://pdfforge.io',
            description:
              'Free online PDF tools. Merge, split, compress, convert PDFs. No signup required.',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://pdfforge.io/?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* ── Ad: footer ── */}
      <div className="max-w-6xl mx-auto px-4">
        <AdSlot position="footer" />
      </div>
    </>
  )
}

function TrustBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg
        className="w-4 h-4 text-green-400 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </span>
  )
}

function WhyCard({
  emoji,
  title,
  body,
}: {
  emoji: string
  title: string
  body: string
}) {
  return (
    <div className="bg-dark-800 rounded-2xl p-6 text-left border border-white/5">
      <span className="text-3xl block mb-4">{emoji}</span>
      <h3 className="font-syne text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
    </div>
  )
}
