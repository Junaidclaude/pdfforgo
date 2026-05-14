import Link from 'next/link'
import { TOOLS } from '@/lib/tools'

const COMPANY_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-dark border-t border-white/5 pt-12 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <span className="font-syne font-extrabold text-white">
                PDF<span className="text-primary">Forge</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Free online PDF tools. No signup, no limits, no watermarks.
              Your files stay on your device.
            </p>
          </div>

          {/* First 5 tools */}
          <div>
            <h2 className="text-white font-medium text-sm mb-4">PDF Tools</h2>
            <ul className="space-y-2.5">
              {TOOLS.slice(0, 5).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/${tool.slug}`}
                    className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Last 5 tools */}
          <div>
            <h2 className="text-white font-medium text-sm mb-4">More Tools</h2>
            <ul className="space-y-2.5">
              {TOOLS.slice(5).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/${tool.slug}`}
                    className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h2 className="text-white font-medium text-sm mb-4">Company</h2>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            &copy; {year} PDFForge. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Made with ❤️ for the web. Totally free, forever.
          </p>
        </div>
      </div>
    </footer>
  )
}
