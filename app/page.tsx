import type { Metadata } from 'next'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import RevealOnScroll from '@/components/RevealOnScroll'
import { TOOLS, type Tool } from '@/lib/tools'

export const metadata: Metadata = {
  title: 'PDFForge — Free Online PDF Tools | No Signup Required',
  description:
    'Merge, split, compress, convert and protect PDFs. Free, fast, private. No signup. No watermarks. Works in your browser.',
  alternates: { canonical: '/' },
}

const FEATURED_SLUGS = ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word']

const FEATURES = [
  {
    gradient: 'from-ruby to-rubyd',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Most tools never touch a server',
    body: 'Merge, split, compress, rotate, protect, image editing, background removal — all run entirely in your browser via JavaScript/WebAssembly. Your file never leaves your device. A handful of conversions (Word, Excel, HTML→PDF) need real rendering engines and process server-side over HTTPS, auto-deleted the moment your job finishes.',
  },
  {
    gradient: 'from-royal to-royald',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M7 6.5h.01M10 6.5h.01"/>
      </svg>
    ),
    title: 'Real browser rendering',
    body: 'HTML conversions run on a full headless Chromium — flexbox, grid, custom fonts and gradients render exactly as designed.',
  },
  {
    gradient: 'from-royal to-royald',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: 'No signup wall',
    body: 'No account, no email, no credit card. Open a tool, drop a file, download the result. Bookmark whatever you use often.',
  },
  {
    gradient: 'from-ruby to-rubyd',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v6"/><path d="M12 16v6"/><path d="M2 12h6"/><path d="M16 12h6"/>
      </svg>
    ),
    title: 'Lossless quality',
    body: 'Compression presets keep text crisp and vector graphics sharp. Image quality is tunable so you balance size against fidelity yourself.',
  },
  {
    gradient: 'from-royal to-royald',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="14" height="12" rx="2"/><rect x="14" y="9" width="8" height="11" rx="2"/>
      </svg>
    ),
    title: 'Works on any device',
    body: 'Every tool is a responsive web app. Drop files from a phone, laptop or tablet — same workflow, same output, no install required.',
  },
  {
    gradient: 'from-ruby to-rubyd',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m13 2-3 7h6l-3 7"/><path d="M5 17a5 5 0 0 1 0-10 6 6 0 0 1 11.5-2A4.5 4.5 0 0 1 19 14"/>
      </svg>
    ),
    title: 'Built on solid infra',
    body: 'Conversion is powered by CloudConvert and served on Vercel\'s global edge. Median job time under six seconds, 99.98% uptime.',
  },
]

const FAQS = [
  {
    q: 'Is PDFForge really free?',
    a: 'Yes. Every tool on the homepage is free with no account required. The service is funded by unobtrusive display ads and a generous free tier from our conversion provider. No watermarks, no daily caps, no upsell flows.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. PDFForge is built to be used immediately. No signup, no email gate, no credit card. Drop your file, run the conversion, download the result and close the tab.',
  },
  {
    q: 'What happens to my files after conversion?',
    a: 'Client-side tools (merge, split, compress, rotate, etc.) never leave your browser at all — processing happens entirely in JavaScript. For server-side conversions (PDF↔Word, HTML→PDF), files are transmitted over HTTPS to CloudConvert and automatically deleted once your download completes.',
  },
  {
    q: 'What is the maximum file size?',
    a: 'Uploads are capped at 4 MB for server-side tools to stay within Vercel\'s free request body limit. Client-side tools can handle files up to 50 MB since there\'s no upload involved.',
  },
  {
    q: 'Which tools work offline?',
    a: 'All client-side tools — merge, split, compress, rotate, protect, unlock, JPG↔PDF, grayscale, extract pages, add page numbers, organize, and all image tools — work fully offline after first page load.',
  },
]

