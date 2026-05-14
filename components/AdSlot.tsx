'use client'

import { useEffect, useState } from 'react'

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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !pubId || !slot) return
    try {
      ;((window as unknown as Record<string, unknown[]>).adsbygoogle =
        (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({})
    } catch {
      // AdSense script not yet loaded — will init on next render cycle
    }
  }, [mounted, pubId, slot])

  // Render nothing until mounted (prevents SSR/hydration mismatch with <ins>)
  if (!mounted || !pubId || !slot) return null

  return (
    <div className={`w-full py-2 ${className}`} aria-label="Advertisement">
      <p className="text-center text-[10px] text-gray-400 mb-1 uppercase tracking-wider select-none">
        {config.label}
      </p>
      <ins
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
