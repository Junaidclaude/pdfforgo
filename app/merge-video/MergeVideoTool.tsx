'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type VideoEntry = {
  id: string
  file: File
  name: string
  size: number
  duration: number | null
  objectUrl: string
  thumbnail: string | null
}

const fmtSize = (b: number) => {
  if (b >= 1073741824) return `${(b / 1073741824).toFixed(1)} GB`
  if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`
  return `${(b / 1024).toFixed(1)} KB`
}
const fmtDur = (s: number | null) => {
  if (!s || !isFinite(s)) return '--:--'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${m}:${String(sec).padStart(2,'0')}`
}

export default function MergeVideoTool() {
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [merging, setMerging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultSize, setResultSize] = useState(0)
  const [ffLoading, setFfLoading] = useState(true)
  const [ffLoaded, setFfLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dropActive, setDropActive] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const ffRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<string | null>(null)

  useEffect(() => {
    initFF()
    return () => {
      videos.forEach(v => URL.revokeObjectURL(v.objectUrl))
      if (resultRef.current) URL.revokeObjectURL(resultRef.current)
    }
  }, [])

  const initFF = async () => {
    if (ffRef.current) return
    setFfLoading(true)
    setError(null)
    try {
      // 1. Verify the core file is actually reachable
      const probe = await fetch('/ffmpeg/ffmpeg-core.js', { method: 'HEAD' })
      if (!probe.ok) throw new Error(`FFmpeg core file not found (HTTP ${probe.status}). Run: node scripts/copy-ffmpeg.js`)

      // 2. Dynamic import — handle both ESM and CJS interop
      const mod: any = await import('@ffmpeg/ffmpeg')
      const createFFmpeg: any = mod.createFFmpeg ?? mod.default?.createFFmpeg
      if (typeof createFFmpeg !== 'function') {
        throw new Error('createFFmpeg not exported from @ffmpeg/ffmpeg. Check package version.')
      }

      // 3. Load the WASM core (24 MB local file)
      const ff = createFFmpeg({ corePath: '/ffmpeg/ffmpeg-core.js', log: false })
      await ff.load()

      ffRef.current = ff
      setFfLoaded(true)
    } catch (e: any) {
      console.error('[FFmpeg init]', e)
      setError(e?.message ?? 'Failed to load video engine.')
    }
    setFfLoading(false)
  }

  const captureThumbnail = (url: string): Promise<string | null> =>
    new Promise(resolve => {
      const vid = document.createElement('video')
      vid.muted = true; vid.preload = 'metadata'; vid.src = url
      let settled = false
      const done = (r: string | null) => { if (!settled) { settled = true; resolve(r) } }
      const t = setTimeout(() => done(null), 8000)
      vid.addEventListener('loadeddata', () => { vid.currentTime = 0.5 }, { once: true })
      vid.addEventListener('seeked', () => {
        clearTimeout(t)
        try {
          const c = document.createElement('canvas')
          c.width = 160; c.height = 90
          c.getContext('2d')?.drawImage(vid, 0, 0, 160, 90)
          done(c.toDataURL('image/jpeg', 0.75))
        } catch { done(null) }
      }, { once: true })
      vid.addEventListener('error', () => { clearTimeout(t); done(null) }, { once: true })
      vid.load()
    })

  const getDuration = (url: string): Promise<number | null> =>
    new Promise(resolve => {
      const vid = document.createElement('video')
      vid.preload = 'metadata'; vid.src = url
      vid.addEventListener('loadedmetadata', () => resolve(isFinite(vid.duration) ? vid.duration : null), { once: true })
      vid.addEventListener('error', () => resolve(null), { once: true })
      vid.load()
    })

  const addFiles = useCallback(async (files: File[]) => {
    const valid = files.filter(f =>
      f.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm|m4v|flv|wmv|ts|mts)$/i.test(f.name)
    )
    if (!valid.length) { setError('No video files found in selection.'); return }
    setError(null)

    const entries: VideoEntry[] = await Promise.all(
      valid.map(async file => {
        const objectUrl = URL.createObjectURL(file)
        const [duration, thumbnail] = await Promise.all([getDuration(objectUrl), captureThumbnail(objectUrl)])
        return { id: crypto.randomUUID(), file, name: file.name, size: file.size, duration, objectUrl, thumbnail }
      })
    )
    setVideos(prev => [...prev, ...entries])
    if (resultRef.current) { URL.revokeObjectURL(resultRef.current); resultRef.current = null; setResultUrl(null) }
  }, [])

  const removeVideo = (id: string) =>
    setVideos(prev => { const v = prev.find(x => x.id === id); if (v) URL.revokeObjectURL(v.objectUrl); return prev.filter(x => x.id !== id) })

  const clearAll = () => {
    videos.forEach(v => URL.revokeObjectURL(v.objectUrl))
    setVideos([])
    if (resultRef.current) { URL.revokeObjectURL(resultRef.current); resultRef.current = null; setResultUrl(null) }
    setError(null)
  }

  // ── Drag-to-reorder handlers ──
  const onDragStart = (e: React.DragEvent, i: number) => {
    e.dataTransfer.effectAllowed = 'move'; setDragIdx(i)
  }
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIdx(i)
  }
  const onDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDragOverIdx(null); return }
    setVideos(prev => {
      const a = [...prev]; const [item] = a.splice(dragIdx, 1); a.splice(i, 0, item); return a
    })
    setDragIdx(null); setDragOverIdx(null)
  }
  const onDragEnd = () => { setDragIdx(null); setDragOverIdx(null) }

  // ── FFmpeg merge (v0.11 API — ffmpeg.FS / ffmpeg.run) ──
  const merge = async () => {
    if (!ffRef.current || videos.length < 2 || merging) return
    setMerging(true); setProgress(0); setError(null); setResultUrl(null)
    if (resultRef.current) { URL.revokeObjectURL(resultRef.current); resultRef.current = null }

    const ff = ffRef.current
    const ext = (name: string) => name.split('.').pop()?.toLowerCase() || 'mp4'

    try {
      // v0.11 progress callback
      ff.setProgress(({ ratio }: { ratio: number }) => {
        setProgress(Math.min(98, Math.round(ratio * 100)))
      })

      setStatusMsg('Reading files…')
      for (let i = 0; i < videos.length; i++) {
        const v = videos[i]
        const buf = new Uint8Array(await v.file.arrayBuffer())
        ff.FS('writeFile', `in${i}.${ext(v.name)}`, buf)
      }

      const list = videos.map((v, i) => `file 'in${i}.${ext(v.name)}'`).join('\n')
      ff.FS('writeFile', 'list.txt', new TextEncoder().encode(list))

      setStatusMsg('Merging…')

      // Try stream copy first (lossless — works when all videos share codec)
      let ok = false
      try {
        await ff.run('-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'output.mp4')
        ok = true
      } catch {
        try { ff.FS('unlink', 'output.mp4') } catch {}
        // Fallback: re-encode to H.264 + AAC
        await ff.run(
          '-f', 'concat', '-safe', '0', '-i', 'list.txt',
          '-c:v', 'libx264', '-c:a', 'aac', '-preset', 'fast', '-crf', '18',
          'output.mp4'
        )
        ok = true
      }

      if (ok) {
        setStatusMsg('Preparing download…')
        const raw = ff.FS('readFile', 'output.mp4') as Uint8Array
        // Ensure buffer is a plain ArrayBuffer (not SharedArrayBuffer) for Blob
        const data = new Uint8Array(raw) // copies into a new plain ArrayBuffer
        const blob = new Blob([data.buffer as ArrayBuffer], { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        resultRef.current = url
        setResultUrl(url)
        setResultSize(blob.size)
        setProgress(100)
      }

      // Cleanup FFmpeg virtual FS
      for (let i = 0; i < videos.length; i++) {
        try { ff.FS('unlink', `in${i}.${ext(videos[i].name)}`) } catch {}
      }
      try { ff.FS('unlink', 'list.txt') } catch {}
      try { ff.FS('unlink', 'output.mp4') } catch {}

    } catch (e: any) {
      setError(e?.message ?? 'Merge failed. Videos may have incompatible formats. Try converting to MP4 first.')
    }

    setMerging(false); setStatusMsg('')
  }

  const totalDuration = videos.reduce((s, v) => s + (v.duration ?? 0), 0)
  const totalSize = videos.reduce((s, v) => s + v.size, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Engine status bar — always visible */}
      <div className={`flex items-center gap-2 text-xs font-medium rounded-xl px-3.5 py-2.5 mb-4 border ${
        ffLoaded ? 'bg-green-50 border-green-200 text-green-700'
        : ffLoading ? 'bg-blue-50 border-blue-200 text-blue-700'
        : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        {ffLoaded ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0" />
            Video engine ready — Merge button is enabled
          </>
        ) : ffLoading ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading video engine (24 MB)… please wait
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" />
            Engine failed to load — {error || 'unknown error'}
            <button onClick={() => { setError(null); setFfLoaded(false); initFF() }}
              className="ml-auto underline hover:no-underline font-semibold shrink-0">
              Retry
            </button>
          </>
        )}
      </div>

      {/* Drop zone (empty state) */}
      {videos.length === 0 && (
        <div
          onDragEnter={e => { e.preventDefault(); setDropActive(true) }}
          onDragOver={e => { e.preventDefault(); setDropActive(true) }}
          onDragLeave={() => setDropActive(false)}
          onDrop={e => { e.preventDefault(); setDropActive(false); addFiles(Array.from(e.dataTransfer.files)) }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl p-14 cursor-pointer transition-colors select-none ${
            dropActive ? 'border-violet-400 bg-violet-50' : 'border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/50'
          }`}
        >
          {/* Video icon */}
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-ink text-lg">Drop videos here</p>
            <p className="text-mute text-sm mt-1">MP4, MOV, AVI, MKV, WebM and more</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-200 w-16" />
            <span className="text-xs text-mute font-medium">or</span>
            <div className="h-px bg-gray-200 w-16" />
          </div>
          <button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
            Select Videos
          </button>
          <p className="text-xs text-mute">Select 2 or more videos to merge</p>
        </div>
      )}

      {/* Video list */}
      {videos.length > 0 && (
        <div className="space-y-4">

          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-ink">{videos.length} video{videos.length !== 1 ? 's' : ''}</p>
              <p className="text-xs text-mute mt-0.5">
                Total: {fmtDur(totalDuration)} · {fmtSize(totalSize)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 border border-line rounded-lg px-3 py-1.5 text-sm text-mute hover:text-ink hover:border-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add More
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 border border-red-100 rounded-lg px-3 py-1.5 text-sm text-red-400 hover:text-red-600 hover:border-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                Clear All
              </button>
            </div>
          </div>

          {/* Drag-to-reorder hint */}
          <p className="text-xs text-mute flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
            Drag rows to reorder — videos merge in this sequence
          </p>

          {/* Video rows */}
          <div className="space-y-2">
            {videos.map((v, i) => (
              <div
                key={v.id}
                draggable
                onDragStart={e => onDragStart(e, i)}
                onDragOver={e => onDragOver(e, i)}
                onDrop={e => onDrop(e, i)}
                onDragEnd={onDragEnd}
                className={`flex items-center gap-3 bg-white border rounded-xl p-3 transition-all cursor-grab active:cursor-grabbing select-none ${
                  dragIdx === i ? 'opacity-40 scale-[0.98]' : ''
                } ${dragOverIdx === i && dragIdx !== i ? 'border-violet-400 bg-violet-50 shadow-md' : 'border-line hover:border-gray-300'}`}
              >
                {/* Drag handle */}
                <div className="text-gray-300 shrink-0 hover:text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                  </svg>
                </div>

                {/* Sequence number */}
                <span className="w-5 text-xs font-bold text-mute shrink-0 text-center">{i + 1}</span>

                {/* Thumbnail */}
                <div className="w-20 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {v.thumbnail
                    ? <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate" title={v.name}>{v.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-mute">{fmtDur(v.duration)}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-mute">{fmtSize(v.size)}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400 uppercase">{v.name.split('.').pop()}</span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeVideo(v.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
              {error}
            </div>
          )}

          {/* Merge / Progress */}
          {merging ? (
            <div className="bg-white border border-line rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink">{statusMsg || 'Working…'}</span>
                <span className="font-bold text-violet-600">{progress}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-mute">Processing entirely in your browser — no uploads to any server</p>
            </div>
          ) : resultUrl ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                </div>
                <div>
                  <p className="font-display font-bold text-ink">Merge complete!</p>
                  <p className="text-sm text-mute">Output: <span className="font-semibold text-green-700">{fmtSize(resultSize)}</span> · {videos.length} videos merged in sequence</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={resultUrl}
                  download="merged-video.mp4"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Download merged-video.mp4
                </a>
                <button
                  onClick={merge}
                  className="border border-line rounded-xl px-4 py-2.5 text-sm text-mute hover:text-ink hover:border-gray-300 transition-colors"
                >
                  Re-merge
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={merge}
              disabled={videos.length < 2 || !ffLoaded || ffLoading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-base transition-colors"
            >
              {ffLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Loading video engine…
                </>
              ) : videos.length < 2 ? (
                'Add at least 2 videos to merge'
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5M20.25 16.5 15.75 21m0 0L11.25 16.5m4.5 4.5V7.5" />
                  </svg>
                  Merge {videos.length} Videos
                </>
              )}
            </button>
          )}

          {!merging && !resultUrl && ffLoaded && videos.length >= 2 && (
            <p className="text-center text-xs text-mute">
              Videos merge in the order shown above · Same quality as input · Runs 100% in your browser
            </p>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mkv,.flv,.avi,.wmv,.ts,.mts"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files?.length) addFiles(Array.from(e.target.files)); e.target.value = '' }}
      />

      {/* Drop overlay when list is showing */}
      {videos.length > 0 && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          onDragEnter={e => { e.preventDefault(); setDropActive(true) }}
        />
      )}
      {dropActive && videos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-violet-600/10 border-4 border-dashed border-violet-400 rounded-2xl flex items-center justify-center"
          onDragOver={e => e.preventDefault()}
          onDragLeave={() => setDropActive(false)}
          onDrop={e => { e.preventDefault(); setDropActive(false); addFiles(Array.from(e.dataTransfer.files)) }}
        >
          <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl text-center">
            <p className="font-display font-bold text-violet-600 text-xl">Drop to add videos</p>
          </div>
        </div>
      )}
    </div>
  )
}
