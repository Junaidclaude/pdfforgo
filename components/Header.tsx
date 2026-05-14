'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TOOLS, NAV_CATEGORIES } from '@/lib/tools'

// Tools shown directly in the top nav bar (most popular)
const TOP_NAV_TOOLS = ['merge-pdf', 'split-pdf', 'compress-pdf']

const PDF_CATEGORIES = NAV_CATEGORIES.filter((c) => c.key !== 'image')

export default function Header() {
  const [megaOpen, setMegaOpen] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [imgOpen, setImgOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const pathname = usePathname()
  const megaRef = useRef<HTMLDivElement>(null)
  const pdfRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  // Close all dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false)
      if (pdfRef.current && !pdfRef.current.contains(e.target as Node)) setPdfOpen(false)
      if (imgRef.current && !imgRef.current.contains(e.target as Node)) setImgOpen(false)
    }
    if (megaOpen || pdfOpen || imgOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [megaOpen, pdfOpen, imgOpen])

  // Close all dropdowns on route change
  useEffect(() => {
    setMobileOpen(false); setMegaOpen(false); setPdfOpen(false); setImgOpen(false)
  }, [pathname])

  const openPdf  = () => { setPdfOpen((v) => !v); setImgOpen(false); setMegaOpen(false) }
  const openImg  = () => { setImgOpen((v) => !v); setPdfOpen(false); setMegaOpen(false) }
  const openMega = () => { setMegaOpen((v) => !v); setPdfOpen(false); setImgOpen(false) }

  const topNavTools = TOOLS.filter((t) => TOP_NAV_TOOLS.includes(t.slug))

  return (
    <header className="bg-dark border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group shrink-0"
          aria-label="PDFForge home"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:opacity-90 transition-opacity">
            <FileIcon />
          </div>
          <span className="font-syne font-extrabold text-xl text-white">
            PDF<span className="text-primary">Forge</span>
          </span>
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
                  ? 'text-white bg-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tool.name}
            </Link>
          ))}

          {/* ── PDF Tools dropdown ── */}
          <div ref={pdfRef} className="relative">
            <button
              onClick={openPdf}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pdfOpen ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              aria-expanded={pdfOpen}
              aria-haspopup="true"
            >
              PDF Tools
              <ChevronIcon open={pdfOpen} />
            </button>
            {pdfOpen && (
              <div className="absolute top-full left-0 mt-2 w-[640px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 grid grid-cols-2 gap-5 animate-fade-in">
                {PDF_CATEGORIES.map((cat) => {
                  const catTools = TOOLS.filter((t) => t.category === cat.key)
                  return (
                    <div key={cat.key}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: cat.color }}>{cat.label}</p>
                      <ul className="space-y-0.5">
                        {catTools.map((tool) => (
                          <li key={tool.slug}>
                            <Link href={`/${tool.slug}`} onClick={() => setPdfOpen(false)}
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
            )}
          </div>

          {/* ── Image Tools dropdown ── */}
          <div ref={imgRef} className="relative">
            <button
              onClick={openImg}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                imgOpen ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              aria-expanded={imgOpen}
              aria-haspopup="true"
            >
              Image Tools
              <ChevronIcon open={imgOpen} />
            </button>
            {imgOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 animate-fade-in">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mb-2 px-2">Image Tools</p>
                <ul className="space-y-0.5">
                  {TOOLS.filter((t) => t.category === 'image').map((tool) => (
                    <li key={tool.slug}>
                      <Link href={`/${tool.slug}`} onClick={() => setImgOpen(false)}
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
            )}
          </div>

          {/* ── ALL TOOLS mega menu ── */}
          <div ref={megaRef} className="relative">
            <button
              onClick={openMega}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                megaOpen ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              <span className="text-primary font-bold">ALL TOOLS</span>
              <ChevronIcon open={megaOpen} />
            </button>

            {/* Mega dropdown */}
            {megaOpen && (
              <div className="absolute top-full left-0 mt-2 w-[1100px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 grid grid-cols-4 gap-6 animate-fade-in">
                {NAV_CATEGORIES.map((cat) => {
                  const catTools = TOOLS.filter((t) => t.category === cat.key)
                  return (
                    <div key={cat.key}>
                      <p
                        className="text-[11px] font-bold uppercase tracking-widest mb-3"
                        style={{ color: cat.color }}
                      >
                        {cat.label}
                      </p>
                      <ul className="space-y-0.5">
                        {catTools.map((tool) => (
                          <li key={tool.slug}>
                            <Link
                              href={`/${tool.slug}`}
                              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                              onClick={() => setMegaOpen(false)}
                            >
                              <span
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                                style={{ background: tool.iconBg, color: tool.iconColor }}
                              >
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
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
          >
            All Tools
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0d1117] border-t border-white/5 overflow-y-auto max-h-[80vh]">
          {NAV_CATEGORIES.map((cat) => {
            const catTools = TOOLS.filter((t) => t.category === cat.key)
            const isExpanded = mobileExpanded === cat.key
            return (
              <div key={cat.key} className="border-b border-white/5">
                <button
                  onClick={() => setMobileExpanded(isExpanded ? null : cat.key)}
                  className="w-full flex items-center justify-between px-5 py-4"
                >
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: cat.color }}
                  >
                    {cat.label}
                  </span>
                  <ChevronIcon open={isExpanded} small />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3 grid grid-cols-2 gap-1">
                    {catTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/${tool.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: tool.iconBg, color: tool.iconColor }}
                        >
                          <ToolIcon slug={tool.slug} size={12} />
                        </span>
                        <span className="text-sm text-gray-300 font-medium">{tool.name}</span>
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

function ChevronIcon({ open, small }: { open: boolean; small?: boolean }) {
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
      className={`transition-transform duration-200 text-gray-400 ${open ? 'rotate-180' : ''}`}
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
  }
  return <>{icons[slug] ?? <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>}</>
}
