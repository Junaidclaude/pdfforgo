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

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs font-medium text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </div>

          <h1 className="font-syne text-center text-4xl md:text-6xl font-extrabold text-dark leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Every PDF tool you need,
            <span className="text-orange-500"> in one place.</span>
          </h1>

          <p className="mt-6 text-center text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Merge, split, compress, convert and protect documents. Free, fast, private.
            No signup required.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="#tools"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-dark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Browse all tools
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href="/merge-pdf"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
            >
              Merge PDF
            </Link>
          </div>
        </div>

        {/* Stat strip */}
        <div className="border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4">
            <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
              {STATS.map((s) => (
                <div key={s.label} className="py-6 md:py-8 px-4 text-center">
                  <dd className="font-syne text-2xl md:text-3xl font-extrabold text-dark">
                    {s.value}
                  </dd>
                  <dt className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Tools ────────────────────────────────────────── */}
      <section id="tools" className="bg-bg-dark py-20 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500 mb-3">
              The Toolkit
            </p>
            <h2 className="font-syne text-3xl md:text-4xl font-extrabold text-dark tracking-tight">
              Pick a tool. Get it done.
            </h2>
            <p className="mt-3 text-gray-500">
              Eleven focused tools. Free, no signup, files deleted automatically after
              conversion.
            </p>
          </div>

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
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-24 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500 mb-3">
              Why PDFForge
            </p>
            <h2 className="font-syne text-3xl md:text-4xl font-extrabold text-dark tracking-tight">
              Simple tools, taken seriously.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-10">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 text-dark flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-syne font-extrabold text-dark text-base mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="bg-bg-dark py-20 md:py-24 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500 mb-3">
              How it works
            </p>
            <h2 className="font-syne text-3xl md:text-4xl font-extrabold text-dark tracking-tight">
              Three steps. About six seconds.
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="relative rounded-xl bg-white border border-gray-100 p-7"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-syne text-sm font-extrabold text-orange-500">
                    0{i + 1}
                  </span>
                  <span className="h-px flex-1 bg-gray-100" />
                </div>
                <h3 className="font-syne font-extrabold text-dark text-lg mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="bg-white py-20 md:py-24 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500 mb-3">
              FAQ
            </p>
            <h2 className="font-syne text-3xl md:text-4xl font-extrabold text-dark tracking-tight">
              Questions, answered.
            </h2>
          </div>

          <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
            {FAQS.map((faq, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <h3 className="font-syne font-bold text-dark text-base pr-4">
                    {faq.q}
                  </h3>
                  <span className="flex-shrink-0 text-gray-400 group-open:text-orange-500 transition-colors">
                    <svg
                      className="w-4 h-4 transition-transform duration-200 group-open:rotate-45"
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
                <p className="mt-3 text-gray-500 text-sm leading-relaxed pr-10">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-bg-dark py-20 md:py-24 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-syne text-3xl md:text-4xl font-extrabold text-dark tracking-tight">
            Ready when you are.
          </h2>
          <p className="mt-4 text-gray-500 text-base md:text-lg max-w-xl mx-auto">
            Pick a tool, drop your file, get back to work.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="#tools"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-dark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Get started
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href="/html-to-pdf"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
            >
              HTML to PDF
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <AdSlot position="footer" />
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