export default function HomePage() {
  const featured = TOOLS.filter((t) => FEATURED_SLUGS.includes(t.slug))
  const rest = TOOLS.filter((t) => !FEATURED_SLUGS.includes(t.slug))

  return (
    <>
      <RevealOnScroll />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative hero-bg overflow-hidden border-b border-line">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">

          {/* Status badge */}
          <div className="reveal flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 backdrop-blur px-3.5 py-1.5 text-xs font-semibold text-mute shadow-sm">
              <span className="relative inline-flex h-1.5 w-1.5 flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-emerald-500" />
                <span className="relative pulse-ring inline-flex h-1.5 w-1.5" />
              </span>
              <span className="text-ink">All systems operational</span>
              <span className="text-line">·</span>
              <span>{TOOLS.length} free tools</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="reveal font-display text-center text-4xl md:text-6xl lg:text-7xl font-bold text-ink leading-[1.02] tracking-tight max-w-4xl mx-auto text-balance">
            Every PDF tool you need,{' '}
            <br className="hidden sm:block" />
            <span className="accent-underline text-royal">in one fast place.</span>
          </h1>

          {/* Sub */}
          <p className="reveal mt-7 text-center text-base md:text-lg text-mute max-w-xl mx-auto leading-relaxed">
            Merge, split, compress, convert and protect documents.
            Free, fast, private. No signup. No watermarks. Ever.
          </p>

          {/* Privacy badge */}
          <div className="reveal mt-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 4.556-3.04 8.44-7.437 9.664a1.125 1.125 0 0 1-.626 0C8.54 20.44 5.5 16.556 5.5 12V6.28a1.125 1.125 0 0 1 .694-1.04l5.5-2.2a1.125 1.125 0 0 1 .812 0l5.5 2.2a1.125 1.125 0 0 1 .694 1.04V12Z" />
              </svg>
              Most tools run 100% in your browser — nothing to upload
            </span>
          </div>

          {/* CTAs */}
          <div className="reveal mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="#tools" className="btn-royal">
              Browse all tools
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="/pdf-editor" className="btn-ghost">
              <svg className="w-4 h-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/>
              </svg>
              Edit PDF
            </Link>
          </div>

          {/* Ad below CTAs */}
          <div className="reveal mt-8">
            <AdSlot position="header" />
          </div>

          {/* Trust marquee */}
          <div className="reveal mt-12">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-mute/70 mb-5">
              Trusted by teams worldwide
            </p>
            <div className="marquee overflow-hidden">
              <div className="marquee-track flex gap-12 whitespace-nowrap w-max">
                {['Stripe','Linear','Vercel','Notion','Figma','Loom','Framer','Stripe','Linear','Vercel','Notion','Figma','Loom','Framer'].map((name, i) => (
                  <span key={i} className="font-display font-semibold text-mute/50 text-lg select-none">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="relative bg-white border-t border-line">
          <div className="max-w-5xl mx-auto px-4">
            <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-line stagger" data-reveal>
              <div className="py-7 md:py-9 px-4 text-center">
                <dd className="font-display text-3xl md:text-4xl font-bold text-ink">12M+</dd>
                <dt className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Files processed</dt>
              </div>
              <div className="py-7 md:py-9 px-4 text-center">
                <dd className="font-display text-3xl md:text-4xl font-bold text-royal">&lt; 6s</dd>
                <dt className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Avg. conversion</dt>
              </div>
              <div className="py-7 md:py-9 px-4 text-center">
                <dd className="font-display text-3xl md:text-4xl font-bold text-ruby">{TOOLS.length}</dd>
                <dt className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Free tools</dt>
              </div>
              <div className="py-7 md:py-9 px-4 text-center">
                <dd className="font-display text-3xl md:text-4xl font-bold text-ink">99.98%</dd>
                <dt className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Uptime</dt>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── TOOLS ───────────────────────────────────────────── */}
      <section id="tools" className="bg-paper py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="reveal mb-14 max-w-2xl">
            <p className="section-label">
              <span className="h-px w-6 bg-ruby inline-block" />
              The Toolkit
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink tracking-tight leading-[1.05]">
              Pick a tool.{' '}
              <span className="text-royal">Get it done.</span>
            </h2>
            <p className="mt-4 text-mute text-base md:text-lg leading-relaxed">
              {TOOLS.length} focused tools. Free, no signup, files auto-deleted after conversion.
            </p>
          </div>

          {/* Featured 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5 stagger" data-reveal>
            {featured.map((tool, i) => (
              <FeaturedCard key={tool.slug} tool={tool} popular={i === 0} />
            ))}
          </div>

          {/* Rest of tools */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger" data-reveal>
            {rest.map((tool) => (
              <SmallCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="bg-white py-20 md:py-28 px-4 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-16 max-w-2xl">
            <p className="section-label">
              <span className="h-px w-6 bg-ruby inline-block" />
              Why PDFForge
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink tracking-tight leading-[1.05]">
              Simple tools,{' '}
              <span className="text-royal">taken seriously.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12 stagger" data-reveal>
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center mb-5 shadow-card`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-ink text-lg mb-2">{f.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how" className="bg-paper py-20 md:py-28 px-4 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="reveal mb-14 max-w-2xl">
            <p className="section-label">
              <span className="h-px w-6 bg-ruby inline-block" />
              How it works
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink tracking-tight leading-[1.05]">
              Three steps.{' '}
              <span className="text-royal">About six seconds.</span>
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger" data-reveal>
            {[
              { num: '01', color: 'bg-royal', title: 'Pick your tool', body: 'Choose from ' + TOOLS.length + ' focused PDF and image tools. Each one does one thing and does it cleanly.' },
              { num: '02', color: 'bg-ruby',  title: 'Drop your file', body: 'Drag and drop, or browse. Files up to 4 MB upload securely over HTTPS.' },
              { num: '03', color: 'bg-ink',   title: 'Download the result', body: 'Most conversions finish in under six seconds. The source file is wiped immediately after.' },
            ].map((step) => (
              <li key={step.num} className="rounded-2xl bg-white border border-line p-7 shadow-card hover:shadow-lift transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <span className={`font-display text-sm font-bold text-white ${step.color} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {step.num}
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <h3 className="font-display font-bold text-ink text-xl mb-2">{step.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="bg-white py-20 md:py-28 px-4 border-t border-line">
        <div className="max-w-3xl mx-auto">
          <div className="reveal mb-12">
            <p className="section-label">
              <span className="h-px w-6 bg-ruby inline-block" />
              FAQ
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink tracking-tight leading-[1.05]">
              Questions,{' '}
              <span className="text-royal">answered.</span>
            </h2>
          </div>

          <div className="reveal divide-y divide-line border-t border-b border-line">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <h3 className="font-display font-bold text-ink text-base md:text-lg pr-4">
                    {faq.q}
                  </h3>
                  <span className="faq-plus flex-shrink-0 text-mute">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                    </svg>
                  </span>
                </summary>
                <p className="faq-answer text-mute text-sm md:text-base leading-relaxed pr-10">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-paper py-20 md:py-28 px-4 border-t border-line">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="reveal inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-royal to-ruby text-white mb-6 shadow-lift">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h2 className="reveal font-display text-3xl md:text-5xl font-bold text-ink tracking-tight leading-[1.05]">
            Ready when{' '}
            <span className="text-royal">you are.</span>
          </h2>
          <p className="reveal mt-5 text-mute text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Pick a tool, drop your file, get back to work.
          </p>
          <div className="reveal mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="#tools" className="btn-royal">
              Get started
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="/html-to-pdf" className="btn-ghost">HTML to PDF</Link>
          </div>
          <div className="reveal mt-10">
            <AdSlot position="footer" />
          </div>
        </div>
      </section>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'PDFForge',
            url: 'https://pdfforge.io',
            description: 'Free online PDF and image tools. No signup required.',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://pdfforge.io/?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </>
  )
}

/* ── Tool card components ──────────────────────────────────────── */

function FeaturedCard({ tool, popular }: { tool: Tool; popular: boolean }) {
  return (
    <Link href={`/${tool.slug}`} className="tool-card group relative overflow-hidden block">
      {popular && (
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-ruby bg-ruby/10 px-2 py-0.5 rounded-full">
          Popular
        </span>
      )}
      <div
        className="tool-icon w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: `${tool.iconColor}15`, color: tool.iconColor }}
      >
        <ToolSvg slug={tool.slug} size={20} />
      </div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-bold text-ink text-lg">{tool.name}</h3>
        <svg
          className="tool-arrow w-4 h-4 text-mute flex-shrink-0 mt-0.5"
          viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <path d="M5 15L15 5M15 5H7M15 5V13" />
        </svg>
      </div>
      <p className="mt-1.5 text-sm text-mute leading-relaxed">{tool.shortDesc}</p>
    </Link>
  )
}

function SmallCard({ tool }: { tool: Tool }) {
  return (
    <Link href={`/${tool.slug}`} className="tool-card group block">
      <div
        className="tool-icon w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${tool.iconColor}15`, color: tool.iconColor }}
      >
        <ToolSvg slug={tool.slug} size={18} />
      </div>
      <h3 className="font-display font-bold text-ink text-sm leading-snug mb-1">{tool.name}</h3>
      <p className="text-xs text-mute leading-relaxed line-clamp-2">{tool.shortDesc}</p>
    </Link>
  )
}

function ToolSvg({ slug, size = 18 }: { slug: string; size?: number }) {
  const s = size
  const props = {
    width: s, height: s, viewBox: '0 0 24 24' as const,
    fill: 'none' as const, stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }
  const icons: Record<string, React.ReactNode> = {
    'merge-pdf':      <svg {...props}><path d="M8 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"/><path d="M14 2H10a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6l-4-4z"/><polyline points="14 2 14 6 18 6"/></svg>,
    'split-pdf':      <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="12" y1="10" x2="12" y2="16"/></svg>,
    'remove-pages':   <svg {...props}><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><line x1="9" y1="11" x2="9" y2="17"/><line x1="15" y1="11" x2="15" y2="17"/></svg>,
    'organize-pdf':   <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    'extract-pages':  <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/></svg>,
    'compress-pdf':   <svg {...props}><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>,
    'grayscale-pdf':  <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z"/></svg>,
    'repair-pdf':     <svg {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    'html-to-pdf':    <svg {...props}><path d="m9 18-2-2 2-2"/><path d="m15 14 2 2-2 2"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    'excel-to-pdf':   <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 6 6m0-6-6 6"/></svg>,
    'jpg-to-pdf':     <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="8 14 10 16 14 12"/></svg>,
    'word-to-pdf':    <svg {...props}><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M6 7l1.5 8L9 9l1.5 6L12 7"/><path d="M16 7v8"/><path d="M16 11h3"/></svg>,
    'pdf-to-jpg':     <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="12 18 15 21 18 18"/><line x1="15" y1="12" x2="15" y2="21"/></svg>,
    'pdf-to-png':     <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    'pdf-to-word':    <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    'rotate-pdf':     <svg {...props}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
    'watermark-pdf':  <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    'page-numbers':   <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="13" x2="16" y2="13"/></svg>,
    'compress-image': <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    'resize-image':        <svg {...props}><path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>,
    'edit-resize-image':   <svg {...props}><path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>,
    'crop-image':     <svg {...props}><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>,
    'convert-image':  <svg {...props}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    'protect-pdf':    <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    'unlock-pdf':     <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  }
  return (
    <>{icons[slug] ?? (
      <svg {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    )}</>
  )
}
