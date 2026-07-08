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

export default function HomePage() {
  const featured = TOOLS.filter((t) => FEATURED_SLUGS.includes(t.slug))
  const rest = TOOLS.filter((t) => !FEATURED_SLUGS.includes(t.slug))

  return (
    <>
      <RevealOnScroll />

      {/* ── COMPACT HERO ──────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        {/* Very subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.55,
        }} />

        {/* Soft colour washes */}
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,.07) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,.05) 0%, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* ── Left: text ── */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              {TOOLS.length} free tools · no signup required
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-ink leading-[1.08] tracking-tight text-balance">
              Every PDF tool<br />
              <span className="text-royal">you&apos;ll ever need.</span>
            </h1>

            <p className="mt-4 text-sm md:text-base text-mute max-w-sm leading-relaxed">
              Merge, split, compress, convert and protect — free, private, runs right in your browser.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3">
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

            <div className="mt-5">
              <AdSlot position="header" />
            </div>
          </div>

          {/* ── Right: interactive SVG ── */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-center w-[400px] xl:w-[460px]">
            <PDFIllustration />
          </div>
        </div>
      </section>

      {/* ── TOOLS ───────────────────────────────────────────── */}
      <section id="tools" className="bg-paper py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="reveal mb-12 max-w-2xl">
            <p className="section-label">
              <span className="h-px w-6 bg-ruby inline-block" />
              The Toolkit
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight leading-[1.05]">
              Pick a tool.{' '}
              <span className="text-royal">Get it done.</span>
            </h2>
            <p className="mt-3 text-mute text-base leading-relaxed">
              {TOOLS.length} focused tools. Free, no signup, files stay on your device.
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
          }),
        }}
      />
    </>
  )
}

/* ── PDF Illustration SVG ──────────────────────────────────────── */

