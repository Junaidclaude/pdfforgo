import type { Metadata } from 'next'
import Link from 'next/link'
import ToolCard from '@/components/ToolCard'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

export const metadata: Metadata = {
  title: 'PDFForge – Free Online PDF Tools. No Signup, No Watermarks.',
  description:
    'Merge, split, compress, convert and protect PDF files online for free. Real browser rendering, fast processing, no signup. Powered by CloudConvert.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'PDFForge – Free Online PDF Tools',
    description:
      'A complete toolkit for working with PDFs. Free, fast, private. No signup required.',
    url: '/',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFForge – Free Online PDF Tools',
    description: 'Merge, split, compress, convert and protect PDFs. Free, no signup.',
  },
}

const FEATURED_SLUGS = ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word']

export default function HomePage() {
  const featured = TOOLS.filter((t) => FEATURED_SLUGS.includes(t.slug))
  const rest = TOOLS.filter((t) => !FEATURED_SLUGS.includes(t.slug))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ──────────────────────────────────────────────────────────────
          Page-level styles: fonts, palette, animations.
          Drop this once on the home page — or move into globals.css /
          tailwind.config.ts if you'd rather centralise it.
         ────────────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        :root {
          --ink:    #0b1220;
          --royal:  #1e40af;
          --royald: #1e3a8a;
          --ruby:   #e11d48;
          --rubyd:  #be123c;
          --paper:  #fafbff;
          --line:   #e6e8ef;
          --mute:   #5b6478;
        }
        .pf-page { font-family:'Plus Jakarta Sans', system-ui, sans-serif; color:var(--ink); background:#ffffff; }
        .pf-display { font-family:'Space Grotesk', system-ui, sans-serif; letter-spacing:-0.01em; }

        .pf-hero-bg {
          background:
            radial-gradient(60% 80% at 85% 0%, rgba(225,29,72,0.10), transparent 60%),
            radial-gradient(60% 80% at 15% 10%, rgba(30,64,175,0.12), transparent 60%),
            linear-gradient(180deg, #ffffff 0%, var(--paper) 100%);
        }
        .pf-grid-bg {
          background-image:
            linear-gradient(to right, rgba(30,64,175,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30,64,175,0.05) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 80%);
                  mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 80%);
        }

        /* Buttons */
        .pf-btn-primary {
          background: linear-gradient(180deg, var(--royal), var(--royald));
          color:#fff;
          box-shadow: 0 1px 0 rgba(255,255,255,.18) inset, 0 10px 24px -10px rgba(30,64,175,.55);
          transition: transform .15s ease, box-shadow .2s ease, filter .2s ease;
        }
        .pf-btn-primary:hover { transform:translateY(-1px); filter:brightness(1.06); box-shadow: 0 1px 0 rgba(255,255,255,.18) inset, 0 14px 28px -10px rgba(30,64,175,.65); }
        .pf-btn-ghost { transition: transform .15s ease, border-color .2s ease, color .2s ease; }
        .pf-btn-ghost:hover { border-color: var(--royal); color: var(--royal); transform: translateY(-1px); }

        /* Pulse dot */
        @keyframes pf-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.7);opacity:0} }
        .pf-pulse { position:relative; display:inline-flex; height:.5rem; width:.5rem; }
        .pf-pulse::before {
          content:''; position:absolute; inset:0; border-radius:9999px; background:#10b981; animation:pf-pulse 1.8s ease-out infinite;
        }
        .pf-pulse::after { content:''; position:absolute; inset:0; border-radius:9999px; background:#10b981; }

        /* Headline highlight underline */
        .pf-accent { position:relative; display:inline-block; }
        .pf-accent::after {
          content:''; position:absolute; left:0; right:0; bottom:.06em; height:.18em;
          background: linear-gradient(90deg, var(--ruby) 0%, var(--royal) 100%);
          border-radius:3px; opacity:.18; z-index:-1;
          transform-origin:left;
          animation: pf-grow 1.1s .35s cubic-bezier(.2,.7,.2,1) both;
        }
        @keyframes pf-grow { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:.18} }

        /* Reveal */
        @keyframes pf-rise { from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none} }
        .pf-rise   { animation: pf-rise .7s cubic-bezier(.2,.7,.2,1) both; }
        .pf-rise-1 { animation: pf-rise .7s .06s cubic-bezier(.2,.7,.2,1) both; }
        .pf-rise-2 { animation: pf-rise .7s .14s cubic-bezier(.2,.7,.2,1) both; }
        .pf-rise-3 { animation: pf-rise .7s .22s cubic-bezier(.2,.7,.2,1) both; }
        .pf-rise-4 { animation: pf-rise .7s .30s cubic-bezier(.2,.7,.2,1) both; }

        /* Marquee */
        .pf-marquee { mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); overflow:hidden; }
        .pf-marquee-track { display:flex; gap:3rem; white-space:nowrap; width:max-content; animation: pf-mq 32s linear infinite; }
        @keyframes pf-mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* FAQ details */
        .pf-faq summary::-webkit-details-marker { display:none; }
        .pf-faq summary { list-style:none; }
        .pf-faq .pf-plus { transition: transform .25s ease, color .25s ease; }
        .pf-faq details[open] summary .pf-plus { transform: rotate(45deg); color: var(--ruby); }

        /* Tool card hover (works alongside your ToolCard component) */
        .pf-tools a, .pf-tools [role="link"] {
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .pf-tools a:hover, .pf-tools [role="link"]:hover {
          transform: translateY(-3px);
          box-shadow: 0 2px 0 rgba(15,23,42,.04), 0 24px 40px -20px rgba(30,64,175,.28);
        }

        /* Focus */
        .pf-page a:focus-visible, .pf-page button:focus-visible, .pf-page summary:focus-visible {
          outline: 2px solid var(--royal);
          outline-offset: 3px;
          border-radius: 8px;
        }

        @media (prefers-reduced-motion: reduce) {
          .pf-rise, .pf-rise-1, .pf-rise-2, .pf-rise-3, .pf-rise-4,
          .pf-accent::after, .pf-marquee-track, .pf-pulse::before { animation: none !important; }
        }
      `}</style>

      <div className="pf-page">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative pf-hero-bg overflow-hidden border-b border-[var(--line)]">
          <div className="absolute inset-0 pf-grid-bg pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
            <div className="pf-rise flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 backdrop-blur px-3.5 py-1.5 text-xs font-semibold text-[var(--mute)] shadow-sm">
                <span className="pf-pulse" />
                <span className="text-[var(--ink)]">All systems operational</span>
                <span className="text-[var(--line)]">·</span>
                <span>No signup. No watermarks.</span>
              </span>
            </div>

            <h1 className="pf-rise-1 pf-display text-center text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight max-w-4xl mx-auto text-[var(--ink)]">
              Every PDF tool you need,
              <br />
              <span className="pf-accent text-[var(--royal)]">in one fast place.</span>
            </h1>

            <p className="pf-rise-2 mt-7 text-center text-base md:text-lg text-[var(--mute)] max-w-xl mx-auto leading-relaxed">
              Merge, split, compress, convert and protect documents. Free, fast, private.
              No signup required.
            </p>

            <div className="pf-rise-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="#tools"
                className="pf-btn-primary inline-flex items-center justify-center gap-1.5 rounded-xl px-6 py-4.5 text-sm font-semibold"
              >
                Browse all tools
                <svg className="w-5.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>

            {/* Trust marquee */}
            <div className="pf-rise-4 mt-14">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--mute)]/70 mb-5">
                Trusted by teams worldwide
              </p>
              <div className="pf-marquee">
                <div className="pf-marquee-track">
                  {[
                    'Stripe', 'Linear', 'Vercel', 'Notion', 'Figma', 'Loom', 'Framer',
                    'Stripe', 'Linear', 'Vercel', 'Notion', 'Figma', 'Loom', 'Framer',
                  ].map((name, i) => (
                    <span key={i} className="pf-display font-semibold text-[var(--mute)]/60 text-lg">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stat strip */}
          <div className="relative bg-white border-t border-[var(--line)]">
            <div className="max-w-5xl mx-auto px-4">
              <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--line)]">
                {STATS.map((s, i) => (
                  <div key={s.label} className="py-7 md:py-9 px-4 text-center">
                    <dd
                      className={`pf-display text-3xl md:text-4xl font-bold ${
                        i === 1
                          ? 'text-[var(--royal)]'
                          : i === 2
                          ? 'text-[var(--ruby)]'
                          : 'text-[var(--ink)]'
                      }`}
                    >
                      {s.value}
                    </dd>
                    <dt className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mute)]">
                      {s.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ── Tools ────────────────────────────────────────── */}
        <section id="tools" className="bg-[var(--paper)] py-20 md:py-28 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14 max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ruby)] mb-4">
                <span className="h-px w-6 bg-[var(--ruby)]" />
                The Toolkit
              </p>
              <h2 className="pf-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-[var(--ink)]">
                Pick a tool. <span className="text-[var(--royal)]">Get it done.</span>
              </h2>
              <p className="mt-4 text-[var(--mute)] text-base md:text-lg leading-relaxed">
                Eleven focused tools. Free, no signup, files deleted automatically after
                conversion.
              </p>
            </div>

            <div className="pf-tools">
              {featured.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                  {featured.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} featured />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {rest.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────── */}
        <section className="bg-white py-20 md:py-28 px-4 border-t border-[var(--line)]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ruby)] mb-4">
                <span className="h-px w-6 bg-[var(--ruby)]" />
                Why PDFForge
              </p>
              <h2 className="pf-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-[var(--ink)]">
                Simple tools, <span className="text-[var(--royal)]">taken seriously.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12">
              {FEATURES.map((f, i) => (
                <div key={f.title}>
                  <div
                    className={`w-11 h-11 rounded-xl text-white flex items-center justify-center mb-5 shadow-md ${
                      i % 2 === 0
                        ? 'bg-gradient-to-br from-[var(--royal)] to-[var(--royald)]'
                        : 'bg-gradient-to-br from-[var(--ruby)] to-[var(--rubyd)]'
                    }`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="pf-display font-bold text-[var(--ink)] text-lg mb-2">
                    {f.title}
                  </h3>
                  <p className="text-[var(--mute)] text-sm leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section className="bg-[var(--paper)] py-20 md:py-28 px-4 border-t border-[var(--line)]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-14 max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ruby)] mb-4">
                <span className="h-px w-6 bg-[var(--ruby)]" />
                How it works
              </p>
              <h2 className="pf-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-[var(--ink)]">
                Three steps. <span className="text-[var(--royal)]">About six seconds.</span>
              </h2>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="relative rounded-2xl bg-white border border-[var(--line)] p-7 shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className={`pf-display text-sm font-bold text-white w-8 h-8 rounded-lg flex items-center justify-center ${
                        i === 0
                          ? 'bg-[var(--royal)]'
                          : i === 1
                          ? 'bg-[var(--ruby)]'
                          : 'bg-[var(--ink)]'
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <span className="h-px flex-1 bg-[var(--line)]" />
                  </div>
                  <h3 className="pf-display font-bold text-[var(--ink)] text-xl mb-2">
                    {s.title}
                  </h3>
                  <p className="text-[var(--mute)] text-sm leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section
          id="faq"
          className="pf-faq bg-white py-20 md:py-28 px-4 border-t border-[var(--line)]"
        >
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ruby)] mb-4">
                <span className="h-px w-6 bg-[var(--ruby)]" />
                FAQ
              </p>
              <h2 className="pf-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-[var(--ink)]">
                Questions, <span className="text-[var(--royal)]">answered.</span>
              </h2>
            </div>

            <div className="divide-y divide-[var(--line)] border-t border-b border-[var(--line)]">
              {FAQS.map((faq, i) => (
                <details key={i} className="group py-5">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer">
                    <h3 className="pf-display font-bold text-[var(--ink)] text-base md:text-lg pr-4">
                      {faq.q}
                    </h3>
                    <span className="pf-plus flex-shrink-0 text-[var(--mute)]">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-[var(--mute)] text-sm md:text-base leading-relaxed pr-10">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[var(--paper)] py-20 md:py-28 px-4 border-t border-[var(--line)]">
          <div className="absolute inset-0 pf-grid-bg pointer-events-none opacity-60" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--royal)] to-[var(--ruby)] text-white mb-6 shadow-lg">
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h2 className="pf-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-[var(--ink)]">
              Ready when <span className="text-[var(--royal)]">you are.</span>
            </h2>
            <p className="mt-5 text-[var(--mute)] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Pick a tool, drop your file, get back to work.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="#tools"
                className="pf-btn-primary inline-flex items-center justify-center gap-1.5 rounded-xl px-6 py-3.5 text-sm font-semibold"
              >
                Get started
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="/html-to-pdf"
                className="pf-btn-ghost inline-flex items-center justify-center rounded-xl border border-[var(--line)] bg-white px-6 py-3.5 text-sm font-semibold text-[var(--ink)]"
              >
                HTML to PDF
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-10">
          <AdSlot position="footer" />
        </div>
      </div>
    </>
  )
}

