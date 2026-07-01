import Link from 'next/link'

const COLS = [
  {
    heading: 'PDF Tools',
    links: [
      { href: '/merge-pdf', label: 'Merge PDF' },
      { href: '/split-pdf', label: 'Split PDF' },
      { href: '/compress-pdf', label: 'Compress PDF' },
      { href: '/remove-pages', label: 'Remove Pages' },
      { href: '/rotate-pdf', label: 'Rotate PDF' },
      { href: '/pdf-editor', label: 'PDF Editor' },
    ],
  },
  {
    heading: 'Convert to PDF',
    links: [
      { href: '/word-to-pdf', label: 'Word to PDF' },
      { href: '/jpg-to-pdf', label: 'JPG to PDF' },
      { href: '/html-to-pdf', label: 'HTML to PDF' },
      { href: '/excel-to-pdf', label: 'Excel to PDF' },
      { href: '/protect-pdf', label: 'Protect PDF' },
      { href: '/unlock-pdf', label: 'Unlock PDF' },
    ],
  },
  {
    heading: 'Convert from PDF',
    links: [
      { href: '/pdf-to-word', label: 'PDF to Word' },
      { href: '/pdf-to-jpg', label: 'PDF to JPG' },
      { href: '/pdf-to-png', label: 'PDF to PNG' },
      { href: '/watermark-pdf', label: 'Watermark PDF' },
      { href: '/page-numbers', label: 'Add Page Numbers' },
      { href: '/grayscale-pdf', label: 'Grayscale PDF' },
    ],
  },
  {
    heading: 'Image Tools',
    links: [
      { href: '/compress-image', label: 'Compress Image' },
      { href: '/edit-resize-image', label: 'Edit & Resize Image' },
      { href: '/bg-remover', label: 'BG Remover' },
      { href: '/crop-image', label: 'Crop Image' },
      { href: '/blur-face', label: 'Blur Face' },
      { href: '/convert-image', label: 'Convert Image' },
    ],
  },
]

const SOCIAL = [
  {
    label: 'Twitter / X',
    href: 'https://x.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#1a1d23' }} className="text-gray-400 pt-14 pb-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Top: brand + 4 tool columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="relative inline-flex w-7 h-7 rounded-lg overflow-hidden shrink-0">
                <span className="absolute inset-0 bg-royal" />
                <span className="absolute -right-1 -bottom-1 w-4 h-4 rounded-md bg-ruby" />
                <span className="relative m-auto font-display font-bold text-white text-[13px] z-10">P</span>
              </span>
              <span className="font-display font-bold text-white tracking-tight">PDFForge</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Free PDF &amp; image tools.<br />No signup. No watermarks.<br />Your files stay private.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 flex-wrap">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* 4 tool columns */}
          {COLS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            &copy; {year} PDFForge. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Terms</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
