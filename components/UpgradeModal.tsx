'use client'

import { useRouter } from 'next/navigation'
import { FREE_DAILY_LIMIT } from '@/lib/subscription'

interface Props {
  toolName: string
  onClose: () => void
}

export default function UpgradeModal({ toolName, onClose }: Props) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <h2 className="font-display text-2xl font-bold text-ink mb-2">
          Daily limit reached
        </h2>
        <p className="text-mute mb-6">
          You&apos;ve used all {FREE_DAILY_LIMIT} free uses of <strong>{toolName}</strong> today.
          Upgrade to Pro for unlimited access to all tools.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
          {[
            'Unlimited uses on every tool',
            'No daily limits, ever',
            'Ad-free experience',
            'Priority processing',
            'Early access to new tools',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-ink">
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </div>
          ))}
        </div>

        <button
          onClick={() => { onClose(); router.push('/pricing') }}
          className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl py-3 hover:opacity-90 transition-opacity mb-3"
        >
          Upgrade to Pro — $9/mo
        </button>
        <button
          onClick={onClose}
          className="w-full text-mute text-sm py-2 hover:text-ink transition-colors"
        >
          Come back tomorrow for free uses
        </button>
      </div>
    </div>
  )
}
