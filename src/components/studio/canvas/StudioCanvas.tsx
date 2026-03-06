'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useStudioStore } from '@/store'
import { AnnotationPin } from '@/types'
import { findPantoneByCode, findPantoneByHex } from '@/data/pantone'

export default function StudioCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    canvasSize,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    layers,
    activeLayerId,
    activeTool,
    brushSettings,
    gradientSettings,
    activePantoneHex,
    activePantoneCode,
    setSelection,
    showGrid,
    addLayer,
    updateLayer,
    pushHistory,
    addAnnotation,
    setActivePantone,
    addRecentColor,
  } = useStudioStore()

  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const cloneSource = useRef<{ x: number; y: number } | null>(null)
  const selectionStart = useRef<{ x: number; y: number } | null>(null)
  const isPanning = useRef(false)
  const lastPanPos = useRef<{ x: number; y: number } | null>(null)
  const activeLayerCanvas = useRef<HTMLCanvasElement | null>(null)

  // Convert screen coords to canvas coords
  const toCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }
      return {
        x: (clientX - rect.left) / zoom,
        y: (clientY - rect.top) / zoom,
      }
    },
    [zoom]
  )

  // Render all layers onto main canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const sorted = [...layers]
      .filter((l) => l.visible)
      .sort((a, b) => a.zIndex - b.zIndex)

    for (const layer of sorted) {
      ctx.save()
      ctx.globalAlpha = layer.opacity
      ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation

      if (layer.data) {
        const img = new Image()
        img.src = layer.data
        if (layer.width && layer.height) {
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height)
        } else {
          ctx.drawImage(img, layer.x, layer.y)
        }
      } else if (layer.type === 'shape' && layer.color) {
        ctx.fillStyle = layer.color
        if (layer.shape === 'ellipse') {
          ctx.beginPath()
          ctx.ellipse(
            layer.x + layer.width / 2,
            layer.y + layer.height / 2,
            layer.width / 2,
            layer.height / 2,
            0, 0, Math.PI * 2
          )
          ctx.fill()
        } else {
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height)
        }
      } else if (layer.type === 'text' && layer.text) {
        ctx.fillStyle = layer.color ?? activePantoneHex
        ctx.font = `${layer.fontSize ?? 24}px ${layer.fontFamily ?? 'DM Sans, sans-serif'}`
        ctx.fillText(layer.text, layer.x, layer.y)
      }

      ctx.restore()
    }

    // Draw grid
    if (showGrid) {
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 0.5
      const step = 40
      for (let x = 0; x <= canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y <= canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }
      ctx.restore()
    }
  }, [layers, showGrid, activePantoneHex])

  useEffect(() => { renderCanvas() }, [renderCanvas])

  // Paste images from clipboard as new image layers
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const imageItem = Array.from(items).find(
        (item) => item.kind === 'file' && item.type.startsWith('image/')
      )
      if (!imageItem) return

      const file = imageItem.getAsFile()
      if (!file) return

      e.preventDefault()

      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result as string
        const img = new Image()
        img.onload = () => {
          // Center roughly where the viewport is
          const center = toCanvas(window.innerWidth / 2, window.innerHeight / 2)
          const maxW = canvasSize.width
          const maxH = canvasSize.height
          const scale = Math.min(maxW / img.width, maxH / img.height, 1)
          const w = img.width * scale
          const h = img.height * scale
          const x = center.x - w / 2
          const y = center.y - h / 2

          addLayer({
            id: crypto.randomUUID(),
            name: file.name || 'Pasted image',
            type: 'image',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            x,
            y,
            width: w,
            height: h,
            data: src,
            zIndex: layers.length,
          })
          pushHistory('Paste image')
          renderCanvas()
        }
        img.src = src
      }
      reader.readAsDataURL(file)
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [addLayer, canvasSize, layers.length, pushHistory, renderCanvas, toCanvas])

  // Get or create active layer offscreen canvas
  const getActiveLayerCtx = useCallback(() => {
    const activeLayer = layers.find((l) => l.id === activeLayerId)
    if (!activeLayer || activeLayer.locked) return null

    if (!activeLayerCanvas.current) {
      activeLayerCanvas.current = document.createElement('canvas')
      activeLayerCanvas.current.width = canvasSize.width
      activeLayerCanvas.current.height = canvasSize.height
    }

    const offscreen = activeLayerCanvas.current
    const ctx = offscreen.getContext('2d')
    if (!ctx) return null

    // Load existing layer data
    if (activeLayer.data) {
      const img = new Image()
      img.src = activeLayer.data
      ctx.clearRect(0, 0, offscreen.width, offscreen.height)
      ctx.drawImage(img, 0, 0)
    }

    return { ctx, offscreen, layer: activeLayer }
  }, [layers, activeLayerId, canvasSize])

  const commitActiveLayer = useCallback(() => {
    if (!activeLayerCanvas.current || !activeLayerId) return
    const dataUrl = activeLayerCanvas.current.toDataURL()
    updateLayer(activeLayerId, { data: dataUrl })
    activeLayerCanvas.current = null
  }, [activeLayerId, updateLayer])

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pos = toCanvas(e.clientX, e.clientY)

      // Middle mouse or space+drag = pan
      if (e.button === 1 || activeTool === 'move' && e.altKey) {
        isPanning.current = true
        lastPanPos.current = { x: e.clientX, y: e.clientY }
        return
      }

      isDrawing.current = true
      lastPos.current = pos

      // Tool-specific start
      switch (activeTool) {
        case 'brush':
        case 'eraser':
        case 'healing-brush': {
          const result = getActiveLayerCtx()
          if (!result) return
          const { ctx } = result
          ctx.save()
          ctx.globalCompositeOperation =
            activeTool === 'eraser' ? 'destination-out' : 'source-over'
          ctx.globalAlpha = brushSettings.opacity
          ctx.strokeStyle = activePantoneHex
          ctx.lineWidth = brushSettings.size
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.beginPath()
          ctx.moveTo(pos.x, pos.y)
          break
        }

        case 'fill': {
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          floodFill(ctx, Math.round(pos.x), Math.round(pos.y), activePantoneHex, canvasSize)
          pushHistory('Fill')
          renderCanvas()
          break
        }

        case 'eyedropper': {
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          const pixel = ctx.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data
          const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`
          const pantone = findPantoneByHex(hex)
          if (pantone) {
            setActivePantone(pantone.code, pantone.hex)
          } else {
            addRecentColor(hex)
          }
          isDrawing.current = false
          break
        }

        case 'clone-stamp': {
          if (e.altKey) {
            cloneSource.current = pos
            isDrawing.current = false
          }
          break
        }

        case 'select-rect':
        case 'select-ellipse':
        case 'lasso': {
          selectionStart.current = pos
          setSelection({ x: pos.x, y: pos.y, width: 0, height: 0 })
          break
        }

        case 'annotation': {
          const pin: AnnotationPin = {
            id: crypto.randomUUID(),
            x: pos.x,
            y: pos.y,
            pantoneCode: activePantoneCode ?? '15-0545',
            label: `Zone ${Date.now().toString().slice(-4)}`,
          }
          addAnnotation(pin)
          isDrawing.current = false
          break
        }

        case 'text': {
          const text = prompt('Enter text:')
          if (!text) { isDrawing.current = false; return }
          addLayer({
            id: crypto.randomUUID(),
            name: `Text: ${text.slice(0, 12)}`,
            type: 'text',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            x: pos.x,
            y: pos.y,
            width: 200,
            height: 30,
            text,
            fontSize: 24,
            fontFamily: 'DM Sans',
            color: activePantoneHex,
            zIndex: layers.length,
          })
          pushHistory('Add text')
          isDrawing.current = false
          break
        }

        case 'shape-rect':
        case 'shape-ellipse': {
          selectionStart.current = pos
          break
        }
      }
    },
    [
      activeTool, toCanvas, brushSettings, activePantoneHex, activePantoneCode,
      getActiveLayerCtx, pushHistory, renderCanvas, setSelection,
      addAnnotation, addLayer, layers, canvasSize, setActivePantone, addRecentColor,
    ]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = toCanvas(e.clientX, e.clientY)

      // Panning
      if (isPanning.current && lastPanPos.current) {
        const dx = e.clientX - lastPanPos.current.x
        const dy = e.clientY - lastPanPos.current.y
        setPanOffset({ x: panOffset.x + dx, y: panOffset.y + dy })
        lastPanPos.current = { x: e.clientX, y: e.clientY }
        return
      }

      if (!isDrawing.current) return

      // Draw overlay cursor for brush
      const overlay = overlayRef.current
      if (overlay) {
        const octx = overlay.getContext('2d')
        if (octx) {
          octx.clearRect(0, 0, overlay.width, overlay.height)
          octx.beginPath()
          octx.arc(pos.x, pos.y, brushSettings.size / 2, 0, Math.PI * 2)
          octx.strokeStyle = 'rgba(255,255,255,0.5)'
          octx.lineWidth = 1
          octx.stroke()
        }
      }

      switch (activeTool) {
        case 'brush':
        case 'eraser':
        case 'healing-brush': {
          const result = getActiveLayerCtx()
          if (!result || !lastPos.current) return
          const { ctx, offscreen } = result
          ctx.lineTo(pos.x, pos.y)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(pos.x, pos.y)

          // Show live preview
          const main = canvasRef.current
          if (main) {
            const mctx = main.getContext('2d')
            if (mctx) {
              renderCanvas()
              mctx.save()
              mctx.globalAlpha = brushSettings.opacity
              mctx.globalCompositeOperation =
                activeTool === 'eraser' ? 'destination-out' : 'source-over'
              mctx.drawImage(offscreen, 0, 0)
              mctx.restore()
            }
          }
          break
        }

        case 'select-rect': {
          if (!selectionStart.current) return
          const x = Math.min(pos.x, selectionStart.current.x)
          const y = Math.min(pos.y, selectionStart.current.y)
          const w = Math.abs(pos.x - selectionStart.current.x)
          const h = Math.abs(pos.y - selectionStart.current.y)
          setSelection({ x, y, width: w, height: h })

          // Draw selection on overlay
          if (overlay) {
            const octx = overlay.getContext('2d')
            if (octx) {
              octx.clearRect(0, 0, overlay.width, overlay.height)
              octx.strokeStyle = 'rgba(255,255,255,0.8)'
              octx.lineWidth = 1
              octx.setLineDash([4, 3])
              octx.strokeRect(x, y, w, h)
              octx.fillStyle = 'rgba(255,255,255,0.05)'
              octx.fillRect(x, y, w, h)
            }
          }
          break
        }

        case 'shape-rect':
        case 'shape-ellipse': {
          if (!selectionStart.current || !overlay) return
          const octx = overlay.getContext('2d')
          if (!octx) return
          const x = Math.min(pos.x, selectionStart.current.x)
          const y = Math.min(pos.y, selectionStart.current.y)
          const w = Math.abs(pos.x - selectionStart.current.x)
          const h = Math.abs(pos.y - selectionStart.current.y)
          octx.clearRect(0, 0, overlay.width, overlay.height)
          octx.strokeStyle = activePantoneHex
          octx.fillStyle = activePantoneHex + '33'
          octx.lineWidth = 2
          octx.setLineDash([])
          if (activeTool === 'shape-ellipse') {
            octx.beginPath()
            octx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
            octx.fill()
            octx.stroke()
          } else {
            octx.fillRect(x, y, w, h)
            octx.strokeRect(x, y, w, h)
          }
          break
        }
      }

      lastPos.current = pos
    },
    [
      activeTool, toCanvas, brushSettings, activePantoneHex,
      getActiveLayerCtx, renderCanvas, setSelection, panOffset, setPanOffset,
    ]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const pos = toCanvas(e.clientX, e.clientY)

      if (isPanning.current) {
        isPanning.current = false
        lastPanPos.current = null
        return
      }

      if (!isDrawing.current) return
      isDrawing.current = false

      switch (activeTool) {
        case 'brush':
        case 'eraser':
        case 'healing-brush': {
          const result = getActiveLayerCtx()
          if (result) {
            result.ctx.restore()
          }
          commitActiveLayer()
          pushHistory(activeTool === 'eraser' ? 'Erase' : 'Brush stroke')
          renderCanvas()
          break
        }

        case 'gradient': {
          if (!lastPos.current) return
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          const grd =
            gradientSettings.type === 'linear'
              ? ctx.createLinearGradient(lastPos.current.x, lastPos.current.y, pos.x, pos.y)
              : ctx.createRadialGradient(
                  lastPos.current.x, lastPos.current.y, 0,
                  lastPos.current.x, lastPos.current.y,
                  Math.hypot(pos.x - lastPos.current.x, pos.y - lastPos.current.y)
                )
          grd.addColorStop(0, gradientSettings.colorA)
          grd.addColorStop(1, gradientSettings.colorB)

          const gradCanvas = document.createElement('canvas')
          gradCanvas.width = canvasSize.width
          gradCanvas.height = canvasSize.height
          const gctx = gradCanvas.getContext('2d')!
          gctx.fillStyle = grd
          gctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

          addLayer({
            id: crypto.randomUUID(),
            name: 'Gradient',
            type: 'paint',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            x: 0,
            y: 0,
            width: canvasSize.width,
            height: canvasSize.height,
            data: gradCanvas.toDataURL(),
            zIndex: layers.length,
          })
          pushHistory('Add gradient')
          renderCanvas()
          break
        }

        case 'shape-rect':
        case 'shape-ellipse': {
          if (!selectionStart.current) return
          const x = Math.min(pos.x, selectionStart.current.x)
          const y = Math.min(pos.y, selectionStart.current.y)
          const w = Math.abs(pos.x - selectionStart.current.x)
          const h = Math.abs(pos.y - selectionStart.current.y)
          if (w < 2 || h < 2) break

          addLayer({
            id: crypto.randomUUID(),
            name: activeTool === 'shape-ellipse' ? 'Ellipse' : 'Rectangle',
            type: 'shape',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            x, y, width: w, height: h,
            color: activePantoneHex,
            shape: activeTool === 'shape-ellipse' ? 'ellipse' : 'rect',
            zIndex: layers.length,
          })
          pushHistory('Add shape')

          const overlay = overlayRef.current
          if (overlay) {
            const octx = overlay.getContext('2d')
            octx?.clearRect(0, 0, overlay.width, overlay.height)
          }
          selectionStart.current = null
          renderCanvas()
          break
        }
      }
    },
    [
      activeTool, toCanvas, getActiveLayerCtx, commitActiveLayer,
      pushHistory, renderCanvas, gradientSettings, addLayer, layers,
      canvasSize, activePantoneHex,
    ]
  )

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(zoom + delta)
      }
    },
    [zoom, setZoom]
  )

  // Cursor style
  const getCursor = () => {
    switch (activeTool) {
      case 'move': return 'move'
      case 'brush': return 'crosshair'
      case 'eraser': return 'cell'
      case 'eyedropper': return 'crosshair'
      case 'text': return 'text'
      case 'crop': return 'crosshair'
      case 'fill': return 'cell'
      default: return 'default'
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden relative"
      onWheel={handleWheel}
    >
      {/* Rulers */}
      <Rulers canvasSize={canvasSize} zoom={zoom} />

      {/* Canvas wrapper with zoom + pan */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          position: 'relative',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Main canvas */}
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ display: 'block', cursor: getCursor() }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Overlay canvas (selection, cursor preview) */}
        <canvas
          ref={overlayRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Annotation pins */}
        <AnnotationPins />
      </div>
    </div>
  )
}

// ── Annotation pins overlay ───────────────────────────
function AnnotationPins() {
  const { annotations, activeTool } = useStudioStore()
  if (annotations.length === 0) return null

  return (
    <>
      {annotations.map((pin) => (
        (() => {
          const pantone = findPantoneByCode(pin.pantoneCode)
          const bg = pantone?.hex ?? '#7ec845'
          return (
        <div
          key={pin.id}
          style={{
            position: 'absolute',
            left: pin.x,
            top: pin.y,
            transform: 'translate(-50%, -100%)',
            pointerEvents: activeTool === 'annotation' ? 'auto' : 'none',
          }}
          className="flex flex-col items-center"
        >
          <div
            className="px-1.5 py-0.5 rounded text-[9px] font-medium text-white shadow-lg border border-white/20 whitespace-nowrap"
            style={{
              background: bg,
            }}
          >
            {pin.label}
          </div>
          <div className="w-px h-2 bg-white/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-white border border-neutral-400" />
        </div>
          )
        })()
      ))}
    </>
  )
}

// ── Rulers ────────────────────────────────────────────
function Rulers({
  canvasSize,
  zoom,
}: {
  canvasSize: { width: number; height: number }
  zoom: number
}) {
  const { showRulers } = useStudioStore()
  if (!showRulers) return null

  const step = zoom < 0.5 ? 100 : zoom < 1 ? 50 : 20
  const hTicks = Array.from({ length: Math.ceil(canvasSize.width / step) }, (_, i) => i * step)
  const vTicks = Array.from({ length: Math.ceil(canvasSize.height / step) }, (_, i) => i * step)

  return (
    <>
      {/* Horizontal ruler */}
      <div
        className="ruler absolute top-0 left-6 right-0 h-6 border-b border-neutral-800 z-10 flex items-end overflow-hidden"
        style={{ pointerEvents: 'none' }}
      >
        {hTicks.map((t) => (
          <div
            key={t}
            className="absolute flex flex-col items-center"
            style={{ left: t * zoom }}
          >
            <span style={{ fontSize: 7, color: '#555560' }}>{t}</span>
            <div className="w-px h-1.5 bg-neutral-700" />
          </div>
        ))}
      </div>

      {/* Vertical ruler */}
      <div
        className="ruler absolute top-6 left-0 w-6 bottom-0 border-r border-neutral-800 z-10 overflow-hidden"
        style={{ pointerEvents: 'none' }}
      >
        {vTicks.map((t) => (
          <div
            key={t}
            className="absolute flex items-center"
            style={{ top: t * zoom }}
          >
            <div className="w-1.5 h-px bg-neutral-700" />
            <span style={{ fontSize: 7, color: '#555560', writingMode: 'vertical-rl' }}>{t}</span>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Flood fill ────────────────────────────────────────
function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
  canvasSize: { width: number; height: number }
) {
  const imageData = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height)
  const data = imageData.data
  const width = canvasSize.width

  const hex = fillColor.replace('#', '')
  const fr = parseInt(hex.slice(0, 2), 16)
  const fg = parseInt(hex.slice(2, 4), 16)
  const fb = parseInt(hex.slice(4, 6), 16)

  const idx = (startY * width + startX) * 4
  const tr = data[idx], tg = data[idx + 1], tb = data[idx + 2], ta = data[idx + 3]

  if (tr === fr && tg === fg && tb === fb) return

  const stack = [[startX, startY]]
  const visited = new Set<number>()

  while (stack.length > 0) {
    const [x, y] = stack.pop()!
    const i = (y * width + x) * 4
    if (visited.has(i)) continue
    if (x < 0 || x >= width || y < 0 || y >= canvasSize.height) continue

    const dr = Math.abs(data[i] - tr)
    const dg = Math.abs(data[i + 1] - tg)
    const db = Math.abs(data[i + 2] - tb)
    const da = Math.abs(data[i + 3] - ta)
    if (dr + dg + db + da > 40) continue

    visited.add(i)
    data[i] = fr
    data[i + 1] = fg
    data[i + 2] = fb
    data[i + 3] = 255

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }

  ctx.putImageData(imageData, 0, 0)
}