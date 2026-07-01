'use client'

import { useState } from 'react'
import AdSlot from '@/components/AdSlot'
import { generateHashtags, HASHTAG_NICHES } from '@/lib/hashtags'

export default function HashtagGeneratorTool() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<{ niche: string | null; tags: string[] } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const { niche, tags } = generateHashtags(query)
    setResult({ niche: niche?.label ?? null, tags })
    setSelected(new Set(tags))
  }

  const toggle = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag); else next.add(tag)
      return next
    })
  }

  const copySelected = async () => {
    const text = [...selected].map((t) => `#${t}`).join(' ')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a topic or keyword, e.g. travel, coffee, fitness…"
          className="flex-1 border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          Generate Hashtags
        </button>
      </form>
      <p className="text-xs text-mute mb-6">
        Try: {HASHTAG_NICHES.slice(0, 6).map((n) => n.label).join(' · ')}
      </p>

      {result && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-mute">
              {result.niche ? <>Matched niche: <span className="font-semibold text-ink">{result.niche}</span></> : 'No exact niche match — showing generic + keyword-derived tags.'}
              {' '}· {selected.size} selected
            </p>
            <button onClick={copySelected}
              className="text-sm font-semibold border border-line rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
              {copied ? 'Copied ✓' : 'Copy selected'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border border-line rounded-2xl p-5 bg-white">
            {result.tags.map((tag) => {
              const active = selected.has(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggle(tag)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    active ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-line text-gray-600 hover:border-purple-300'
                  }`}
                >
                  #{tag}
                </button>
              )
            })}
          </div>

          <p className="text-xs text-mute text-center">Click a hashtag to include/exclude it, then copy your selection.</p>
        </div>
      )}

      <div className="mt-10"><AdSlot position="footer" /></div>
    </div>
  )
}
