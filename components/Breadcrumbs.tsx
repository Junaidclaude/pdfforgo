'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TOOLS } from '@/lib/tools'

const CATEGORY_HUB: Record<string, { label: string; href: string }> = {
  organize: { label: 'PDF Tools', href: '/pdf-tools' },
  optimize: { label: 'PDF Tools', href: '/pdf-tools' },
  'convert-to': { label: 'PDF Tools', href: '/pdf-tools' },
  'convert-from': { label: 'PDF Tools', href: '/pdf-tools' },
  edit: { label: 'PDF Tools', href: '/pdf-tools' },
  security: { label: 'PDF Tools', href: '/pdf-tools' },
  image: { label: 'Image Tools', href: '/image-tools' },
  video: { label: 'Tools', href: '/all-tools' },
  social: { label: 'Tools', href: '/all-tools' },
}

// Non-tool pages that still deserve a simple "Home / Page" breadcrumb rather
// than being skipped entirely.
const NAMED_PAGES: Record<string, string> = {
  '/all-tools': 'All Tools',
  '/pdf-tools': 'PDF Tools',
  '/image-tools': 'Image Tools',
  '/pricing': 'Pricing',
  '/about': 'About',
  '/contact': 'Contact',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  if (!pathname || pathname === '/') return null

  const slug = pathname.replace(/^\//, '').split('/')[0]
  const tool = TOOLS.find((t) => t.slug === slug)

  type Crumb = { name: string; href?: string }
  let crumbs: Crumb[]

  if (tool) {
    const hub = CATEGORY_HUB[tool.category]
    crumbs = [{ name: 'Home', href: '/' }, { name: hub.label, href: hub.href }, { name: tool.name }]
  } else if (NAMED_PAGES[pathname]) {
    crumbs = [{ name: 'Home', href: '/' }, { name: NAMED_PAGES[pathname] }]
  } else {
    return null
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `https://pdfforge.io${c.href}` } : {}),
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 pt-4">
        <ol className="flex items-center flex-wrap gap-1.5 text-xs text-mute">
          {crumbs.map((c, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-line">/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-ink transition-colors">{c.name}</Link>
              ) : (
                <span className="text-ink font-medium">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
