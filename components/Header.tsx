'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TOOLS, NAV_CATEGORIES } from '@/lib/tools'

// Tools shown directly in the top nav bar (most popular)
const TOP_NAV_TOOLS = ['pdf-editor']

const PDF_CATEGORIES = NAV_CATEGORIES.filter((c) => c.key !== 'image')

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const topNavTools = TOOLS.filter((t) => TOP_NAV_TOOLS.includes(t.slug))

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="PDFForge home"
        >
          <span className="relative inline-flex w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
            <span className="absolute inset-0 bg-royal" />
            <span className="absolute -right-1 -bottom-1 w-4 h-4 rounded-md bg-ruby" />
            <span className="relative m-auto font-display font-bold text-white text-[13px] z-10">P</span>
          </span>
          <span className="font-display font-bold text-ink tracking-tight">PDFForge</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1" aria-label="Main navigation">
          {/* Top tool shortcuts */}
          {topNavTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === `/${tool.slug}`
                  ? 'text-ink bg-line'
                  : 'text-mute hover:text-ink hover:bg-line/60'
              }`}
            >
              {tool.name}
            </Link>
          ))}

          {/* ── PDF Tools hover dropdown ── */}
          <div className="relative group/pdf">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-mute hover:text-ink hover:bg-line/60 transition-colors group-hover/pdf:text-ink group-hover/pdf:bg-line/60">
              PDF Tools
              <ChevronIcon open={false} groupHover="group-hover/pdf:rotate-180" />
            </button>
            {/* pt-2 bridge keeps hover alive between button and panel */}
            <div className="absolute top-full left-0 pt-2 pointer-events-none group-hover/pdf:pointer-events-auto">
              <div className="w-[640px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 grid grid-cols-2 gap-5
                opacity-0 translate-y-[-6px] group-hover/pdf:opacity-100 group-hover/pdf:translate-y-0
                transition-all duration-200 ease-out">
                {PDF_CATEGORIES.map((cat) => {
                  const catTools = TOOLS.filter((t) => t.category === cat.key)
                  return (
                    <div key={cat.key}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: cat.color }}>{cat.label}</p>
                      <ul className="space-y-0.5">
                        {catTools.map((tool) => (
                          <li key={tool.slug}>
                            <Link href={`/${tool.slug}`}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors group">
                              <span className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: tool.iconBg, color: tool.iconColor }}>
                                <ToolIcon slug={tool.slug} size={12} />
                              </span>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-dark">{tool.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Image Tools hover dropdown ── */}
          <div className="relative group/img">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-mute hover:text-ink hover:bg-line/60 transition-colors group-hover/img:text-ink group-hover/img:bg-line/60">
              Image Tools
              <ChevronIcon open={false} groupHover="group-hover/img:rotate-180" />
            </button>
            <div className="absolute top-full left-0 pt-2 pointer-events-none group-hover/img:pointer-events-auto">
              <div className="w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3
                opacity-0 translate-y-[-6px] group-hover/img:opacity-100 group-hover/img:translate-y-0
                transition-all duration-200 ease-out">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mb-2 px-2">Image Tools</p>
                <ul className="space-y-0.5">
                  {TOOLS.filter((t) => t.category === 'image').map((tool) => (
                    <li key={tool.slug}>
                      <Link href={`/${tool.slug}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors group">
                        <span className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: tool.iconBg, color: tool.iconColor }}>
                          <ToolIcon slug={tool.slug} size={12} />
                        </span>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-dark">{tool.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── ALL TOOLS hover mega menu ── */}
          <div className="relative group/mega">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-mute hover:text-ink hover:bg-line/60 transition-colors group-hover/mega:text-ink group-hover/mega:bg-line/60">
              <span className="text-royal font-bold">ALL TOOLS</span>
              <ChevronIcon open={false} groupHover="group-hover/mega:rotate-180" />
            </button>
            <div className="absolute top-full left-0 pt-2 pointer-events-none group-hover/mega:pointer-events-auto">
              <div className="w-[1100px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 grid grid-cols-4 gap-6
                opacity-0 translate-y-[-6px] group-hover/mega:opacity-100 group-hover/mega:translate-y-0
                transition-all duration-200 ease-out">
                {NAV_CATEGORIES.map((cat) => {
                  const catTools = TOOLS.filter((t) => t.category === cat.key)
                  return (
                    <div key={cat.key}>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: cat.color }}>
                        {cat.label}
                      </p>
                      <ul className="space-y-0.5">
                        {catTools.map((tool) => (
                          <li key={tool.slug}>
                            <Link href={`/${tool.slug}`}
                              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors group">
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                                style={{ background: tool.iconBg, color: tool.iconColor }}>
                                <ToolIcon slug={tool.slug} />
                              </span>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-dark transition-colors">
                                {tool.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </nav>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link href="#tools" className="btn-royal text-xs px-4 py-2 rounded-lg">
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden text-mute hover:text-ink p-2 rounded-lg hover:bg-line/60 transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-line overflow-y-auto max-h-[80vh]">
          {NAV_CATEGORIES.map((cat) => {
            const catTools = TOOLS.filter((t) => t.category === cat.key)
            const isExpanded = mobileExpanded === cat.key
            return (
              <div key={cat.key} className="border-b border-line">
                <button
                  onClick={() => setMobileExpanded(isExpanded ? null : cat.key)}
                  className="w-full flex items-center justify-between px-5 py-4"
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cat.color }}>
                    {cat.label}
                  </span>
                  <ChevronIcon open={isExpanded} />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3 grid grid-cols-2 gap-1">
                    {catTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/${tool.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-line/50 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: tool.iconBg, color: tool.iconColor }}>
                          <ToolIcon slug={tool.slug} size={12} />
                        </span>
                        <span className="text-sm text-ink font-medium">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </header>
  )
}

// ── Inline icon components ──────────────────────────────────────────────────

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronIcon({ open, small, groupHover }: { open: boolean; small?: boolean; groupHover?: string }) {
  const size = small ? 14 : 16
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 text-gray-400 ${open ? 'rotate-180' : ''} ${groupHover ?? ''}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ToolIcon({ slug, size = 14 }: { slug: string; size?: number }) {
  const s = size
  const icons: Record<string, React.ReactNode> = {
    'merge-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/><path d="M16 6h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
    'split-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>,
    'remove-pages': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><line x1="9" y1="11" x2="9" y2="17"/><line x1="15" y1="11" x2="15" y2="17"/></svg>,
    'organize-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    'compress-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>,
    'jpg-to-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    'word-to-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    'pdf-to-jpg': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="12 18 15 21 18 18"/><line x1="15" y1="12" x2="15" y2="21"/></svg>,
    'pdf-to-word': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    'rotate-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
    'watermark-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    'page-numbers': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>,
    'protect-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    'unlock-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
    'extract-pages': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/></svg>,
    'grayscale-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z"/></svg>,
    'repair-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    'html-to-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"/></svg>,
    'excel-to-pdf': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 6 6m0-6-6 6"/></svg>,
    'pdf-to-png': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    'compress-image': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    'resize-image': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>,
    'crop-image': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>,
    'convert-image': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    'pdf-editor': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>,
    'remove-background': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/><line x1="2" y1="2" x2="22" y2="22" strokeDasharray="3 3"/></svg>,
  }
  return <>{icons[slug] ?? <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>}</>
}
