import Link from 'next/link'
import type { Tool } from '@/lib/tools'

interface ToolCardProps {
  tool: Tool
  featured?: boolean
}

export default function ToolCard({ tool, featured = false }: ToolCardProps) {
  return (
    <Link href={`/${tool.slug}`} className="group block h-full">
      <article
        className={[
          'relative h-full flex flex-col rounded-2xl bg-white p-6 border border-gray-100',
          'shadow-card transition-all duration-300',
          'hover:shadow-card-hover hover:-translate-y-1 hover:border-gray-200',
          'overflow-hidden',
        ].join(' ')}
      >
        {/* Subtle accent wash on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ backgroundColor: tool.iconBg }}
        />

        {/* Featured badge */}
        {featured && (
          <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-500">
            <svg
              className="w-2.5 h-2.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.957c.3.922-.755 1.688-1.539 1.118l-3.366-2.445a1 1 0 00-1.176 0l-3.366 2.445c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
            </svg>
            Popular
          </span>
        )}

        {/* Icon */}
        <div
          className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]"
          style={{ backgroundColor: tool.iconBg }}
          aria-hidden="true"
        >
          <ToolIcon slug={tool.slug} color={tool.iconColor} />
        </div>

        {/* Text */}
        <h3 className="relative font-syne font-extrabold text-dark text-base mb-1.5 tracking-tight">
          {tool.name}
        </h3>
        <p className="relative text-gray-500 text-sm leading-relaxed flex-1">
          {tool.shortDesc}
        </p>

        {/* CTA */}
        <div
          className="relative flex items-center gap-1.5 mt-5 text-xs font-semibold transition-all"
          style={{ color: tool.iconColor }}
        >
          <span className="transition-transform duration-200 group-hover:translate-x-0">
            Open tool
          </span>
          <svg
            className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
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
        </div>
      </article>
    </Link>
  )
}

function ToolIcon({ slug, color }: { slug: string; color: string }) {
  const shared = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24' as const,
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  switch (slug) {
    case 'merge-pdf':
      return (
        <svg {...shared}>
          <path d="M8 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" />
          <path d="M14 2H10a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6l-4-4z" />
          <polyline points="14 2 14 6 18 6" />
        </svg>
      )
    case 'split-pdf':
      return (
        <svg {...shared}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="12" y1="10" x2="12" y2="16" />
        </svg>
      )
    case 'compress-pdf':
      return (
        <svg {...shared}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <polyline points="8 17 12 13 16 17" />
          <line x1="12" y1="13" x2="12" y2="20" />
        </svg>
      )
    case 'pdf-to-word':
      return (
        <svg {...shared}>
          <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
          <path d="M8 7l2 10 2-6 2 6 2-10" />
        </svg>
      )
    case 'pdf-to-jpg':
      return (
        <svg {...shared}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      )
    case 'jpg-to-pdf':
      return (
        <svg {...shared}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <polyline points="8 14 10 16 14 12" />
        </svg>
      )
    case 'rotate-pdf':
      return (
        <svg {...shared}>
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      )
    case 'watermark-pdf':
      return (
        <svg {...shared}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      )
    case 'protect-pdf':
      return (
        <svg {...shared}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    case 'unlock-pdf':
      return (
        <svg {...shared}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      )
    case 'html-to-pdf':
      return (
        <svg {...shared}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m9 18-2-2 2-2" />
          <path d="m15 14 2 2-2 2" />
        </svg>
      )
    case 'word-to-pdf':
      return (
        <svg {...shared}>
          <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
          <path d="M6 7l1.5 8L9 9l1.5 6L12 7" />
          <path d="M16 7v8" />
          <path d="M16 11h3" />
          <path d="M16 7h3" />
        </svg>
      )
    case 'youtube-transcript':
      return (
        <svg {...shared}>
          <rect x="2" y="5" width="14" height="14" rx="2" />
          <path d="m10 9 4 3-4 3z" fill={color} stroke="none" />
          <path d="M18 8h4M18 12h4M18 16h2" />
        </svg>
      )
    case 'youtube-thumbnail-downloader':
      return (
        <svg {...shared}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="m21 15-5-4-4 3-3-2-6 5" />
        </svg>
      )
    case 'caption-character-counter':
      return (
        <svg {...shared}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 9h10M7 13h6" />
        </svg>
      )
    case 'hashtag-generator':
      return (
        <svg {...shared}>
          <path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18" />
        </svg>
      )
    default:
      return (
        <svg {...shared}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
  }
}