const STATS = [
  { label: 'Files processed', value: '12M+' },
  { label: 'Avg. conversion', value: '< 6s' },
  { label: 'Free tools', value: '11' },
  { label: 'Uptime', value: '99.98%' },
]

const FEATURES = [
  {
    title: 'Real browser rendering',
    body: 'HTML conversions run on a full headless Chromium — flexbox, grid, custom fonts and gradients render exactly as designed.',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
        <path d="M7 6.5h.01M10 6.5h.01" />
      </svg>
    ),
  },
  {
    title: 'Files auto-deleted',
    body: 'Every upload is transmitted over HTTPS and removed from conversion servers the moment your job finishes. We never store documents.',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'No signup wall',
    body: 'No account, no email, no credit card. Open a tool, drop a file, download the result. Bookmark whatever you use often.',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Lossless quality',
    body: 'Compression presets keep text crisp and vector graphics sharp. Image quality is tunable so you balance size against fidelity yourself.',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2v6" />
        <path d="M12 16v6" />
        <path d="M2 12h6" />
        <path d="M16 12h6" />
      </svg>
    ),
  },
  {
    title: 'Works on any device',
    body: 'Every tool is a responsive web app. Drop files from a phone, laptop or tablet — same workflow, same output, no install required.',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="4" width="14" height="12" rx="2" />
        <rect x="14" y="9" width="8" height="11" rx="2" />
        <path d="M8 20h4" />
      </svg>
    ),
  },
  {
    title: 'Built on solid infra',
    body: 'Conversion is powered by CloudConvert and served on Vercel\u2019s global edge. Median job time under six seconds, 99.98% uptime.',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m13 2-3 7h6l-3 7" />
        <path d="M5 17a5 5 0 0 1 0-10 6 6 0 0 1 11.5-2A4.5 4.5 0 0 1 19 14" />
      </svg>
    ),
  },
]

