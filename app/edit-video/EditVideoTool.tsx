'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type VideoEntry = {
  id: string; file: File; name: string; size: number
  duration: number | null; objectUrl: string; thumbnail: string | null
}

type ClipSettings = {
  trimStart: number; trimEnd: number | null; speed: number
  volume: number; muted: boolean; rotation: 0|90|180|270; flipH: boolean; flipV: boolean
}

type AspectRatioId = 'original'|'16:9'|'9:16'|'4:3'|'1:1'|'21:9'

const DEFAULT: ClipSettings = {
  trimStart: 0, trimEnd: null, speed: 1, volume: 100,
  muted: false, rotation: 0, flipH: false, flipV: false,
}

const TRANSITIONS = [
  { id: 'none',      label: 'Cut'       },
  { id: 'fade',      label: 'Fade'      },
  { id: 'dissolve',  label: 'Dissolve'  },
  { id: 'wipeleft',  label: 'Wipe ←'   },
  { id: 'wiperight', label: 'Wipe →'   },
  { id: 'slidedown', label: 'Slide'     },
  { id: 'radial',    label: 'Radial'    },
]

const ASPECT_RATIOS: { id: AspectRatioId; label: string; note: string; w: number|null; h: number|null; vw: number; vh: number }[] = [
  { id: 'original', label: 'Auto',  note: 'Source',    w: null, h: null, vw: 16, vh: 10 },
  { id: '16:9',     label: '16:9',  note: '1920×1080', w: 1920, h: 1080, vw: 16, vh:  9 },
  { id: '9:16',     label: '9:16',  note: '1080×1920', w: 1080, h: 1920, vw:  9, vh: 16 },
  { id: '4:3',      label: '4:3',   note: '1440×1080', w: 1440, h: 1080, vw:  4, vh:  3 },
  { id: '1:1',      label: '1:1',   note: '1080×1080', w: 1080, h: 1080, vw:  1, vh:  1 },
  { id: '21:9',     label: '21:9',  note: '2560×1080', w: 2560, h: 1080, vw: 21, vh:  9 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDur = (s: number | null) => {
  if (!s || !isFinite(s)) return '0:00'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    : `${m}:${String(sec).padStart(2,'0')}`
}
const fmtSize = (b: number) => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`
const extOf   = (name: string) => name.split('.').pop()?.toLowerCase() || 'mp4'
const clipEffDur = (v: VideoEntry, s: ClipSettings) =>
  Math.max(0, ((s.trimEnd ?? (v.duration ?? 5)) - s.trimStart) / s.speed)

// Aspect-ratio icon — tiny proportional rectangle
function ARIcon({ vw, vh, active }: { vw: number; vh: number; active: boolean }) {
  const MAX = 20
  const scale = MAX / Math.max(vw, vh)
  const w = Math.max(3, Math.round(vw * scale))
  const h = Math.max(3, Math.round(vh * scale))
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <rect x={0.75} y={0.75} width={w - 1.5} height={h - 1.5} rx={1.5}
        fill={active ? 'rgb(99 102 241)' : 'none'}
        stroke={active ? 'rgb(99 102 241)' : 'rgb(148 163 184)'}
        strokeWidth={1.5}
      />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditVideoTool() {
  const [videos,       setVideos]       = useState<VideoEntry[]>([])
  const [clipSettings, setClipSettings] = useState<Record<string, ClipSettings>>({})
  const [selectedIdx,  setSelectedIdx]  = useState(0)
  const [activeTab,    setActiveTab]    = useState<'trim'|'speed'|'audio'|'transform'>('trim')
  const [aspectRatio,  setAspectRatio]  = useState<AspectRatioId>('16:9')

  const [isPlaying,   setIsPlaying]   = useState(false)
  const [previewing,  setPreviewing]  = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [clipDur,     setClipDur]     = useState(0)

  const [merging,   setMerging]   = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultSize,setResultSize]= useState(0)

  const [ffLoading, setFfLoading] = useState(true)
  const [ffLoaded,  setFfLoaded]  = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const [dropActive,  setDropActive]  = useState(false)
  const [dragIdx,     setDragIdx]     = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const [transition,    setTransition]   = useState('none')
  const [transDur,      setTransDur]     = useState(1)
  const [showTransMenu, setShowTransMenu]= useState(false)

  const ffRef       = useRef<any>(null)
  const fileInputRef= useRef<HTMLInputElement>(null)
  const resultRef   = useRef<string | null>(null)
  const videoRef    = useRef<HTMLVideoElement>(null)
  const previewRef  = useRef(false)
  const selIdxRef   = useRef(0)

  // ── Init / cleanup ──────────────────────────────────────────────────────────
  useEffect(() => {
    // @ffmpeg/core requires SharedArrayBuffer (cross-origin isolation via COOP/COEP
    // headers). Next.js soft-navigation never re-fetches those headers from the
    // server, so if the user arrived via <Link>, SharedArrayBuffer will be absent.
    // One hard reload is enough — the server will then send the correct headers.
    if (typeof SharedArrayBuffer === 'undefined') {
      const KEY = 'ev-sab-reload'
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, '1')
        window.location.reload()
        return
      }
      // Reloaded once already — headers must be genuinely missing on the server.
      setError('Cross-origin isolation headers are missing. Try opening this page directly in a new tab.')
      setFfLoading(false)
      return
    }
    sessionStorage.removeItem('ev-sab-reload')
    initFF()
    return () => {
      videos.forEach(v => URL.revokeObjectURL(v.objectUrl))
      if (resultRef.current) URL.revokeObjectURL(resultRef.current)
    }
  }, [])

  useEffect(() => {
    if (videos.length > 0 && selectedIdx >= videos.length)
      setSelectedIdx(videos.length - 1)
  }, [videos.length])

  useEffect(() => { selIdxRef.current = selectedIdx }, [selectedIdx])
  useEffect(() => { previewRef.current = previewing  }, [previewing])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(0); setClipDur(0)
    if (previewRef.current) {
      const t = setTimeout(() => {
        v.play().then(() => setIsPlaying(true)).catch(() => {
          previewRef.current = false; setPreviewing(false); setIsPlaying(false)
        })
      }, 60)
      return () => clearTimeout(t)
    } else {
      v.pause(); setIsPlaying(false)
    }
  }, [selectedIdx])

  // ── FFmpeg ──────────────────────────────────────────────────────────────────
  const initFF = async () => {
    if (ffRef.current) return
    setFfLoading(true); setError(null)
    try {
      const mod: any = await import('@ffmpeg/ffmpeg')
      const createFFmpeg: any = mod.createFFmpeg ?? mod.default?.createFFmpeg
      if (typeof createFFmpeg !== 'function') throw new Error('createFFmpeg not found.')
      const localUrl = `${window.location.origin}/ffmpeg/ffmpeg-core.js`
      let corePath = 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
      try { const p = await fetch(localUrl, { method: 'HEAD' }); if (p.ok) corePath = localUrl } catch {}
      const ff = createFFmpeg({ corePath, log: false })
      await ff.load()
      ffRef.current = ff; setFfLoaded(true)
    } catch (e: any) { setError(e?.message ?? 'Failed to load video engine.') }
    setFfLoading(false)
  }

  // ── Clip settings ───────────────────────────────────────────────────────────
  const getSettings = (id: string): ClipSettings => clipSettings[id] ?? DEFAULT

  const updateSettings = useCallback((id: string, patch: Partial<ClipSettings>) => {
    setClipSettings(prev => ({ ...prev, [id]: { ...(prev[id] ?? DEFAULT), ...patch } }))
  }, [])

  const isModified = (id: string) => {
    const s = clipSettings[id]
    if (!s) return false
    return s.speed !== 1 || s.volume !== 100 || s.rotation !== 0 ||
           s.flipH || s.flipV || s.muted || s.trimStart > 0 || s.trimEnd !== null
  }

  const resetSettings = (id: string) =>
    setClipSettings(prev => { const n = { ...prev }; delete n[id]; return n })

  // ── File helpers ─────────────────────────────────────────────────────────────
  const captureThumbnail = (url: string): Promise<string | null> =>
    new Promise(resolve => {
      const vid = document.createElement('video')
      vid.muted = true; vid.preload = 'metadata'; vid.src = url
      let done = false
      const fin = (r: string | null) => { if (!done) { done = true; resolve(r) } }
      const t = setTimeout(() => fin(null), 8000)
      vid.addEventListener('loadeddata', () => { vid.currentTime = 0.5 }, { once: true })
      vid.addEventListener('seeked', () => {
        clearTimeout(t)
        try {
          const c = document.createElement('canvas'); c.width = 160; c.height = 90
          c.getContext('2d')?.drawImage(vid, 0, 0, 160, 90)
          fin(c.toDataURL('image/jpeg', 0.8))
        } catch { fin(null) }
      }, { once: true })
      vid.addEventListener('error', () => { clearTimeout(t); fin(null) }, { once: true })
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
    const valid = files.filter(f => f.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm|m4v|flv|wmv|ts|mts)$/i.test(f.name))
    if (!valid.length) { setError('No video files found.'); return }
    setError(null)
    const entries: VideoEntry[] = await Promise.all(valid.map(async file => {
      const objectUrl = URL.createObjectURL(file)
      const [duration, thumbnail] = await Promise.all([getDuration(objectUrl), captureThumbnail(objectUrl)])
      return { id: crypto.randomUUID(), file, name: file.name, size: file.size, duration, objectUrl, thumbnail }
    }))
    setVideos(prev => { const next = [...prev, ...entries]; setSelectedIdx(next.length - 1); return next })
    if (resultRef.current) { URL.revokeObjectURL(resultRef.current); resultRef.current = null; setResultUrl(null) }
  }, [])

  const removeVideo = (id: string) => {
    setVideos(prev => { const v = prev.find(x => x.id === id); if (v) URL.revokeObjectURL(v.objectUrl); return prev.filter(x => x.id !== id) })
    setClipSettings(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const clearAll = () => {
    videos.forEach(v => URL.revokeObjectURL(v.objectUrl)); setVideos([]); setClipSettings({})
    if (resultRef.current) { URL.revokeObjectURL(resultRef.current); resultRef.current = null; setResultUrl(null) }
    setError(null)
  }

  const duplicateClip = (idx: number) => {
    const src = videos[idx]; if (!src) return
    const newEntry: VideoEntry = { ...src, id: crypto.randomUUID() }
    setClipSettings(prev => ({ ...prev, [newEntry.id]: { ...(prev[src.id] ?? DEFAULT) } }))
    setVideos(prev => { const a = [...prev]; a.splice(idx + 1, 0, newEntry); return a })
    setSelectedIdx(idx + 1)
  }

  const splitClip = () => {
    const src = videos[selectedIdx]; if (!src || !videoRef.current) return
    const cfg = getSettings(src.id)
    const absoluteSplit = cfg.trimStart + currentTime
    if (absoluteSplit <= cfg.trimStart + 0.1 || absoluteSplit >= (cfg.trimEnd ?? (src.duration ?? 99)) - 0.1) return
    const secondId = crypto.randomUUID()
    const secondEntry: VideoEntry = { ...src, id: secondId, name: src.name.replace(/(\.[^.]+)$/, '_2$1') }
    setClipSettings(prev => ({
      ...prev,
      [src.id]:   { ...(prev[src.id] ?? DEFAULT), trimEnd: absoluteSplit },
      [secondId]: { ...(prev[src.id] ?? DEFAULT), trimStart: absoluteSplit },
    }))
    setVideos(prev => { const a = [...prev]; a.splice(selectedIdx + 1, 0, secondEntry); return a })
  }

  // ── Playback ──────────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current; if (!v) return
    if (isPlaying) v.pause(); else v.play()
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    if (previewRef.current) {
      if (selIdxRef.current < videos.length - 1) setSelectedIdx(selIdxRef.current + 1)
      else { previewRef.current = false; setPreviewing(false) }
    }
  }

  const startPreview = () => {
    if (!videos.length) return
    previewRef.current = true; setPreviewing(true)
    if (selectedIdx === 0) {
      videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => { previewRef.current = false; setPreviewing(false) })
    } else setSelectedIdx(0)
  }

  const stopPreview = () => {
    previewRef.current = false; setPreviewing(false)
    videoRef.current?.pause(); setIsPlaying(false)
  }

  const handleScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    if (videoRef.current && clipDur) videoRef.current.currentTime = frac * clipDur
  }

  // ── DnD ──────────────────────────────────────────────────────────────────────
  const onDragStart = (e: React.DragEvent, i: number) => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(i) }
  const onDragOver  = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIdx(i) }
  const onDrop      = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDragOverIdx(null); return }
    setVideos(prev => { const a = [...prev]; const [x] = a.splice(dragIdx, 1); a.splice(i, 0, x); return a })
    setDragIdx(null); setDragOverIdx(null)
  }

  // ── atempo helper ─────────────────────────────────────────────────────────────
  const buildAtempoChain = (speed: number) => {
    const f: string[] = []; let s = speed
    if (s > 1) { while (s > 2) { f.push('atempo=2.0'); s /= 2 }; f.push(`atempo=${s.toFixed(4)}`) }
    else if (s < 1) { while (s < 0.5) { f.push('atempo=0.5'); s *= 2 }; f.push(`atempo=${s.toFixed(4)}`) }
    return f.join(',')
  }

  // ── Merge / Export ────────────────────────────────────────────────────────────
  const merge = async () => {
    if (!ffRef.current || videos.length < 1 || merging) return
    setMerging(true); setProgress(0); setError(null); setResultUrl(null)
    if (resultRef.current) { URL.revokeObjectURL(resultRef.current); resultRef.current = null }
    const ff = ffRef.current
    try {
      ff.setProgress(({ ratio }: { ratio: number }) => setProgress(Math.min(90, Math.round(ratio * 100))))

      setStatusMsg('Reading files…')
      for (let i = 0; i < videos.length; i++) {
        const buf = new Uint8Array(await videos[i].file.arrayBuffer())
        ff.FS('writeFile', `src${i}.${extOf(videos[i].name)}`, buf)
      }

      const arSpec = ASPECT_RATIOS.find(a => a.id === aspectRatio)
      const arVf = arSpec?.w
        ? [`scale=${arSpec.w}:${arSpec.h}:force_original_aspect_ratio=decrease`, `pad=${arSpec.w}:${arSpec.h}:(ow-iw)/2:(oh-ih)/2:color=black`]
        : []

      const procNames: string[] = []
      for (let i = 0; i < videos.length; i++) {
        const v = videos[i]; const s = getSettings(v.id)
        const srcName = `src${i}.${extOf(v.name)}`
        const procName = `proc${i}.mp4`

        const needsProcess = isModified(v.id) || arVf.length > 0

        if (!needsProcess) { procNames.push(srcName); continue }

        setStatusMsg(`Processing clip ${i + 1}/${videos.length}…`)
        const inputArgs: string[] = []
        if (s.trimStart > 0) inputArgs.push('-ss', s.trimStart.toFixed(3))
        inputArgs.push('-i', srcName)
        if (s.trimEnd !== null) inputArgs.push('-t', (s.trimEnd - s.trimStart).toFixed(3))

        const vf: string[] = [...arVf]
        if (s.speed !== 1) vf.unshift(`setpts=${(1 / s.speed).toFixed(4)}*PTS`)
        if (s.rotation === 90)  vf.push('transpose=1')
        else if (s.rotation === 180) vf.push('transpose=2,transpose=2')
        else if (s.rotation === 270) vf.push('transpose=2')
        if (s.flipH) vf.push('hflip')
        if (s.flipV) vf.push('vflip')

        const af: string[] = []
        if (!s.muted) {
          const at = buildAtempoChain(s.speed); if (at) af.push(at)
          if (s.volume !== 100) af.push(`volume=${(s.volume / 100).toFixed(2)}`)
        }

        const filterParts: string[] = []
        if (vf.length) filterParts.push(`[0:v]${vf.join(',')}[vp]`)
        if (s.muted) filterParts.push('anullsrc=r=44100:cl=stereo[ap]')
        else if (af.length) filterParts.push(`[0:a]${af.join(',')}[ap]`)

        if (filterParts.length) {
          const mapV = vf.length ? '[vp]' : '0:v'
          const mapA = s.muted ? '[ap]' : af.length ? '[ap]' : '0:a'
          await ff.run(...inputArgs, '-filter_complex', filterParts.join(';'), '-map', mapV, '-map', mapA, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', procName)
        } else {
          try { await ff.run(...inputArgs, '-c', 'copy', procName) }
          catch { await ff.run(...inputArgs, '-c:v', 'libx264', '-c:a', 'aac', '-preset', 'fast', procName) }
        }
        procNames.push(procName)
      }

      setStatusMsg(transition === 'none' ? 'Merging clips…' : `Applying ${TRANSITIONS.find(t => t.id === transition)?.label} transition…`)

      if (videos.length === 1) {
        ff.FS('rename', procNames[0], 'output.mp4')
      } else if (transition === 'none') {
        const list = procNames.map(n => `file '${n}'`).join('\n')
        ff.FS('writeFile', 'list.txt', new TextEncoder().encode(list))
        try { await ff.run('-f','concat','-safe','0','-i','list.txt','-c','copy','output.mp4') }
        catch {
          try { ff.FS('unlink','output.mp4') } catch {}
          await ff.run('-f','concat','-safe','0','-i','list.txt','-c:v','libx264','-c:a','aac','-preset','fast','-crf','23','output.mp4')
        }
      } else {
        const td = transDur
        const procDurations = videos.map(v => clipEffDur(v, getSettings(v.id)))
        if (procDurations.slice(0,-1).some(d => d <= td * 2))
          throw new Error(`A clip is shorter than ${td * 2}s — reduce transition duration.`)
        const inputArgs: string[] = []
        for (const n of procNames) inputArgs.push('-i', n)
        const filterParts: string[] = []; let vTag = '[0:v]'; let cumOff = 0
        for (let i = 0; i < procNames.length - 1; i++) {
          cumOff += procDurations[i] - td
          const out = i === procNames.length - 2 ? '[vout]' : `[v${i+1}]`
          filterParts.push(`${vTag}[${i+1}:v]xfade=transition=${transition}:duration=${td}:offset=${cumOff.toFixed(3)}${out}`)
          vTag = out
        }
        filterParts.push(`${procNames.map((_,i)=>`[${i}:a]`).join('')}concat=n=${procNames.length}:v=0:a=1[aout]`)
        await ff.run(...inputArgs, '-filter_complex', filterParts.join(';'), '-map', '[vout]', '-map', '[aout]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', 'output.mp4')
      }

      setStatusMsg('Preparing download…')
      const raw  = ff.FS('readFile','output.mp4') as Uint8Array
      const blob = new Blob([new Uint8Array(raw).buffer as ArrayBuffer], { type: 'video/mp4' })
      const url  = URL.createObjectURL(blob)
      resultRef.current = url; setResultUrl(url); setResultSize(blob.size); setProgress(100)

      for (let i = 0; i < videos.length; i++) {
        try { ff.FS('unlink', `src${i}.${extOf(videos[i].name)}`) } catch {}
        try { ff.FS('unlink', `proc${i}.mp4`) } catch {}
      }
      try { ff.FS('unlink','list.txt') } catch {}
      try { ff.FS('unlink','output.mp4') } catch {}
    } catch (e: any) { setError(e?.message ?? 'Export failed.') }
    setMerging(false); setStatusMsg('')
  }

  // ── Derived ───────────────────────────────────────────────────────────────────
  const PX_PER_SEC   = 56
  const selectedClip = videos[selectedIdx] ?? null
  const selCfg       = selectedClip ? getSettings(selectedClip.id) : DEFAULT
  const selTrans     = TRANSITIONS.find(t => t.id === transition)!
  const canExport    = videos.length >= 1 && ffLoaded && !ffLoading
  const totalDur     = videos.reduce((s, v) => s + (v.duration ?? 0), 0)
  const dispDur      = videos.reduce((s, v) => s + (v.duration ?? 5), 0)
  const arInfo       = ASPECT_RATIOS.find(a => a.id === aspectRatio)!

  const playheadX = (
    videos.slice(0, selectedIdx).reduce((s, v) => s + (v.duration ?? 5), 0) + currentTime
  ) * PX_PER_SEC

  const tickSec = dispDur > 120 ? 30 : dispDur > 30 ? 10 : 5
  const ticks: number[] = []
  for (let t = 0; t <= dispDur + tickSec; t += tickSec) ticks.push(t)

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1180px] mx-auto px-4 pb-8 space-y-3">

      {/* ── Engine status ── */}
      <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border ${
        ffLoaded   ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : ffLoading ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
        :             'bg-red-50 border-red-200 text-red-600'
      }`}>
        {ffLoaded ? (
          <><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"/>Engine ready — processing runs entirely in your browser</>
        ) : ffLoading ? (
          <><svg className="w-3 h-3 animate-spin shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading video engine…</>
        ) : (
          <><div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"/>{error || 'Engine failed'}
            <button onClick={()=>{setError(null);setFfLoaded(false);initFF()}} className="ml-auto font-semibold underline">Retry</button></>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-2.5 flex items-center gap-2">
        {/* Add clip */}
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          Add Clip
        </button>

        {/* Transition picker */}
        <div className="relative">
          <button onClick={() => setShowTransMenu(m => !m)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
            {selTrans.label}
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
          </button>
          {showTransMenu && (
            <div className="absolute top-full left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 min-w-[140px]">
              {TRANSITIONS.map(t => (
                <button key={t.id} onClick={() => { setTransition(t.id); setShowTransMenu(false) }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                    transition === t.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transition duration */}
        {transition !== 'none' && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-[10px] text-slate-400 font-medium">Duration</span>
            {[0.5, 1, 1.5, 2].map(d => (
              <button key={d} onClick={() => setTransDur(d)}
                className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                  transDur === d ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
                }`}>{d}s</button>
            ))}
          </div>
        )}

        <div className="flex-1"/>

        {/* Preview */}
        {videos.length >= 2 && !previewing && (
          <button onClick={startPreview}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Preview All
          </button>
        )}
        {previewing && (
          <button onClick={stopPreview}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
            Stop
          </button>
        )}

        {/* Export */}
        {videos.length >= 1 && !merging && !resultUrl && (
          <button onClick={merge} disabled={!canExport}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
            Export{videos.length > 0 ? ` ${videos.length} clip${videos.length > 1 ? 's' : ''}` : ''}
          </button>
        )}
      </div>

      {/* ── Body: Monitor + Properties ── */}
      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 288px' }}>

        {/* Monitor */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

          {/* Video area */}
          <div className="relative bg-[#0b0b0d] aspect-video">
            {videos.length === 0 ? (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${dropActive ? 'bg-indigo-950/30' : ''}`}
                onDragEnter={e => { e.preventDefault(); setDropActive(true) }}
                onDragOver={e => { e.preventDefault(); setDropActive(true) }}
                onDragLeave={() => setDropActive(false)}
                onDrop={e => { e.preventDefault(); setDropActive(false); addFiles(Array.from(e.dataTransfer.files)) }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm font-medium">Drop videos here</p>
                  <p className="text-white/25 text-xs mt-0.5">MP4, MOV, AVI, MKV, WebM</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl">
                  Select Videos
                </button>
              </div>
            ) : selectedClip && (
              <>
                <video
                  key={selectedClip.id}
                  ref={videoRef}
                  src={selectedClip.objectUrl}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleVideoEnded}
                  onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                  onLoadedMetadata={() => setClipDur(videoRef.current?.duration ?? 0)}
                  preload="auto"
                />

                {/* Click to play/pause */}
                <button onClick={togglePlay}
                  className={`absolute inset-0 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm bg-black/40 border border-white/20 hover:scale-105 transition-transform`}>
                    {isPlaying
                      ? <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                      : <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    }
                  </div>
                </button>

                {/* Corner badges */}
                <div className="absolute top-2.5 left-3 flex items-center gap-1.5 pointer-events-none">
                  <span className="bg-black/50 text-white/80 text-[9px] font-semibold px-1.5 py-0.5 rounded-md tracking-wide">
                    {selectedIdx + 1} / {videos.length}
                  </span>
                  {previewing && (
                    <span className="flex items-center gap-1 bg-indigo-600/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse"/>LIVE PREVIEW
                    </span>
                  )}
                </div>

                {/* Nav arrows */}
                {selectedIdx > 0 && (
                  <button onClick={() => setSelectedIdx(i => i - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
                  </button>
                )}
                {selectedIdx < videos.length - 1 && (
                  <button onClick={() => setSelectedIdx(i => i + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Scrub bar + controls */}
          {videos.length > 0 && selectedClip && (
            <div className="px-4 pt-3 pb-3 border-t border-slate-100">
              {/* Progress track */}
              <div className="relative h-1 bg-slate-100 rounded-full cursor-pointer mb-3 group"
                onClick={handleScrubClick}>
                {/* Active region (trim-aware) */}
                {clipDur > 0 && (
                  <div className="absolute inset-y-0 bg-slate-200 rounded-full"
                    style={{ left: `${(selCfg.trimStart / clipDur) * 100}%`, right: `${((clipDur - (selCfg.trimEnd ?? clipDur)) / clipDur) * 100}%` }}
                  />
                )}
                {/* Played */}
                <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full pointer-events-none"
                  style={{ width: `${clipDur ? (currentTime / clipDur) * 100 : 0}%` }}
                />
                {/* Thumb on hover */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ left: `${clipDur ? (currentTime / clipDur) * 100 : 0}%` }}
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <button onClick={togglePlay}
                  className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-700 flex items-center justify-center text-white shrink-0 transition-colors">
                  {isPlaying
                    ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                    : <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  }
                </button>

                {/* Time */}
                <span className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0">
                  {fmtDur(currentTime)} <span className="text-slate-300">/</span> {fmtDur(clipDur || selectedClip.duration)}
                </span>

                <div className="flex-1"/>

                {/* Clip actions */}
                <button onClick={splitClip} title="Split at playhead"
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
                  Split
                </button>
                <button onClick={() => duplicateClip(selectedIdx)} title="Duplicate clip"
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"/></svg>
                  Duplicate
                </button>
                <button onClick={() => removeVideo(selectedClip.id)} title="Remove clip"
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Properties panel ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

          {/* Canvas / Output format */}
          <div className="px-4 pt-4 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Output Format</p>
            <div className="grid grid-cols-3 gap-1.5">
              {ASPECT_RATIOS.map(ar => {
                const active = aspectRatio === ar.id
                return (
                  <button key={ar.id} onClick={() => setAspectRatio(ar.id)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all ${
                      active ? 'bg-indigo-50 border-indigo-300' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}>
                    <ARIcon vw={ar.vw} vh={ar.vh} active={active}/>
                    <span className={`text-[10px] font-semibold leading-none ${active ? 'text-indigo-700' : 'text-slate-600'}`}>
                      {ar.label}
                    </span>
                  </button>
                )
              })}
            </div>
            {aspectRatio !== 'original' && arInfo.w && (
              <p className="mt-2.5 text-[10px] text-slate-400 text-center font-medium tabular-nums">
                {arInfo.w} × {arInfo.h} · {arInfo.note}
              </p>
            )}
          </div>

          {/* Clip properties */}
          {selectedClip ? (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Clip info */}
              <div className="px-4 pt-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate leading-tight">{selectedClip.name.replace(/\.[^.]+$/, '')}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-400 tabular-nums">{fmtDur(selectedClip.duration)}</span>
                      <span className="text-slate-200">·</span>
                      <span className="text-[10px] text-slate-400">{fmtSize(selectedClip.size)}</span>
                    </div>
                  </div>
                  {isModified(selectedClip.id) && (
                    <button onClick={() => resetSettings(selectedClip.id)}
                      className="shrink-0 text-[9px] font-semibold text-slate-400 hover:text-red-500 transition-colors mt-0.5">
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Tab pills */}
              <div className="flex px-3 pt-2.5 pb-1 gap-0.5">
                {([
                  { id: 'trim',      label: 'Trim'      },
                  { id: 'speed',     label: 'Speed'     },
                  { id: 'audio',     label: 'Audio'     },
                  { id: 'transform', label: 'Transform' },
                ] as const).map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-colors ${
                      activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3 space-y-4">

                {/* ── TRIM ── */}
                {activeTab === 'trim' && (
                  <div className="space-y-4">
                    {/* Visual trim bar */}
                    {selectedClip.duration && (
                      <div className="relative h-7 bg-slate-100 rounded-lg overflow-hidden">
                        {/* inactive left */}
                        <div className="absolute inset-y-0 left-0 bg-slate-200 rounded-l-lg"
                          style={{ width: `${(selCfg.trimStart / selectedClip.duration) * 100}%` }}/>
                        {/* inactive right */}
                        <div className="absolute inset-y-0 right-0 bg-slate-200 rounded-r-lg"
                          style={{ width: `${((selectedClip.duration - (selCfg.trimEnd ?? selectedClip.duration)) / selectedClip.duration) * 100}%` }}/>
                        {/* active region */}
                        <div className="absolute inset-y-0 bg-indigo-100 border-x-2 border-indigo-400"
                          style={{
                            left:  `${(selCfg.trimStart / selectedClip.duration) * 100}%`,
                            right: `${((selectedClip.duration - (selCfg.trimEnd ?? selectedClip.duration)) / selectedClip.duration) * 100}%`,
                          }}
                        />
                        {/* playhead */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-600"
                          style={{ left: `${clipDur ? (currentTime / clipDur) * 100 : 0}%` }}/>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Start</label>
                          <span className="text-[10px] font-mono text-slate-700 tabular-nums">{fmtDur(selCfg.trimStart)}</span>
                        </div>
                        <input type="range" min={0} max={selectedClip.duration ?? 0} step={0.1}
                          value={selCfg.trimStart}
                          onChange={e => updateSettings(selectedClip.id, { trimStart: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-600"/>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">End</label>
                          <span className="text-[10px] font-mono text-slate-700 tabular-nums">{fmtDur(selCfg.trimEnd ?? selectedClip.duration)}</span>
                        </div>
                        <input type="range" min={0} max={selectedClip.duration ?? 0} step={0.1}
                          value={selCfg.trimEnd ?? (selectedClip.duration ?? 0)}
                          onChange={e => updateSettings(selectedClip.id, { trimEnd: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-600"/>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                      <span className="text-[10px] text-slate-500">Output duration</span>
                      <span className="text-[10px] font-mono font-semibold text-slate-800 tabular-nums">
                        {fmtDur(clipEffDur(selectedClip, selCfg))}
                      </span>
                    </div>
                  </div>
                )}

                {/* ── SPEED ── */}
                {activeTab === 'speed' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Playback Speed</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4].map(s => (
                        <button key={s} onClick={() => updateSettings(selectedClip.id, { speed: s })}
                          className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                            selCfg.speed === s
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                              : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                          }`}>
                          {s}×
                        </button>
                      ))}
                    </div>
                    {selCfg.speed !== 1 && (
                      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                        <span className="text-[10px] text-slate-500">Output duration</span>
                        <span className="text-[10px] font-mono font-semibold text-slate-800 tabular-nums">
                          {fmtDur(clipEffDur(selectedClip, selCfg))}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── AUDIO ── */}
                {activeTab === 'audio' && (
                  <div className="space-y-4">
                    <button onClick={() => updateSettings(selectedClip.id, { muted: !selCfg.muted })}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        selCfg.muted
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}>
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {selCfg.muted
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>
                        }
                      </svg>
                      <div>
                        <p className="text-xs font-semibold">{selCfg.muted ? 'Muted' : 'Audio on'}</p>
                        <p className="text-[10px] opacity-60 mt-0.5">{selCfg.muted ? 'Click to restore' : 'Click to mute this clip'}</p>
                      </div>
                    </button>

                    {!selCfg.muted && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Volume</label>
                          <span className="text-[10px] font-mono font-semibold text-slate-700 tabular-nums">{selCfg.volume}%</span>
                        </div>
                        {/* Volume bar */}
                        <div className="relative mb-1">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, selCfg.volume / 2)}%` }}/>
                          </div>
                        </div>
                        <input type="range" min={0} max={200} step={5}
                          value={selCfg.volume}
                          onChange={e => updateSettings(selectedClip.id, { volume: parseInt(e.target.value) })}
                          className="w-full accent-indigo-600"/>
                        <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                          <span>0%</span><span>100%</span><span>200%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TRANSFORM ── */}
                {activeTab === 'transform' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Rotation</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {([0, 90, 180, 270] as const).map(deg => (
                          <button key={deg} onClick={() => updateSettings(selectedClip.id, { rotation: deg })}
                            className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                              selCfg.rotation === deg
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
                            }`}>
                            {deg}°
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Flip</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button onClick={() => updateSettings(selectedClip.id, { flipH: !selCfg.flipH })}
                          className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                            selCfg.flipH ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
                          }`}>
                          ↔ Horizontal
                        </button>
                        <button onClick={() => updateSettings(selectedClip.id, { flipV: !selCfg.flipV })}
                          className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                            selCfg.flipV ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
                          }`}>
                          ↕ Vertical
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">No clip selected</p>
              <p className="text-[11px] text-slate-400 mt-1">Click a clip in the timeline<br/>to edit its properties</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Timeline</span>
            {videos.length > 0 && (
              <span className="text-[10px] text-slate-400">
                {videos.length} clip{videos.length !== 1 ? 's' : ''} · {fmtDur(totalDur)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {videos.length > 0 && (
              <button onClick={clearAll} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors font-medium">
                Clear all
              </button>
            )}
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              Add Clip
            </button>
          </div>
        </div>

        {/* Track area */}
        {videos.length === 0 ? (
          <div className="h-24 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}>
            <p className="text-slate-400 text-xs">No clips yet — add your first video to begin</p>
          </div>
        ) : (
          <div className="overflow-x-auto select-none" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>
            <div style={{ minWidth: 'max-content', padding: '0 16px 12px' }}>

              {/* Time ruler */}
              <div className="relative h-5 mb-1">
                {ticks.map(t => (
                  <div key={t} className="absolute flex flex-col items-center" style={{ left: t * PX_PER_SEC }}>
                    <span className="text-[8px] font-mono text-slate-400 tabular-nums mb-0.5">{fmtDur(t)}</span>
                    <div className="w-px h-1.5 bg-slate-300"/>
                  </div>
                ))}
              </div>

              {/* Clips row + playhead */}
              <div className="relative" style={{ height: 60 }}>

                {/* Playhead */}
                {videos.length > 0 && (
                  <div className="absolute top-0 bottom-0 z-30 pointer-events-none"
                    style={{ left: playheadX, transform: 'translateX(-50%)' }}>
                    <div className="w-0 h-0 mx-auto" style={{
                      borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                      borderTop: '6px solid #4F46E5',
                    }}/>
                    <div className="w-px bg-indigo-500/60 mx-auto" style={{ height: 54 }}/>
                  </div>
                )}

                {/* Clip strip */}
                <div className="flex items-stretch h-full">
                  {videos.map((v, i) => {
                    const w = Math.max(80, (v.duration ?? 5) * PX_PER_SEC)
                    const isSelected = selectedIdx === i
                    const isDragging = dragIdx === i
                    const isOver     = dragOverIdx === i && dragIdx !== i
                    const cfg        = getSettings(v.id)
                    const modified   = isModified(v.id)

                    return (
                      <div key={v.id} className="relative flex-shrink-0 h-full" style={{ width: w }}>
                        <div
                          draggable
                          onDragStart={e => onDragStart(e, i)}
                          onDragOver={e => onDragOver(e, i)}
                          onDrop={e => onDrop(e, i)}
                          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
                          onClick={() => setSelectedIdx(i)}
                          className={`group absolute inset-0 overflow-hidden cursor-pointer transition-all ${isDragging ? 'opacity-30' : ''}`}
                          style={{
                            borderRadius: i === 0 ? '6px 0 0 6px' : i === videos.length - 1 ? '0 6px 6px 0' : '0',
                            outline: isSelected ? '2px solid #4F46E5' : isOver ? '2px solid #818CF8' : modified ? '2px solid #C7D2FE' : '2px solid #E2E8F0',
                            outlineOffset: isSelected ? '1px' : '0',
                          }}
                        >
                          {/* Thumbnail */}
                          {v.thumbnail ? (
                            <div className="absolute inset-0" style={{
                              backgroundImage: `url(${v.thumbnail})`,
                              backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x',
                            }}/>
                          ) : (
                            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/>
                              </svg>
                            </div>
                          )}

                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"/>

                          {/* Trim shades */}
                          {cfg.trimStart > 0 && v.duration && (
                            <div className="absolute top-0 left-0 bottom-0 bg-white/50 pointer-events-none border-r-2 border-orange-400"
                              style={{ width: `${(cfg.trimStart / v.duration) * 100}%` }}/>
                          )}
                          {cfg.trimEnd !== null && v.duration && (
                            <div className="absolute top-0 right-0 bottom-0 bg-white/50 pointer-events-none border-l-2 border-orange-400"
                              style={{ width: `${((v.duration - cfg.trimEnd) / v.duration) * 100}%` }}/>
                          )}

                          {/* Index badge */}
                          <span className="absolute top-1 left-1.5 text-white text-[8px] font-bold bg-black/40 px-1 rounded leading-4">{i + 1}</span>
                          {cfg.speed !== 1 && <span className="absolute top-1 right-6 text-yellow-300 text-[8px] font-bold bg-black/40 px-1 rounded">{cfg.speed}×</span>}

                          {/* Remove */}
                          <button onClick={e => { e.stopPropagation(); removeVideo(v.id) }}
                            className="absolute top-1 right-1 w-3.5 h-3.5 bg-white rounded-full hidden group-hover:flex items-center justify-center shadow z-10">
                            <svg className="w-2 h-2 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                          </button>

                          {/* Name + duration */}
                          <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1 pointer-events-none">
                            <p className="text-white text-[9px] font-semibold truncate" style={{ textShadow: '0 1px 3px rgba(0,0,0,.8)' }}>
                              {v.name.replace(/\.[^.]+$/, '')}
                            </p>
                            <p className="text-white/60 text-[8px] font-mono tabular-nums">{fmtDur(v.duration)}</p>
                          </div>

                          {/* Resize handles */}
                          <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            style={{ background: 'linear-gradient(to right, rgba(255,255,255,.2), transparent)' }}>
                            <div className="w-0.5 h-6 bg-white/70 rounded-full"/>
                          </div>
                          <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            style={{ background: 'linear-gradient(to left, rgba(255,255,255,.2), transparent)' }}>
                            <div className="w-0.5 h-6 bg-white/70 rounded-full"/>
                          </div>
                        </div>

                        {/* Transition badge */}
                        {i < videos.length - 1 && (
                          <div className="absolute top-0 bottom-0 right-0 z-20 flex items-center" style={{ width: 0 }}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center -translate-x-1/2 shadow-sm ${
                              transition === 'none'
                                ? 'bg-white border-slate-300 text-slate-400'
                                : 'bg-indigo-600 border-white text-white'
                            }`}>
                              {transition === 'none'
                                ? <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="1.5"/></svg>
                                : <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3l1.5 4.5H18l-3.75 2.7 1.5 4.5L12 12l-3.75 2.7 1.5-4.5L6 7.5h4.5z"/></svg>
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Add slot */}
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 ml-2 h-full w-10 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center text-slate-300 hover:text-indigo-500 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5 text-sm text-red-700">
          <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
          {error}
        </div>
      )}

      {/* ── Export progress ── */}
      {merging && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">{statusMsg || 'Exporting…'}</span>
            <span className="text-sm font-bold text-indigo-600 tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
          </div>
          <p className="text-xs text-slate-400">Processing in your browser — no uploads required</p>
        </div>
      )}

      {/* ── Result ── */}
      {resultUrl && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Export complete</p>
              <p className="text-xs text-slate-500">{videos.length} clip{videos.length !== 1 ? 's' : ''} · {fmtSize(resultSize)}</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={merge}
                className="text-xs font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-colors">
                Re-export
              </button>
              <a href={resultUrl} download="edited-video.mp4"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                Download
              </a>
            </div>
          </div>
          <div className="bg-slate-950 p-4">
            <video src={resultUrl} controls className="w-full max-h-56 object-contain rounded-lg"/>
          </div>
        </div>
      )}

      {/* Hidden input */}
      <input ref={fileInputRef} type="file" accept="video/*,.mkv,.flv,.avi,.wmv,.ts,.mts" multiple className="hidden"
        onChange={e => { if (e.target.files?.length) addFiles(Array.from(e.target.files)); e.target.value = '' }}
      />

      {/* Drop overlay */}
      {dropActive && videos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-indigo-600/10 border-4 border-dashed border-indigo-400 flex items-center justify-center"
          onDragOver={e => e.preventDefault()}
          onDragLeave={() => setDropActive(false)}
          onDrop={e => { e.preventDefault(); setDropActive(false); addFiles(Array.from(e.dataTransfer.files)) }}>
          <div className="bg-white rounded-2xl px-10 py-6 shadow-2xl border border-slate-200">
            <p className="font-bold text-indigo-600 text-lg">Drop to add clips</p>
          </div>
        </div>
      )}

      {/* Close transition menu on outside click */}
      {showTransMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowTransMenu(false)}/>
      )}
    </div>
  )
}
