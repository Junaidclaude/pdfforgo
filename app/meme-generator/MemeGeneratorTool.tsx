'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

interface MemeText {
  id: string
  text: string
  x: number        // 0-1 normalised
  y: number        // 0-1 normalised
  fontSize: number // % of canvas height
  color: string
  strokeColor: string
  strokeWidth: number
  fontFamily: string
  bold: boolean
  italic: boolean
  align: 'left' | 'center' | 'right'
}

const TEMPLATES = [
  { name: 'Drake',          url: 'https://i.imgflip.com/30b1gx.jpg' },
  { name: 'Distracted BF',  url: 'https://i.imgflip.com/1ur9b0.jpg' },
  { name: 'Two Buttons',    url: 'https://i.imgflip.com/1g8my4.jpg' },
  { name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
  { name: 'Expanding Brain',url: 'https://i.imgflip.com/1jwhww.jpg' },
  { name: 'Doge',           url: 'https://i.imgflip.com/4t0m5.jpg' },
  { name: 'Woman Yelling',  url: 'https://i.imgflip.com/345v97.jpg' },
  { name: 'This Is Fine',   url: 'https://i.imgflip.com/wxica.jpg' },
  { name: 'Bernie Mittens', url: 'https://i.imgflip.com/4uaj3n.jpg' },
  { name: 'Blinking Guy',   url: 'https://i.imgflip.com/1otk96.gif' },
  { name: 'Side Eye Chloe', url: 'https://i.imgflip.com/9vct.jpg' },
  { name: 'Panik Kalm',     url: 'https://i.imgflip.com/3qqcmh.jpg' },
]

const FONTS = ['Impact', 'Arial Black', 'Comic Sans MS', 'Oswald', 'Anton']

function uid() { return Math.random().toString(36).slice(2) }

function makeText(partial?: Partial<MemeText>): MemeText {
  return {
    id: uid(),
    text: 'YOUR TEXT HERE',
    x: 0.5, y: 0.1,
    fontSize: 8,
    color: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 3,
    fontFamily: 'Impact',
    bold: false,
    italic: false,
    align: 'center',
    ...partial,
  }
}

export default function MemeGeneratorTool() {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [imgName, setImgName] = useState('meme')
  const [texts, setTexts] = useState<MemeText[]>([
    makeText({ text: 'TOP TEXT', y: 0.07 }),
    makeText({ text: 'BOTTOM TEXT', y: 0.92 }),
  ])
  const [selectedId, setSelectedId] = useState<string | null>(texts[0].id)
  const [dragging, setDragging] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const dragOffset = useRef({ dx: 0, dy: 0 })
  const activeText = texts.find(t => t.id === selectedId)

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)

    for (const t of texts) {
      if (!t.text.trim()) continue
      const px = t.fontSize / 100 * canvas.height
      ctx.font = `${t.italic ? 'italic ' : ''}${t.bold ? 'bold ' : ''}${px}px "${t.fontFamily}", Impact, Arial Black, sans-serif`
      ctx.textAlign = t.align
      ctx.textBaseline = 'middle'

      const xPx = t.align === 'left' ? t.x * canvas.width + 8
        : t.align === 'right' ? t.x * canvas.width - 8
        : t.x * canvas.width
      const yPx = t.y * canvas.height

      if (t.strokeWidth > 0) {
        ctx.strokeStyle = t.strokeColor
        ctx.lineWidth = t.strokeWidth * 2
        ctx.lineJoin = 'round'
        ctx.strokeText(t.text, xPx, yPx)
      }
      ctx.fillStyle = t.color
      ctx.fillText(t.text, xPx, yPx)

      // Selection indicator
      if (t.id === selectedId) {
        const metrics = ctx.measureText(t.text)
        const w = metrics.width + 12
        const h = px + 8
        const lx = t.align === 'center' ? xPx - w / 2
          : t.align === 'right' ? xPx - w
          : xPx - 6
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 3])
        ctx.strokeRect(lx, yPx - h / 2, w, h)
        ctx.setLineDash([])
      }
    }
  }, [texts, selectedId])

  useEffect(() => { draw() }, [draw])

  // ── Load image ────────────────────────────────────────────────────────────
  const loadSrc = useCallback((src: string, name = 'meme') => {
    if (urlRef.current && urlRef.current !== src) URL.revokeObjectURL(urlRef.current)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      const canvas = canvasRef.current!
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      draw()
    }
    img.src = src
    setImgSrc(src)
    setImgName(name)
  }, [draw])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    urlRef.current = url
    loadSrc(url, file.name.replace(/\.[^.]+$/, ''))
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      urlRef.current = url
      loadSrc(url, file.name.replace(/\.[^.]+$/, ''))
    }
  }

  // ── Canvas pointer — drag text ────────────────────────────────────────────
  const canvasXY = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      nx: (e.clientX - rect.left) / rect.width,
      ny: (e.clientY - rect.top) / rect.height,
    }
  }

  const hitTest = (nx: number, ny: number): string | null => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i]
      const px = t.fontSize / 100 * canvas.height
      ctx.font = `${px}px "${t.fontFamily}"`
      const w = (ctx.measureText(t.text).width + 20) / canvas.width
      const h = (px + 16) / canvas.height
      const lx = t.align === 'center' ? t.x - w / 2 : t.align === 'right' ? t.x - w : t.x
      if (nx >= lx && nx <= lx + w && ny >= t.y - h / 2 && ny <= t.y + h / 2) return t.id
    }
    return null
  }

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { nx, ny } = canvasXY(e)
    const hit = hitTest(nx, ny)
    if (hit) {
      setSelectedId(hit)
      const t = texts.find(tx => tx.id === hit)!
      dragOffset.current = { dx: nx - t.x, dy: ny - t.y }
      setDragging(true)
    } else {
      setSelectedId(null)
    }
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !selectedId) return
    const { nx, ny } = canvasXY(e)
    setTexts(prev => prev.map(t => t.id === selectedId
      ? { ...t, x: Math.max(0, Math.min(1, nx - dragOffset.current.dx)), y: Math.max(0.03, Math.min(0.97, ny - dragOffset.current.dy)) }
      : t))
  }

  const onMouseUp = () => setDragging(false)

  const updateActive = (patch: Partial<MemeText>) => {
    if (!selectedId) return
    setTexts(prev => prev.map(t => t.id === selectedId ? { ...t, ...patch } : t))
  }

  const addText = () => {
    const t = makeText({ text: 'NEW TEXT', y: 0.5 })
    setTexts(prev => [...prev, t])
    setSelectedId(t.id)
  }

  const removeText = (id: string) => {
    setTexts(prev => prev.filter(t => t.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const download = () => {
    const canvas = canvasRef.current!
    // Redraw without selection box
    const prevSelected = selectedId
    setSelectedId(null)
    setTimeout(() => {
      const link = document.createElement('a')
      link.download = `${imgName}-meme.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
      setSelectedId(prevSelected)
    }, 50)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {!imgSrc ? (
        // ── Template picker + upload ─────────────────────────────────────
        <div className="space-y-6">
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all
              ${dragOver ? 'border-yellow-400 bg-yellow-50' : 'border-line hover:border-yellow-400 hover:bg-yellow-50/40 bg-white'}`}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            <div className="w-14 h-14 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center text-2xl">😂</div>
            <p className="font-display font-bold text-ink text-lg">Upload your own image</p>
            <p className="text-mute text-sm">or pick a classic template below</p>
          </div>

          <div>
            <p className="font-display font-bold text-ink mb-4">Popular Templates</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {TEMPLATES.map((tpl) => (
                <button key={tpl.name} onClick={() => loadSrc(tpl.url, tpl.name)}
                  className="group flex flex-col gap-1.5 hover:-translate-y-1 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tpl.url} alt={tpl.name} crossOrigin="anonymous"
                    className="w-full aspect-square object-cover rounded-xl border border-line group-hover:border-yellow-400 transition-colors" />
                  <span className="text-xs text-mute text-center truncate font-medium">{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // ── Editor ──────────────────────────────────────────────────────
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Canvas */}
          <div className="bg-gray-50 rounded-2xl border border-line overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-mute">Canvas — drag text to reposition</span>
              <button onClick={() => { setImgSrc(null); imgRef.current = null }}
                className="text-xs text-mute hover:text-ink font-semibold">← Change image</button>
            </div>
            <div className="p-4 overflow-auto flex justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full rounded-xl shadow"
                style={{ cursor: dragging ? 'grabbing' : 'grab', maxHeight: '65vh' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>
            {/* Text layers */}
            <div className="bg-white border border-line rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-mute">Text Layers</p>
                <button onClick={addText} className="text-xs font-bold text-yellow-600 hover:text-yellow-700 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">+ Add</button>
              </div>
              <div className="space-y-1.5">
                {texts.map((t) => (
                  <div key={t.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border transition-all ${t.id === selectedId ? 'border-yellow-400 bg-yellow-50' : 'border-line hover:border-yellow-300'}`}
                    onClick={() => setSelectedId(t.id)}>
                    <span className="flex-1 text-sm text-ink font-medium truncate">{t.text || '(empty)'}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeText(t.id) }} className="text-red-400 hover:text-red-600 text-xs font-bold shrink-0">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active text editor */}
            {activeText && (
              <div className="bg-white border border-yellow-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">Edit Selected</p>

                <textarea
                  rows={2}
                  value={activeText.text}
                  onChange={e => updateActive({ text: e.target.value.toUpperCase() })}
                  placeholder="YOUR TEXT"
                  className="w-full border border-line rounded-xl px-3 py-2 text-sm font-bold text-ink resize-none focus:outline-none focus:border-yellow-400"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-mute font-semibold block mb-1">Font</label>
                    <select value={activeText.fontFamily} onChange={e => updateActive({ fontFamily: e.target.value })}
                      className="w-full border border-line rounded-lg px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-yellow-400">
                      {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-mute font-semibold block mb-1">Size ({activeText.fontSize}%)</label>
                    <input type="range" min={3} max={20} value={activeText.fontSize}
                      onChange={e => updateActive({ fontSize: Number(e.target.value) })}
                      className="w-full mt-1 accent-yellow-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-mute font-semibold block mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={activeText.color} onChange={e => updateActive({ color: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5" />
                      {['#ffffff', '#000000', '#ffff00', '#ff0000'].map(c => (
                        <button key={c} onClick={() => updateActive({ color: c })}
                          className={`w-6 h-6 rounded-md border-2 ${activeText.color === c ? 'border-yellow-500' : 'border-line'}`}
                          style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-mute font-semibold block mb-1">Outline Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={activeText.strokeColor} onChange={e => updateActive({ strokeColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5" />
                      {['#000000', '#ffffff', '#ff0000', '#0000ff'].map(c => (
                        <button key={c} onClick={() => updateActive({ strokeColor: c })}
                          className={`w-6 h-6 rounded-md border-2 ${activeText.strokeColor === c ? 'border-yellow-500' : 'border-line'}`}
                          style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-mute font-semibold block mb-1">Outline ({activeText.strokeWidth})</label>
                    <input type="range" min={0} max={8} value={activeText.strokeWidth}
                      onChange={e => updateActive({ strokeWidth: Number(e.target.value) })}
                      className="w-full accent-yellow-500" />
                  </div>
                  <div>
                    <label className="text-xs text-mute font-semibold block mb-1">Align</label>
                    <div className="flex gap-1">
                      {(['left', 'center', 'right'] as const).map(a => (
                        <button key={a} onClick={() => updateActive({ align: a })}
                          className={`flex-1 py-1 rounded-lg text-xs border ${activeText.align === a ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'border-line text-mute'}`}>
                          {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-mute font-semibold block mb-1">Style</label>
                    <div className="flex gap-1">
                      <button onClick={() => updateActive({ bold: !activeText.bold })}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold border ${activeText.bold ? 'bg-yellow-50 border-yellow-400' : 'border-line text-mute'}`}>B</button>
                      <button onClick={() => updateActive({ italic: !activeText.italic })}
                        className={`flex-1 py-1 rounded-lg text-xs italic border ${activeText.italic ? 'bg-yellow-50 border-yellow-400' : 'border-line text-mute'}`}>I</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={download}
              className="w-full btn-royal flex items-center justify-center gap-2 py-3 rounded-xl font-semibold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Meme
            </button>
          </div>
        </div>
      )}

      <div className="mt-8"><AdSlot position="footer" /></div>
    </div>
  )
}