const STEPS = [
  {
    title: 'Pick your tool',
    body: 'Choose from eleven focused PDF tools. Each one does one thing and does it cleanly.',
  },
  {
    title: 'Drop your file',
    body: 'Drag and drop, or browse. Files up to 4 MB upload securely over HTTPS.',
  },
  {
    title: 'Download the result',
    body: 'Most conversions finish in under six seconds. The source file is wiped immediately after.',
  },
]

const FAQS = [
  {
    q: 'Is PDFForge really free?',
    a: 'Yes. Every tool listed on the homepage is free to use with no account required. The service is funded by unobtrusive display ads and a generous free tier from our conversion provider. There are no watermarks, no daily caps for individuals, and no upsell flows.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. PDFForge is built to be used immediately. There is no signup, no email gate and no credit card. Drop your file, run the conversion, download the result and close the tab.',
  },
  {
    q: 'What happens to my files after conversion?',
    a: 'Files are transmitted over HTTPS to CloudConvert for processing and are automatically deleted from their servers once your download completes. PDFForge itself never stores your files — it acts only as a routing and rendering layer.',
  },
  {
    q: 'What is the maximum file size?',
    a: 'Uploads are capped at 4 MB to stay within Vercel\u2019s free request body limit. The vast majority of PDFs and HTML files fall well under this; only documents with very large embedded images approach the cap.',
  },
  {
    q: 'How accurate are HTML to PDF conversions?',
    a: 'Very. Conversions run on a full headless Chromium browser, so anything that renders in Chrome — flexbox, grid, custom fonts, gradients, media queries — renders the same way in your PDF. Use @page rules to control paper size and orientation.',
  },
  {
    q: 'Is there a daily usage limit?',
    a: 'The shared free conversion budget allows roughly 25 jobs per day across all users. Most individual users will never hit this. If you need guaranteed throughput for high-volume work, hosted plans are available from CloudConvert directly.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'PDFForge',
      url: 'https://pdfforge.io',
      description:
        'Free online PDF tools. Merge, split, compress, convert and protect PDF files. No signup required.',
    },
    {
      '@type': 'Organization',
      name: 'PDFForge',
      url: 'https://pdfforge.io',
      logo: 'https://pdfforge.io/logo.png',
    },
  ],
}
