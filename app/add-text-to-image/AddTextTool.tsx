'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import AdSlot from '@/components/AdSlot'

interface TextLayer {
  id: string
  text: string
  x: number        // 0-1
  y: number        // 0-1
  fontSize: number // px relative to canvas
  color: string
  fontFamily: string
  bold: boolean
  italic: boolean
  underline: boolean
  align: 'left' | 'center' | 'right'
  opacity: number
  rotation: number // degrees
  shadow: boolean
  shadowColor: string
  bg: boolean
  bgColor: string
}

const FONTS = [
  'Arial', 'Georgia', 'Times New Roman', 'Impact', 'Courier New',
  'Verdana', 'Trebuchet MS', 'Comic Sans MS', 'Oswald', 'Lobster',
]

function uid() { return Math.random().toString(36).slice(2) }

function makeLayer(partial?: Partial<TextLayer>): TextLayer {
  return {
    id: uid(),
    text: 'Click to edit',
    x: 0.5, y: 0.5,
    fontSize: 5,
    color: '#ffffff',
    fontFamily: 'Arial',
    bold: true,
    italic: false,
    underline: false,
    align: 'center',
    opacity: 1,
    rotation: 0,
    shadow: true,
    shadowColor: '#000000',
    bg: false,
    bgColor: 'rgba(0,0,0,0.5)',
    ...partial,
  }
}

