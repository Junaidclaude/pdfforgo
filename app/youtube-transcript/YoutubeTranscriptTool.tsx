'use client'

import { useState, useCallback } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'loading' | 'done' | 'error'

interface TranscriptLine {
  start: number
  duration: number
  text: string
}

interface Language {
  languageCode: string
  name: string
  auto: boolean
}

interface Result {
  videoId: string
  title: string
  author: string
  thumbnail: string
  availableLanguages: Language[]
  selectedLanguage: string
  transcript: TranscriptLine[]
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatSrtTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000)
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`
}

function toSrt(transcript: TranscriptLine[]) {
  return transcript
    .map((t, i) => `${i + 1}\n${formatSrtTime(t.start)} --> ${formatSrtTime(t.start + t.duration)}\n${t.text}\n`)
    .join('\n')
}

function toTxt(transcript: TranscriptLine[], withTimestamps: boolean) {
  if (!withTimestamps) return transcript.map((t) => t.text).join(' ')
  return transcript.map((t) => `[${formatTime(t.start)}] ${t.text}`).join('\n')
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5_000)
}

export default function YoutubeTranscriptTool() {
  const [urlInput, setUrlInput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [copied, setCopied] = useState(false)

  const fetchTranscript = useCallback(async (url: string, lang?: string) => {
    setStatus('loading'); setError('')
    try {
      const res = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, lang }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `Server error ${res.status}`)
      setResult(json)
      setStatus('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setStatus('error')
    }
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return
    fetchTranscript(urlInput.trim())
  }

  const onLanguageChange = (lang: string) => {
    if (!result) return
    fetchTranscript(urlInput.trim(), lang)
  }

  const copyTranscript = async () => {
    if (!result) return
    await navigator.clipboard.writeText(toTxt(result.transcript, showTimestamps))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setStatus('idle'); setResult(null); setError(''); setUrlInput('')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* URL input */}
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
          disabled={status === 'loading' || !urlInput.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          {status === 'loading' ? 'Fetching…' : 'Get Transcript'}
        </button>
      </form>
      <p className="text-xs text-mute mb-6">Works with any public YouTube video that already has captions (auto-generated or manual).</p>

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium text-center mb-6">
          {error}
        </div>
      )}

      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-12 h-12 rounded-full border-4 border-red-100 border-t-red-500 animate-spin" />
          <p className="text-mute text-sm">Fetching captions from YouTube…</p>
        </div>
      )}

      {status === 'done' && result && (
        <div className="space-y-5">
          {/* Video info */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.thumbnail} alt="" className="w-28 h-16 rounded-lg object-cover flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-display font-bold text-ink truncate">{result.title || 'Untitled video'}</p>
              {result.author && <p className="text-mute text-sm truncate">{result.author}</p>}
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3">
            {result.availableLanguages.length > 1 && (
              <select
                value={result.selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="border border-line rounded-lg px-3 py-2 text-sm bg-white"
              >
                {result.availableLanguages.map((l) => (
                  <option key={l.languageCode} value={l.languageCode}>
                    {l.name}{l.auto ? ' (auto)' : ''}
                  </option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2 text-sm text-mute cursor-pointer select-none">
              <input type="checkbox" checked={showTimestamps} onChange={(e) => setShowTimestamps(e.target.checked)} />
              Show timestamps
            </label>

            <div className="flex-1" />

            <button onClick={copyTranscript}
              className="text-sm font-semibold border border-line rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
            <button
              onClick={() => download(`${result.videoId}.txt`, toTxt(result.transcript, showTimestamps), 'text/plain')}
              className="text-sm font-semibold border border-line rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
              Download .txt
            </button>
            <button
              onClick={() => download(`${result.videoId}.srt`, toSrt(result.transcript), 'text/plain')}
              className="text-sm font-semibold border border-line rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
              Download .srt
            </button>
          </div>

          {/* Transcript */}
          <div className="border border-line rounded-2xl max-h-[28rem] overflow-y-auto p-5 bg-white space-y-2.5">
            {result.transcript.map((line, i) => (
              <p key={i} className="text-sm text-ink leading-relaxed">
                {showTimestamps && (
                  <span className="text-red-500 font-mono text-xs mr-2 select-none">[{formatTime(line.start)}]</span>
                )}
                {line.text}
              </p>
            ))}
          </div>

          <button onClick={reset}
            className="w-full border border-line text-gray-600 hover:text-ink hover:border-gray-300 font-semibold py-3 rounded-xl text-sm transition-colors">
            Transcribe another video
          </button>
        </div>
      )}

      <div className="mt-10"><AdSlot position="footer" /></div>
    </div>
  )
}
