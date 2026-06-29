'use client'

import { useEffect, useRef, useState } from 'react'

export type AdPosition = 'header' | 'sidebar' | 'pre_download' | 'footer'

interface AdSlotProps {
  position: AdPosition
  className?: string
}

const AD_CONFIG: Record<
  AdPosition,
  { slotEnvKey: string; minHeight: number; label: string; format: string }
> = {
  header: {
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_HEADER',
    minHeight: 90,
    label: 'Advertisement',
    format: 'auto',
  },
  sidebar: {
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR',
    minHeight: 250,
    label: 'Advertisement',
    format: 'auto',
  },
  pre_download: {
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_PRE_DOWNLOAD',
    minHeight: 280,
    label: 'Advertisement',
    format: 'auto',
  },
  footer: {
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_FOOTER',
    minHeight: 90,
    label: 'Advertisement',
    format: 'auto',
  },
}

const ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_ADSENSE_SLOT_HEADER:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER,
  NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  NEXT_PUBLIC_ADSENSE_SLOT_PRE_DOWNLOAD:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_PRE_DOWNLOAD,
  NEXT_PUBLIC_ADSENSE_SLOT_FOOTER:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
}

export default function AdSlot({ position, className = '' }: AdSlotProps) {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID
  const config = AD_CONFIG[position]
  const slot = ENV[config.slotEnvKey]
  const [mounted, setMounted] = useState(false)
  const insRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Suppress the "No slot size for availableWidth=0" TagError globally —
  // AdSense throws it as a non-cancellable window error, not a JS exception,
  // so the try/catch below alone isn't enough in all browsers.
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      if (
        typeof event.message === 'string' &&
        (event.message.includes('adsbygoogle') || event.message.includes('No slot size'))
      ) {
        event.preventDefault()
        event.stopImmediatePropagation()
      }
    }
    window.addEventListener('error', handler)
    return () => window.removeEventListener('error', handler)
  }, [])

  useEffect(() => {
    if (!mounted || !pubId || !slot) return
    // Defer until after layout so the <ins> element has a measured width.
    // If the container is hidden / zero-width, skip the push entirely.
    const raf = requestAnimationFrame(() => {
      const el = insRef.current
      if (!el || el.offsetWidth === 0) return
      // Guard against double-push (AdSense sets data-adsbygoogle-status after init)
      if (el.getAttribute('data-adsbygoogle-status')) return
      try {
        ;((window as unknown as Record<string, unknown[]>).adsbygoogle =
          (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({})
      } catch {
        // Swallow TagError — slot will be retried on next navigation
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [mounted, pubId, slot])

  // Render nothing until mounted (prevents SSR/hydration mismatch with <ins>)
  if (!mounted || !pubId || !slot) return null

  return (
    <div className={`w-full py-2 ${className}`} aria-label="Advertisement">
      <p className="text-center text-[10px] text-gray-400 mb-1 uppercase tracking-wider select-none">
        {config.label}
      </p>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: config.minHeight }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format={config.format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