export default function AddTextTool() {
  const [layers, setLayers] = useState<TextLayer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [imgName, setImgName] = useState('image')
  const [addingText, setAddingText] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const dragOffset = useRef({ dx: 0, dy: 0 })
  const isDragging = useRef(false)

  const selectedLayer = layers.find(l => l.id === selectedId)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)

    for (const l of layers) {
      if (!l.text.trim()) continue
      const px = (l.fontSize / 100) * canvas.height
      ctx.save()
      ctx.globalAlpha = l.opacity
      ctx.translate(l.x * canvas.width, l.y * canvas.height)
      ctx.rotate((l.rotation * Math.PI) / 180)

      const fontStr = `${l.italic ? 'italic ' : ''}${l.bold ? 'bold ' : ''}${px}px "${l.fontFamily}"`
      ctx.font = fontStr
      ctx.textAlign = l.align
      ctx.textBaseline = 'middle'

      const lines = l.text.split('\n')
      const lineH = px * 1.3

      lines.forEach((line, li) => {
        const yOff = (li - (lines.length - 1) / 2) * lineH
        const metrics = ctx.measureText(line)
        const tw = metrics.width

        // Background
        if (l.bg) {
          ctx.fillStyle = l.bgColor
          const bx = l.align === 'center' ? -tw / 2 - 6 : l.align === 'right' ? -tw - 6 : -6
          ctx.fillRect(bx, yOff - px / 2 - 4, tw + 12, px + 8)
        }

        // Shadow
        if (l.shadow) {
          ctx.shadowColor = l.shadowColor
          ctx.shadowBlur = 6
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2
        }

        ctx.fillStyle = l.color
        ctx.fillText(line, 0, yOff)

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Underline
        if (l.underline) {
          const ulX = l.align === 'center' ? -tw / 2 : l.align === 'right' ? -tw : 0
          ctx.strokeStyle = l.color
          ctx.lineWidth = Math.max(1, px / 18)
          ctx.beginPath()
          ctx.moveTo(ulX, yOff + px / 2 + 2)
          ctx.lineTo(ulX + tw, yOff + px / 2 + 2)
          ctx.stroke()
        }
      })

      // Selection ring
      if (l.id === selectedId) {
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2 / (canvas.width / canvas.offsetWidth || 1)
        ctx.setLineDash([5, 3])
        const approxW = ctx.measureText(l.text.split('\n').reduce((a, b) => a.length > b.length ? a : b)).width + 24
        const approxH = lines.length * lineH + 16
        ctx.strokeRect(-approxW / 2, -approxH / 2, approxW, approxH)
        ctx.setLineDash([])
      }

      ctx.restore()
    }
  }, [layers, selectedId])

  useEffect(() => { draw() }, [draw])

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const url = URL.createObjectURL(file)
    urlRef.current = url
    setImgName(file.name.replace(/\.[^.]+$/, ''))
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const canvas = canvasRef.current!
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      setImgLoaded(true)
    }
    img.src = url
  }, [])

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
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i]
      ctx.font = `${l.bold ? 'bold ' : ''}${(l.fontSize / 100) * canvas.height}px "${l.fontFamily}"`
      const tw = ctx.measureText(l.text.split('\n').reduce((a, b) => a.length > b.length ? a : b)).width
      const ph = (l.fontSize / 100) * canvas.height
      const approxW = (tw + 24) / canvas.width
      const approxH = ((l.text.split('\n').length * ph * 1.3) + 16) / canvas.height
      if (Math.abs(nx - l.x) < approxW / 2 && Math.abs(ny - l.y) < approxH / 2) return l.id
    }
    return null
  }

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { nx, ny } = canvasXY(e)
    if (addingText) {
      const layer = makeLayer({ x: nx, y: ny, text: 'Your text here' })
      setLayers(prev => [...prev, layer])
      setSelectedId(layer.id)
      setAddingText(false)
      return
    }
    const hit = hitTest(nx, ny)
    if (hit) {
      setSelectedId(hit)
      const l = layers.find(lx => lx.id === hit)!
      dragOffset.current = { dx: nx - l.x, dy: ny - l.y }
      isDragging.current = true
      setDragging(true)
    } else {
      setSelectedId(null)
    }
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || !selectedId) return
    const { nx, ny } = canvasXY(e)
    setLayers(prev => prev.map(l => l.id === selectedId
      ? { ...l, x: Math.max(0, Math.min(1, nx - dragOffset.current.dx)), y: Math.max(0, Math.min(1, ny - dragOffset.current.dy)) }
      : l))
  }

  const onMouseUp = () => { isDragging.current = false; setDragging(false) }

  const updateLayer = (patch: Partial<TextLayer>) => {
    if (!selectedId) return
    setLayers(prev => prev.map(l => l.id === selectedId ? { ...l, ...patch } : l))
  }

  const addLayer = () => {
    setAddingText(true)
  }

  const deleteLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const download = () => {
    const prevSel = selectedId
    setSelectedId(null)
    setTimeout(() => {
      const canvas = canvasRef.current!
      const link = document.createElement('a')
      link.download = `${imgName}-text.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
      setSelectedId(prevSel)
    }, 50)
  }

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (!imgLoaded) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f) }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 flex flex-col items-center gap-4 cursor-pointer transition-all select-none
            ${dragOver ? 'border-purple-400 bg-purple-50 scale-[1.01]' : 'border-line hover:border-purple-400 hover:bg-purple-50/40 bg-white'}`}
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) loadFile(e.target.files[0]); e.target.value = '' }} />
          <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-3xl">🖊️</div>
          <div className="text-center">
            <p className="font-display font-bold text-ink text-lg">Drop your image here</p>
            <p className="text-mute text-sm mt-1">JPG, PNG, or WebP · 100% browser-based, no uploads</p>
          </div>
        </div>
        <AdSlot position="footer" />
      </div>
    )
  }

  // ── Editor ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Canvas */}
        <div className="bg-gray-50 rounded-2xl border border-line overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-mute">
              {addingText ? '👆 Click on image to place text' : 'Drag text layers to reposition'}
            </span>
            <div className="flex gap-2">
              <button onClick={addLayer}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${addingText ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'}`}>
                {addingText ? '↖ Click to place' : '+ Add Text'}
              </button>
              {addingText && (
                <button onClick={() => setAddingText(false)} className="text-xs text-mute hover:text-ink border border-line px-3 py-1.5 rounded-lg">Cancel</button>
              )}
            </div>
          </div>
          <div className="p-4 overflow-auto flex justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-xl shadow block"
              style={{ cursor: addingText ? 'crosshair' : dragging ? 'grabbing' : 'grab', maxHeight: '65vh' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>
          {/* Layer list */}
          <div className="bg-white border border-line rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-mute mb-3">Text Layers ({layers.length})</p>
            {layers.length === 0 ? (
              <p className="text-xs text-mute text-center py-3">Click "+ Add Text" and click on the image</p>
            ) : (
              <div className="space-y-1.5">
                {layers.map((l) => (
                  <div key={l.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border transition-all ${l.id === selectedId ? 'border-purple-400 bg-purple-50' : 'border-line hover:border-purple-200'}`}
                    onClick={() => setSelectedId(l.id)}>
                    <span className="flex-1 text-sm text-ink truncate">{l.text.split('\n')[0] || '(empty)'}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(l.id) }} className="text-red-400 hover:text-red-600 text-xs shrink-0">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Properties panel */}
          {selectedLayer && (
            <div className="bg-white border border-purple-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-600">Properties</p>

              <textarea rows={3} value={selectedLayer.text}
                onChange={e => updateLayer({ text: e.target.value })}
                className="w-full border border-line rounded-xl px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:border-purple-400"
                placeholder="Enter text…" />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-mute font-semibold block mb-1">Font</label>
                  <select value={selectedLayer.fontFamily} onChange={e => updateLayer({ fontFamily: e.target.value })}
                    className="w-full border border-line rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-purple-400">
                    {FONTS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-mute font-semibold block mb-1">Size ({selectedLayer.fontSize}%)</label>
                  <input type="range" min={1} max={25} value={selectedLayer.fontSize}
                    onChange={e => updateLayer({ fontSize: Number(e.target.value) })}
                    className="w-full mt-1.5 accent-purple-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-mute font-semibold block mb-1">Color</label>
                  <div className="flex items-center gap-1.5">
                    <input type="color" value={selectedLayer.color} onChange={e => updateLayer({ color: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5" />
                    {['#ffffff', '#000000', '#facc15', '#ef4444', '#3b82f6'].map(c => (
                      <button key={c} onClick={() => updateLayer({ color: c })}
                        className={`w-5 h-5 rounded border-2 ${selectedLayer.color === c ? 'border-purple-500' : 'border-gray-200'}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-mute font-semibold block mb-1">Opacity</label>
                  <input type="range" min={0.1} max={1} step={0.05} value={selectedLayer.opacity}
                    onChange={e => updateLayer({ opacity: Number(e.target.value) })}
                    className="w-full mt-1.5 accent-purple-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-mute font-semibold block mb-1">Rotation ({selectedLayer.rotation}°)</label>
                  <input type="range" min={-180} max={180} value={selectedLayer.rotation}
                    onChange={e => updateLayer({ rotation: Number(e.target.value) })}
                    className="w-full accent-purple-600" />
                </div>
                <div>
                  <label className="text-xs text-mute font-semibold block mb-1">Align</label>
                  <div className="flex gap-1 mt-1">
                    {(['left', 'center', 'right'] as const).map(a => (
                      <button key={a} onClick={() => updateLayer({ align: a })}
                        className={`flex-1 py-1 rounded-lg text-xs border ${selectedLayer.align === a ? 'bg-purple-50 border-purple-400 text-purple-700' : 'border-line text-mute'}`}>
                        {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Style toggles */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'bold', label: 'Bold' },
                  { key: 'italic', label: 'Italic' },
                  { key: 'underline', label: 'Underline' },
                  { key: 'shadow', label: 'Shadow' },
                  { key: 'bg', label: 'BG Box' },
                ].map(({ key, label }) => (
                  <button key={key}
                    onClick={() => updateLayer({ [key]: !selectedLayer[key as keyof TextLayer] })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${selectedLayer[key as keyof TextLayer] ? 'bg-purple-50 border-purple-400 text-purple-700' : 'border-line text-mute hover:border-purple-200'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {selectedLayer.bg && (
                <div>
                  <label className="text-xs text-mute font-semibold block mb-1">Background Color</label>
                  <input type="color" value={selectedLayer.bgColor.startsWith('rgba') ? '#000000' : selectedLayer.bgColor}
                    onChange={e => updateLayer({ bgColor: e.target.value + '99' })}
                    className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5" />
                </div>
              )}
            </div>
          )}

          <button onClick={download}
            className="w-full btn-royal flex items-center justify-center gap-2 py-3 rounded-xl font-semibold">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Image
          </button>

          <button onClick={() => { setImgLoaded(false); setLayers([]); imgRef.current = null }}
            className="w-full py-2.5 rounded-xl border border-line text-mute hover:text-ink text-sm font-semibold transition-colors">
            Start Over
          </button>
        </div>
      </div>
      <div className="mt-8"><AdSlot position="footer" /></div>
    </div>
  )
}
