'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

type Status = 'idle' | 'loading-model' | 'detecting' | 'ready' | 'error'
type DrawMode = 'auto' | 'manual'

interface BlurRegion {
  id: string
  x: number; y: number; w: number; h: number
}

const BLUR_PRESETS = [
  { label: 'Soft', value: 12 },
  { label: 'Medium', value: 24 },
  { label: 'Heavy', value: 40 },
  { label: 'Pixelate', value: 60 },
]

function applyBlur(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  radius: number,
  pixelate: boolean
) {
  if (w <= 0 || h <= 0) return
  const px = Math.max(0, x - 8), py = Math.max(0, y - 8)
  const pw = w + 16, ph = h + 16

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(x + w / 2, y + h / 2, w / 2 + 6, h / 2 + 6, 0, 0, Math.PI * 2)
  ctx.clip()

  if (pixelate) {
    const blockSize = Math.max(4, Math.round(radius / 3))
    const imgData = ctx.getImageData(px, py, pw, ph)
    for (let bx = 0; bx < pw; bx += blockSize) {
      for (let by = 0; by < ph; by += blockSize) {
        const i = (by * pw + bx) * 4
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2]
        for (let dx = 0; dx < blockSize && bx + dx < pw; dx++) {
          for (let dy = 0; dy < blockSize && by + dy < ph; dy++) {
            const j = ((by + dy) * pw + (bx + dx)) * 4
            imgData.data[j] = r; imgData.data[j + 1] = g; imgData.data[j + 2] = b
          }
        }
      }
    }
    ctx.putImageData(imgData, px, py)
  } else {
    ctx.filter = `blur(${radius}px)`
    ctx.drawImage(ctx.canvas, px, py, pw, ph, px, py, pw, ph)
    ctx.filter = 'none'
  }
  ctx.restore()
}

