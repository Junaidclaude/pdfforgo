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
    <footer className="bg-white border-t border-line pt-12 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="relative inline-flex w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
                <span className="absolute inset-0 bg-royal" />
                <span className="absolute -right-1 -bottom-1 w-4 h-4 rounded-md bg-ruby" />
                <span className="relative m-auto font-display font-bold text-white text-[13px] z-10">P</span>
              </span>
              <span className="font-display font-bold text-ink tracking-tight">PDFForge</span>
            </Link>
            <p className="text-mute text-sm leading-relaxed">
              Free online PDF tools. No signup, no limits, no watermarks.
              Your files stay on your device.
            </p>
          </div>

          {/* First 5 tools */}
          <div>
            <h2 className="text-ink font-semibold text-sm mb-4">PDF Tools</h2>
            <ul className="space-y-2.5">
              {TOOLS.slice(0, 5).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/${tool.slug}`}
                    className="text-mute hover:text-ink text-sm transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Last 5 tools */}
          <div>
            <h2 className="text-ink font-semibold text-sm mb-4">More Tools</h2>
            <ul className="space-y-2.5">
              {TOOLS.slice(5).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/${tool.slug}`}
                    className="text-mute hover:text-ink text-sm transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h2 className="text-ink font-semibold text-sm mb-4">Company</h2>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-mute hover:text-ink text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-line pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-mute text-xs">
            &copy; {year} PDFForge. All rights reserved.
          </p>
          <p className="text-mute text-xs">
            Made for the web. Totally free, forever.
          </p>
        </div>
      </div>
    </footer>
  )
}