function PDFIllustration() {
  return (
    <div className="relative w-full select-none" style={{ aspectRatio: '1 / 0.82' }}>
      <style>{`
        @keyframes float-a {
          0%,100% { transform: translateY(0px) rotate(-6deg); }
          50%      { transform: translateY(-10px) rotate(-6deg); }
        }
        @keyframes float-b {
          0%,100% { transform: translateY(0px) rotate(4deg); }
          50%      { transform: translateY(-7px) rotate(4deg); }
        }
        @keyframes float-main {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes float-badge {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-5px) scale(1.03); }
        }
        @keyframes dash-move {
          to { stroke-dashoffset: -20; }
        }
        @keyframes cursor-blink {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pop-in {
          0%   { opacity: 0; transform: scale(.6) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .doc-back    { animation: float-a 4.2s ease-in-out infinite; transform-origin: center; }
        .doc-mid     { animation: float-b 3.8s ease-in-out infinite 0.6s; transform-origin: center; }
        .doc-main    { animation: float-main 3.5s ease-in-out infinite 0.2s; transform-origin: center; }
        .badge-merge { animation: float-badge 3.2s ease-in-out infinite 0.4s; }
        .badge-split { animation: float-badge 3.6s ease-in-out infinite 0.9s; }
        .badge-comp  { animation: float-badge 4.0s ease-in-out infinite 0.1s; }
        .dash-path   { animation: dash-move 1.8s linear infinite; }
        .cursor-bar  { animation: cursor-blink 1s step-end infinite; }
        .gear-spin   { animation: spin-slow 8s linear infinite; transform-origin: 50% 50%; }
        .badge-merge,.badge-split,.badge-comp {
          animation-fill-mode: both;
        }
        .illus-root:hover .doc-main  { animation-play-state: paused; filter: drop-shadow(0 12px 28px rgba(99,102,241,.22)); }
        .illus-root:hover .badge-merge,
        .illus-root:hover .badge-split,
        .illus-root:hover .badge-comp { transform: scale(1.08); }
      `}</style>

      <svg
        className="illus-root w-full h-full"
        viewBox="0 0 460 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Dashed connection lines ── */}
        <line x1="100" y1="120" x2="178" y2="160"
          stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="5 4"
          className="dash-path" />
        <line x1="360" y1="110" x2="282" y2="158"
          stroke="#FECACA" strokeWidth="1.5" strokeDasharray="5 4"
          className="dash-path" style={{ animationDelay: '.5s', animationDirection: 'reverse' }} />
        <line x1="90" y1="272" x2="178" y2="245"
          stroke="#BBF7D0" strokeWidth="1.5" strokeDasharray="5 4"
          className="dash-path" style={{ animationDelay: '.9s' }} />
        <line x1="360" y1="265" x2="282" y2="245"
          stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="5 4"
          className="dash-path" style={{ animationDelay: '1.2s', animationDirection: 'reverse' }} />

        {/* ── Back document (rotated left) ── */}
        <g className="doc-back" style={{ transformOrigin: '230px 200px' }}>
          <rect x="165" y="110" width="130" height="168" rx="8"
            fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1.5" />
          {/* Lines */}
          <rect x="181" y="136" width="98" height="6" rx="3" fill="#C7D2FE" opacity=".7" />
          <rect x="181" y="150" width="80" height="6" rx="3" fill="#C7D2FE" opacity=".5" />
          <rect x="181" y="164" width="90" height="6" rx="3" fill="#C7D2FE" opacity=".5" />
          <rect x="181" y="178" width="68" height="6" rx="3" fill="#C7D2FE" opacity=".4" />
          <rect x="181" y="200" width="98" height="6" rx="3" fill="#C7D2FE" opacity=".3" />
          <rect x="181" y="214" width="74" height="6" rx="3" fill="#C7D2FE" opacity=".3" />
          {/* Fold corner */}
          <path d="M275 110 L295 130 L275 130 Z" fill="#C7D2FE" opacity=".5" />
        </g>

        {/* ── Mid document (rotated right) ── */}
        <g className="doc-mid" style={{ transformOrigin: '230px 200px' }}>
          <rect x="175" y="118" width="130" height="168" rx="8"
            fill="#FFF1F2" stroke="#FECACA" strokeWidth="1.5" />
          <rect x="191" y="144" width="98" height="6" rx="3" fill="#FECACA" opacity=".7" />
          <rect x="191" y="158" width="72" height="6" rx="3" fill="#FECACA" opacity=".5" />
          <rect x="191" y="172" width="88" height="6" rx="3" fill="#FECACA" opacity=".5" />
          <rect x="191" y="186" width="60" height="6" rx="3" fill="#FECACA" opacity=".4" />
          <path d="M285 118 L305 138 L285 138 Z" fill="#FECACA" opacity=".5" />
        </g>

        {/* ── Main document (front, white) ── */}
        <g className="doc-main" style={{ transformOrigin: '230px 200px' }}>
          {/* Shadow */}
          <rect x="188" y="138" width="136" height="176" rx="9"
            fill="rgba(99,102,241,.10)" />

          {/* Card */}
          <rect x="184" y="130" width="136" height="176" rx="9"
            fill="white" stroke="#E0E7FF" strokeWidth="1.5" />

          {/* PDF header bar */}
          <rect x="184" y="130" width="136" height="34" rx="9"
            fill="#4F46E5" />
          <rect x="184" y="150" width="136" height="14" rx="0"
            fill="#4F46E5" />

          {/* PDF label */}
          <text x="199" y="153" fontFamily="ui-sans-serif,system-ui,sans-serif"
            fontWeight="700" fontSize="12" fill="white" letterSpacing="1">PDF</text>

          {/* Fold corner */}
          <path d="M300 130 L320 150 L300 150 Z" fill="#3730A3" />

          {/* Page icon in header */}
          <rect x="303" y="133" width="10" height="13" rx="1" fill="rgba(255,255,255,.25)" />
          <path d="M308 133 L313 138 L313 146 L303 146 L303 133Z" fill="rgba(255,255,255,.15)" />

          {/* Content area */}
          {/* Title line */}
          <rect x="198" y="178" width="106" height="7" rx="3.5" fill="#334155" opacity=".85" />

          {/* Text lines */}
          <rect x="198" y="194" width="106" height="5" rx="2.5" fill="#94A3B8" opacity=".7" />
          <rect x="198" y="204" width="88"  height="5" rx="2.5" fill="#94A3B8" opacity=".6" />
          <rect x="198" y="214" width="96"  height="5" rx="2.5" fill="#94A3B8" opacity=".6" />
          <rect x="198" y="224" width="70"  height="5" rx="2.5" fill="#94A3B8" opacity=".5" />

          {/* Divider */}
          <line x1="198" y1="236" x2="302" y2="236" stroke="#E2E8F0" strokeWidth="1" />

          {/* Second block */}
          <rect x="198" y="244" width="106" height="5" rx="2.5" fill="#94A3B8" opacity=".5" />
          <rect x="198" y="254" width="80"  height="5" rx="2.5" fill="#94A3B8" opacity=".45" />
          <rect x="198" y="264" width="92"  height="5" rx="2.5" fill="#94A3B8" opacity=".4" />
          <rect x="198" y="274" width="60"  height="5" rx="2.5" fill="#94A3B8" opacity=".35" />

          {/* Cursor / edit indicator */}
          <rect x="259" y="178" width="2" height="9" rx="1" fill="#4F46E5" className="cursor-bar" />
        </g>

        {/* ── Badge: Merge (top-left) ── */}
        <g className="badge-merge" style={{ transformOrigin: '88px 110px' }}>
          <rect x="44" y="84" width="88" height="52" rx="12"
            fill="white" stroke="#E0E7FF" strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(99,102,241,.12))' }} />
          {/* Merge icon */}
          <g transform="translate(58,98)">
            <rect x="0"  y="2"  width="14" height="18" rx="2" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="1.2" />
            <rect x="6"  y="0"  width="14" height="18" rx="2" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="1.2" />
            <path d="M26 9 L34 9 M31 6 L34 9 L31 12" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="38" y="2" width="14" height="18" rx="2" fill="#4F46E5" opacity=".15" stroke="#4F46E5" strokeWidth="1.2" />
          </g>
          <text x="88" y="124" fontFamily="ui-sans-serif,system-ui,sans-serif"
            fontWeight="600" fontSize="9" fill="#6366F1" textAnchor="middle" letterSpacing=".5">MERGE</text>
        </g>

        {/* ── Badge: Split (top-right) ── */}
        <g className="badge-split" style={{ transformOrigin: '372px 108px' }}>
          <rect x="328" y="82" width="88" height="52" rx="12"
            fill="white" stroke="#FFE4E6" strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(239,68,68,.10))' }} />
          {/* Scissors icon */}
          <g transform="translate(344,95)">
            <circle cx="6"  cy="8"  r="5" fill="none" stroke="#F87171" strokeWidth="1.4" />
            <circle cx="6"  cy="20" r="5" fill="none" stroke="#F87171" strokeWidth="1.4" />
            <line x1="10" y1="6"  x2="32" y2="2"  stroke="#F87171" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="10" y1="22" x2="32" y2="26" stroke="#F87171" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M21 10 L21 18" stroke="#FCA5A5" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
          </g>
          <text x="372" y="122" fontFamily="ui-sans-serif,system-ui,sans-serif"
            fontWeight="600" fontSize="9" fill="#F87171" textAnchor="middle" letterSpacing=".5">SPLIT</text>
        </g>

        {/* ── Badge: Compress (bottom-left) ── */}
        <g className="badge-comp" style={{ transformOrigin: '78px 272px' }}>
          <rect x="26" y="248" width="104" height="52" rx="12"
            fill="white" stroke="#D1FAE5" strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(16,185,129,.10))' }} />
          {/* Compress arrows */}
          <g transform="translate(44,258)">
            <path d="M0 14 L10 4 M10 4 L10 10 M10 4 L4 4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 14 L30 4" stroke="#10B981" strokeWidth="1" strokeLinecap="round" opacity=".4" />
            <path d="M30 14 L20 4 M20 4 L20 10 M20 4 L26 4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* File shrinking visual */}
            <rect x="36" y="2"  width="24" height="28" rx="3" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="1.2" />
            <rect x="40" y="8"  width="16" height="3"  rx="1.5" fill="#34D399" opacity=".7" />
            <rect x="40" y="14" width="12" height="3"  rx="1.5" fill="#34D399" opacity=".5" />
            <rect x="40" y="20" width="14" height="3"  rx="1.5" fill="#34D399" opacity=".4" />
          </g>
          <text x="78" y="290" fontFamily="ui-sans-serif,system-ui,sans-serif"
            fontWeight="600" fontSize="9" fill="#10B981" textAnchor="middle" letterSpacing=".5">COMPRESS</text>
        </g>

        {/* ── Badge: Convert (bottom-right) ── */}
        <g className="badge-comp" style={{ transformOrigin: '376px 272px', animationDelay: '.7s' }}>
          <rect x="328" y="248" width="96" height="52" rx="12"
            fill="white" stroke="#FEF3C7" strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(245,158,11,.10))' }} />
          {/* Arrows cycle icon */}
          <g transform="translate(342,258)">
            {/* PDF box */}
            <rect x="0" y="4" width="22" height="22" rx="3" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="1.2" />
            <text x="11" y="18" fontFamily="ui-sans-serif,system-ui,sans-serif"
              fontWeight="700" fontSize="8" fill="#D97706" textAnchor="middle">PDF</text>
            {/* Arrows */}
            <path d="M26 8 C32 2, 42 2, 48 8" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M46 6 L48 8 L44 8" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M48 20 C42 26, 32 26, 26 20" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M28 22 L26 20 L30 20" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* DOCX box */}
            <rect x="46" y="4" width="22" height="22" rx="3" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="1.2" />
            <text x="57" y="18" fontFamily="ui-sans-serif,system-ui,sans-serif"
              fontWeight="700" fontSize="7" fill="#D97706" textAnchor="middle">DOC</text>
          </g>
          <text x="376" y="290" fontFamily="ui-sans-serif,system-ui,sans-serif"
            fontWeight="600" fontSize="9" fill="#F59E0B" textAnchor="middle" letterSpacing=".5">CONVERT</text>
        </g>

        {/* ── Small floating sparkles ── */}
        <circle cx="148" cy="68" r="3" fill="#A5B4FC" opacity=".5">
          <animate attributeName="opacity" values=".5;1;.5" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="r" values="3;4;3" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="318" cy="60" r="2.5" fill="#FCA5A5" opacity=".5">
          <animate attributeName="opacity" values=".5;1;.5" dur="2.0s" begin=".6s" repeatCount="indefinite" />
          <animate attributeName="r" values="2.5;3.5;2.5" dur="2.0s" begin=".6s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="195" r="2" fill="#6EE7B7" opacity=".6">
          <animate attributeName="opacity" values=".4;.9;.4" dur="2.8s" begin="1.1s" repeatCount="indefinite" />
        </circle>
        <circle cx="56" cy="200" r="2" fill="#FCD34D" opacity=".5">
          <animate attributeName="opacity" values=".4;1;.4" dur="3.1s" begin=".3s" repeatCount="indefinite" />
        </circle>
        <circle cx="230" cy="336" r="2.5" fill="#C7D2FE" opacity=".6">
          <animate attributeName="opacity" values=".4;.9;.4" dur="2.6s" begin=".8s" repeatCount="indefinite" />
        </circle>

        {/* ── Gear icon (bottom center, ambient) ── */}
        <g opacity=".12" style={{ transformOrigin: '230px 350px' }} className="gear-spin">
          <path d="M230 338 L233.5 332 L237 338 L244 336.5 L244 343.5 L237 342 L233.5 348 L230 342 L223 343.5 L223 336.5 Z"
            fill="#6366F1" />
          <circle cx="230" cy="340" r="5" fill="none" stroke="#6366F1" strokeWidth="2" />
        </g>
      </svg>
    </div>
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
    'edit-resize-image': <svg {...props}><path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>,
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
