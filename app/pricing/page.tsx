'use client'

import { useUser, SignInButton } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function PricingContent() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const params = useSearchParams()
  const success = params.get('success')
  const canceled = params.get('canceled')

  const isPro = isLoaded && user?.publicMetadata?.plan === 'pro'
  const [loading, setLoading] = useState<'monthly' | 'annual' | 'portal' | null>(null)

  async function startCheckout(annual: boolean) {
    setLoading(annual ? 'annual' : 'monthly')
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ annual }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  async function openPortal() {
    setLoading('portal')
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  const FREE_FEATURES = [
    '10 uses per tool per day',
    'All 25+ tools included',
    'No signup required',
    'Browser-based processing',
  ]

  const PRO_FEATURES = [
    'Unlimited uses on every tool',
    'No daily limits, ever',
    'Ad-free experience',
    'Priority processing',
    'Early access to new tools',
    'Email support',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 font-medium">
              🎉 Welcome to Pro! Your unlimited access is now active.
            </div>
          )}
          {canceled && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-yellow-700 font-medium">
              Checkout canceled. You&apos;re still on the free plan.
            </div>
          )}
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-mute text-lg">
            All tools free forever. Upgrade for unlimited access.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">

          {/* Free */}
          <div className="bg-white rounded-3xl border border-line p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-semibold text-mute uppercase tracking-wider mb-2">Free</p>
              <div className="flex items-end gap-1">
                <span className="font-display text-5xl font-bold text-ink">$0</span>
                <span className="text-mute mb-2">/month</span>
              </div>
              <p className="text-mute text-sm mt-2">No credit card needed</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-ink">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push('/')}
              className="w-full border border-line rounded-xl py-3 text-sm font-semibold text-ink hover:bg-gray-50 transition-colors"
            >
              Use free tools
            </button>
          </div>

          {/* Pro */}
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-8 flex flex-col text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
              Most popular
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Pro</p>
              <div className="flex items-end gap-1">
                <span className="font-display text-5xl font-bold">$9</span>
                <span className="text-white/70 mb-2">/month</span>
              </div>
              <p className="text-white/70 text-sm mt-2">Or $79/year — save 27%</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {!isLoaded ? (
              <div className="w-full bg-white/30 rounded-xl py-3 animate-pulse" />
            ) : isPro ? (
              <div className="space-y-3">
                <div className="w-full bg-white/20 rounded-xl py-3 text-center text-sm font-semibold">
                  ✓ You&apos;re on Pro
                </div>
                <button
                  onClick={openPortal}
                  disabled={loading === 'portal'}
                  className="w-full bg-white/20 hover:bg-white/30 rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading === 'portal' ? 'Loading…' : 'Manage subscription'}
                </button>
              </div>
            ) : isSignedIn ? (
              <div className="space-y-3">
                <button
                  onClick={() => startCheckout(false)}
                  disabled={!!loading}
                  className="w-full bg-white text-red-600 font-semibold rounded-xl py-3 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {loading === 'monthly' ? 'Redirecting…' : 'Subscribe monthly — $9'}
                </button>
                <button
                  onClick={() => startCheckout(true)}
                  disabled={!!loading}
                  className="w-full bg-white/20 hover:bg-white/30 rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading === 'annual' ? 'Redirecting…' : 'Subscribe annually — $79'}
                </button>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full bg-white text-red-600 font-semibold rounded-xl py-3 hover:bg-red-50 transition-colors">
                  Sign in to upgrade
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16 space-y-4">
          <h2 className="font-display text-2xl font-bold text-ink text-center mb-8">
            Frequently asked questions
          </h2>
          {[
            {
              q: 'What counts as a "use"?',
              a: 'Each file you process counts as one use. For example, downloading a compressed PDF uses one credit. Batch operations count once per file processed.',
            },
            {
              q: 'Do free uses reset every day?',
              a: 'Yes. Free uses reset at midnight UTC every day. You get 10 free uses per tool per day.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. Cancel anytime from the billing portal — no questions asked. You keep Pro access until the end of the billing period.',
            },
            {
              q: 'Is my data safe?',
              a: 'All processing happens in your browser. We never upload your files to any server.',
            },
          ].map(({ q, a }) => (
            <details key={q} className="group bg-white rounded-2xl border border-line p-5 cursor-pointer">
              <summary className="font-semibold text-ink flex items-center justify-between list-none">
                {q}
                <svg className="w-4 h-4 text-mute group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-mute text-sm mt-3">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  )
}
