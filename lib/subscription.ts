'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'

export const FREE_DAILY_LIMIT = 10

// Auth is optional: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is inlined at build time,
// so this never changes across renders for a given deployment.
const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

interface ToolUsage {
  count: number
  date: string
}

interface UsageStore {
  [toolSlug: string]: ToolUsage
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function getUsageStore(): UsageStore {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem('pdfforge_usage') || '{}')
  } catch {
    return {}
  }
}

function getToolCount(slug: string): number {
  const store = getUsageStore()
  const entry = store[slug]
  if (!entry || entry.date !== todayStr()) return 0
  return entry.count
}

export function useSubscription(toolSlug: string) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user, isLoaded } = clerkEnabled ? useUser() : { user: undefined, isLoaded: true }
  const isPro = isLoaded && user?.publicMetadata?.plan === 'pro'
  const [usagesLeft, setUsagesLeft] = useState(FREE_DAILY_LIMIT)

  useEffect(() => {
    if (isPro) {
      setUsagesLeft(Infinity)
      return
    }
    setUsagesLeft(Math.max(0, FREE_DAILY_LIMIT - getToolCount(toolSlug)))
  }, [toolSlug, isPro])

  const trackUsage = useCallback((): boolean => {
    if (isPro) return true
    const today = todayStr()
    const store = getUsageStore()
    const current = store[toolSlug]?.date === today ? store[toolSlug].count : 0
    if (current >= FREE_DAILY_LIMIT) return false
    store[toolSlug] = { count: current + 1, date: today }
    localStorage.setItem('pdfforge_usage', JSON.stringify(store))
    setUsagesLeft(FREE_DAILY_LIMIT - current - 1)
    return true
  }, [toolSlug, isPro])

  return {
    isPro,
    isLoaded,
    usagesLeft: isPro ? Infinity : usagesLeft,
    trackUsage,
    canUseTool: isPro || usagesLeft > 0,
  }
}