export default function BlurFaceTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [mode, setMode] = useState<DrawMode>('auto')
  const [blurRadius, setBlurRadius] = useState(24)
  const [regions, setRegions] = useState<BlurRegion[]>([])
  const [drawing, setDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [drawerRect, setDrawerRect] = useState<BlurRegion | null>(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [faceCount, setFaceCount] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const fileNameRef = useRef('image.jpg')

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }, [])

  const redrawImage = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    for (const r of regions) {
      applyBlur(ctx, r.x, r.y, r.w, r.h, blurRadius, blurRadius >= 50)
    }
  }, [regions, blurRadius])

  // When status flips to 'ready', the canvas mounts for the first time — initialise its size then draw
  useEffect(() => {
    if (status !== 'ready') return
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    if (overlayRef.current) {
      overlayRef.current.width = img.naturalWidth
      overlayRef.current.height = img.naturalHeight
    }
    redrawImage()
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-draw whenever regions or blur radius change (canvas already sized)
  useEffect(() => {
    if (status === 'ready') redrawImage()
  }, [redrawImage, status])

  const loadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload a JPG, PNG, or WebP image.'); return }
    fileNameRef.current = file.name
    setError(''); setRegions([]); setFaceCount(0)

    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const url = URL.createObjectURL(file)
    urlRef.current = url

    // Load image into memory first (before touching the canvas which isn't mounted yet)
    const img = new Image()
    await new Promise<void>(res => { img.onload = () => res(); img.src = url })
    imageRef.current = img

    if (mode === 'auto') {
      setStatus('loading-model')
      try {
        const tf = await import('@tensorflow/tfjs')
        await tf.ready()
        const blazeface = await import('@tensorflow-models/blazeface')
        const model = await blazeface.load()
        setStatus('detecting')

        // Pass img element directly — no canvas needed for detection
        const predictions = await model.estimateFaces(img, false)

        const detected: BlurRegion[] = (predictions as Array<{ topLeft: [number,number], bottomRight: [number,number] }>)
          .map((p, i) => {
            const [x1, y1] = p.topLeft
            const [x2, y2] = p.bottomRight
            const pad = (x2 - x1) * 0.15
            return {
              id: `face-${i}`,
              x: Math.max(0, x1 - pad),
              y: Math.max(0, y1 - pad),
              w: (x2 - x1) + pad * 2,
              h: (y2 - y1) + pad * 2,
            }
          })

        setRegions(detected)
        setFaceCount(detected.length)
        if (detected.length === 0) setError('No faces detected. Switch to Manual mode to blur regions manually.')
      } catch (err) {
        console.error(err)
        setError('AI detection failed. Switch to Manual mode to blur regions manually.')
      }
    }

    // Status → ready causes the canvas to mount; useEffect below draws the image
    setStatus('ready')
  }, [mode])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadImage(file)
  }, [loadImage])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) loadImage(e.target.files[0])
    e.target.value = ''
  }

  // Manual draw helpers — coordinates relative to the canvas
  const getCanvasXY = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = e.currentTarget.width / rect.width
    const scaleY = e.currentTarget.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'manual' || status !== 'ready') return
    const { x, y } = getCanvasXY(e)
    setDrawing(true)
    setDrawStart({ x, y })
    setDrawerRect({ id: 'drawing', x, y, w: 0, h: 0 })
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const { x, y } = getCanvasXY(e)
    const newRect = {
      id: 'drawing',
      x: Math.min(x, drawStart.x),
      y: Math.min(y, drawStart.y),
      w: Math.abs(x - drawStart.x),
      h: Math.abs(y - drawStart.y),
    }
    setDrawerRect(newRect)

    // Draw live preview on overlay canvas
    const overlay = overlayRef.current!
    const oc = overlay.getContext('2d')!
    oc.clearRect(0, 0, overlay.width, overlay.height)
    oc.strokeStyle = '#3b82f6'
    oc.lineWidth = 2
    oc.setLineDash([6, 3])
    oc.strokeRect(newRect.x, newRect.y, newRect.w, newRect.h)
    oc.fillStyle = 'rgba(59,130,246,0.08)'
    oc.fillRect(newRect.x, newRect.y, newRect.w, newRect.h)
  }

  const onMouseUp = () => {
    if (!drawing || !drawerRect) return
    setDrawing(false)
    const overlay = overlayRef.current!
    overlay.getContext('2d')!.clearRect(0, 0, overlay.width, overlay.height)
    if (drawerRect.w > 10 && drawerRect.h > 10) {
      setRegions(prev => [...prev, { ...drawerRect, id: `manual-${Date.now()}` }])
    }
    setDrawerRect(null)
  }

  const removeRegion = (id: string) => setRegions(prev => prev.filter(r => r.id !== id))

  const download = () => {
    const canvas = canvasRef.current!
    const link = document.createElement('a')
    link.download = fileNameRef.current.replace(/\.[^.]+$/, '') + '-blurred.jpg'
    link.href = canvas.toDataURL('image/jpeg', 0.92)
    link.click()
  }

  const reset = () => {
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null }
    imageRef.current = null
    setStatus('idle')
    setRegions([])
    setError('')
    setFaceCount(0)
    setDrawerRect(null)
  }

  // ── Idle ─────────────────────────────────────────────────────────────────
  if (status === 'idle' || (status === 'error' && !imageRef.current)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Mode toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['auto', 'manual'] as DrawMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${mode === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-mute border-line hover:border-blue-300'}`}>
              {m === 'auto' ? '✨ Auto-detect faces' : '✏️ Manual selection'}
            </button>
          ))}
        </div>

        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all select-none
            ${dragging ? 'border-blue-400 bg-blue-50 scale-[1.01]' : 'border-line hover:border-blue-400 hover:bg-blue-50/40 bg-white'}`}
        >
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="8" r="4"/><path d="M6 16c0-2 2.7-3.5 6-3.5s6 1.5 6 3.5"/><path d="M3 3l18 18" strokeDasharray="3 3"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-ink text-lg">Drop your image here</p>
            <p className="text-mute text-sm mt-1">JPG, PNG, or WebP · Faces, license plates, sensitive areas</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 text-xs text-blue-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
            100% private — AI runs in your browser, no uploads
          </div>
        </div>
        {error && <p className="mt-4 text-red-600 text-sm text-center font-medium">{error}</p>}
        <AdSlot position="footer" />
      </div>
    )
  }

  // ── Loading / detecting ───────────────────────────────────────────────────
  if (status === 'loading-model' || status === 'detecting') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
        <p className="font-display font-bold text-ink text-lg">
          {status === 'loading-model' ? 'Loading face detection AI…' : 'Detecting faces…'}
        </p>
        <p className="text-mute text-sm">
          {status === 'loading-model' ? 'Downloading model once, cached for future use' : 'Analysing your image…'}
        </p>
      </div>
    )
  }

  // ── Ready / editing ───────────────────────────────────────────────────────
  const hasCanvas = !!imageRef.current
  const canvasW = imageRef.current?.naturalWidth ?? 0
  const canvasH = imageRef.current?.naturalHeight ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {faceCount > 0 && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-semibold">
          ✅ {faceCount} face{faceCount > 1 ? 's' : ''} detected and blurred automatically
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
        {/* Canvas */}
        <div className="bg-gray-50 rounded-2xl border border-line overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-mute">Editor</span>
            {mode === 'manual' && (
              <span className="text-xs text-blue-600 font-semibold">Click and drag to add blur region</span>
            )}
          </div>
          <div className="p-3 overflow-auto">
            <div className="relative inline-block max-w-full">
              <canvas
                ref={canvasRef}
                width={canvasW}
                height={canvasH}
                className="max-w-full rounded-xl shadow block"
                style={{ cursor: mode === 'manual' ? 'crosshair' : 'default' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              />
              {/* Overlay for draw preview */}
              <canvas
                ref={overlayRef}
                width={canvasW}
                height={canvasH}
                className="absolute inset-0 max-w-full rounded-xl pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar controls */}
        <div className="space-y-4">
          {/* Mode */}
          <div className="bg-white border border-line rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-mute mb-3">Mode</p>
            <div className="flex flex-col gap-2">
              {(['auto', 'manual'] as DrawMode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); if (m === 'manual') setError('') }}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all text-left ${mode === m ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-mute border-line hover:border-blue-200'}`}>
                  {m === 'auto' ? '✨ Auto-detect' : '✏️ Manual draw'}
                </button>
              ))}
            </div>
          </div>

          {/* Blur intensity */}
          <div className="bg-white border border-line rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-mute mb-3">Blur Intensity</p>
            <div className="grid grid-cols-2 gap-2">
              {BLUR_PRESETS.map(p => (
                <button key={p.label} onClick={() => setBlurRadius(p.value)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${blurRadius === p.value ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-mute border-line hover:border-blue-200'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <input type="range" min={4} max={80} value={blurRadius} onChange={e => setBlurRadius(Number(e.target.value))}
              className="w-full mt-3 accent-blue-600" />
            <p className="text-xs text-mute text-center mt-1">{blurRadius >= 50 ? 'Pixelate' : `Blur: ${blurRadius}px`}</p>
          </div>

          {/* Regions list */}
          {regions.length > 0 && (
            <div className="bg-white border border-line rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-mute mb-3">Blurred Regions ({regions.length})</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {regions.map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-ink font-medium">{r.id.startsWith('face') ? `Face ${i + 1}` : `Region ${i + 1}`}</span>
                    <button onClick={() => removeRegion(r.id)} className="text-red-400 hover:text-red-600 font-bold ml-2">✕</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setRegions([])} className="mt-2 w-full text-xs text-red-500 hover:text-red-700 font-semibold py-1">
                Clear all regions
              </button>
            </div>
          )}

          {/* Actions */}
          <button onClick={download} disabled={!hasCanvas}
            className="w-full btn-royal flex items-center justify-center gap-2 py-3 rounded-xl font-semibold disabled:opacity-50">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Image
          </button>

          <button onClick={reset}
            className="w-full px-4 py-2.5 rounded-xl border border-line text-mute hover:text-ink text-sm font-semibold transition-colors">
            Start Over
          </button>
        </div>
      </div>

      <div className="mt-8"><AdSlot position="footer" /></div>
    </div>
  )
}
