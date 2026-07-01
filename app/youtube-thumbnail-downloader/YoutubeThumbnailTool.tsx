'use client'

import { useState } from 'react'
import AdSlot from '@/components/AdSlot'

interface Resolution {
  key: string
  label: string
  dims: string
}

const RESOLUTIONS: Resolution[] = [
  { key: 'maxresdefault', label: 'Max Resolution (HD)', dims: '1280 × 720' },
  { key: 'sddefault', label: 'Standard Definition', dims: '640 × 480' },
  { key: 'hqdefault', label: 'High Quality', dims: '480 × 360' },
  { key: 'mqdefault', label: 'Medium Quality', dims: '320 × 180' },
  { key: 'default', label: 'Default', dims: '120 × 90' },
]

function extractVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  try {
    const u = new URL(trimmed)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v')
      const m = u.pathname.match(/\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/)
      if (m) return m[2]
    }
  } catch {
    // not a URL
  }
  return null
}

export default function YoutubeThumbnailTool() {
  const [urlInput, setUrlInput] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [broken, setBroken] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState<string | null>(null)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = extractVideoId(urlInput.trim())
    if (!id) { setError('Could not find a valid YouTube video ID in that link.'); setVideoId(null); return }
    setError(''); setBroken(new Set()); setVideoId(id)
  }

  const download = async (res: Resolution) => {
    if (!videoId) return
    setDownloading(res.key)
    try {
      const url = `https://i.ytimg.com/vi/${videoId}/${res.key}.jpg`
      const blob = await (await fetch(url)).blob()
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl; a.download = `${videoId}-${res.key}.jpg`; a.click()
      setTimeout(() => URL.revokeObjectURL(objUrl), 5_000)
    } catch {
      setError('Could not download that image. Try a different resolution.')
    } finally {
      setDownloading(null)
    }
  }

  const reset = () => { setVideoId(null); setUrlInput(''); setError(''); setBroken(new Set()) }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 mb-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste a YouTube video URL…"
          className="flex-1 border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
        />
        <button
          type="submit"
          disabled={!urlInput.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          Get Thumbnails
        </button>
      </form>
      <p className="text-xs text-mute mb-6">Every resolution YouTube stores for this video, from thumbnail to full HD.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium text-center mb-6">
          {error}
        </div>
      )}

      {videoId && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RESOLUTIONS.filter((r) => !broken.has(r.key)).map((res) => (
              <div key={res.key} className="border border-line rounded-2xl overflow-hidden bg-white">
                <div className="bg-gray-100" style={{ aspectRatio: '16 / 9' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${videoId}/${res.key}.jpg`}
                    alt={res.label}
                    className="w-full h-full object-contain"
                    onError={() => setBroken((prev) => new Set(prev).add(res.key))}
                    onLoad={(e) => {
                      // YouTube serves a decodable 120×90 grey placeholder even
                      // on a 404 for resolutions that don't exist for this video,
                      // so onError never fires for it — detect it by size instead.
                      const img = e.currentTarget
                      if (res.key !== 'default' && img.naturalWidth === 120 && img.naturalHeight === 90) {
                        setBroken((prev) => new Set(prev).add(res.key))
                      }
                    }}
                  />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ink text-sm">{res.label}</p>
                    <p className="text-mute text-xs">{res.dims}</p>
                  </div>
                  <button
                    onClick={() => download(res)}
                    disabled={downloading === res.key}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    {downloading === res.key ? 'Downloading…' : 'Download'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={reset}
            className="w-full border border-line text-gray-600 hover:text-ink hover:border-gray-300 font-semibold py-3 rounded-xl text-sm transition-colors">
            Try another video
          </button>
        </div>
      )}

      <div className="mt-10"><AdSlot position="footer" /></div>
    </div>
  )
}
