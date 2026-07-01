'use client'

import { useMemo, useState } from 'react'
import AdSlot from '@/components/AdSlot'

interface Platform {
  key: string
  label: string
  limit: number
  visibleBeforeMore?: number
  color: string
  note?: string
}

const PLATFORMS: Platform[] = [
  { key: 'x', label: 'X (Twitter) Post', limit: 280, color: '#000000' },
  { key: 'instagram-caption', label: 'Instagram Caption', limit: 2200, visibleBeforeMore: 125, color: '#E1306C' },
  { key: 'instagram-bio', label: 'Instagram Bio', limit: 150, color: '#E1306C' },
  { key: 'tiktok', label: 'TikTok Caption', limit: 2200, visibleBeforeMore: 150, color: '#000000' },
  { key: 'youtube-title', label: 'YouTube Title', limit: 100, color: '#DC2626' },
  { key: 'youtube-description', label: 'YouTube Description', limit: 5000, color: '#DC2626' },
  { key: 'facebook', label: 'Facebook Post', limit: 63206, visibleBeforeMore: 477, color: '#1877F2' },
  { key: 'linkedin', label: 'LinkedIn Post', limit: 3000, visibleBeforeMore: 210, color: '#0A66C2' },
]

function barColor(count: number, limit: number) {
  const pct = count / limit
  if (pct > 1) return '#EF4444'
  if (pct > 0.9) return '#F59E0B'
  return '#22C55E'
}

export default function CaptionCounterTool() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const chars = [...text].length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const hashtags = (text.match(/#[\w]+/g) || []).length
    const mentions = (text.match(/@[\w]+/g) || []).length
    return { chars, words, hashtags, mentions }
  }, [text])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your caption here…"
          rows={6}
          className="w-full border border-line rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-3 mb-8 text-xs text-mute">
        <span><span className="font-bold text-ink">{stats.chars}</span> characters</span>
        <span><span className="font-bold text-ink">{stats.words}</span> words</span>
        <span><span className="font-bold text-ink">{stats.hashtags}</span> hashtags</span>
        <span><span className="font-bold text-ink">{stats.mentions}</span> mentions</span>
        {text && (
          <button onClick={() => setText('')} className="text-red-500 hover:text-red-600 font-semibold ml-auto">Clear</button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map((p) => {
          const over = stats.chars > p.limit
          const pct = Math.min(100, (stats.chars / p.limit) * 100)
          return (
            <div key={p.key} className="border border-line rounded-2xl p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-ink text-sm">{p.label}</p>
                <p className={`text-xs font-bold ${over ? 'text-red-600' : 'text-mute'}`}>
                  {stats.chars.toLocaleString()} / {p.limit.toLocaleString()}
                </p>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor(stats.chars, p.limit) }} />
              </div>
              {over ? (
                <p className="text-xs text-red-600 font-medium">{(stats.chars - p.limit).toLocaleString()} characters over the limit</p>
              ) : p.visibleBeforeMore && stats.chars > p.visibleBeforeMore ? (
                <p className="text-xs text-amber-600">Truncated after {p.visibleBeforeMore} chars — rest hidden behind &quot;more&quot;</p>
              ) : (
                <p className="text-xs text-mute">{(p.limit - stats.chars).toLocaleString()} characters left</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-10"><AdSlot position="footer" /></div>
    </div>
  )
}
