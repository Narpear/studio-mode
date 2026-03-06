'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useStudioStore } from '@/store'
import { Layer, LayerType, BlendMode } from '@/types'

const BLEND_MODES: BlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
]

const LAYER_TYPE_ICONS: Record<LayerType, string> = {
  image: '🖼',
  paint: '🖌',
  text: 'T',
  shape: '◻',
  adjustment: '⚙',
}

export default function LayersPanel() {
  const {
    canvasSize,
    layers,
    activeLayerId,
    setActiveLayer,
    addLayer,
    removeLayer,
    duplicateLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    updateLayer,
    reorderLayers,
    pushHistory,
  } = useStudioStore()

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const reversed = [...layers].reverse()

  const handleAddLayer = (type: LayerType) => {
    if (type === 'image') {
      fileInputRef.current?.click()
      return
    }

    const layer: Layer = {
      id: crypto.randomUUID(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
      type,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      zIndex: layers.length,
    }
    addLayer(layer)
  }

  const handleImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const img = new Image()
      img.onload = () => {
        const maxW = canvasSize.width
        const maxH = canvasSize.height
        const scale = Math.min(maxW / img.width, maxH / img.height, 1)
        const w = img.width * scale
        const h = img.height * scale
        const x = (maxW - w) / 2
        const y = (maxH - h) / 2

        addLayer({
          id: crypto.randomUUID(),
          name: file.name || 'Image layer',
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
        pushHistory('Import image')
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === toIndex) return
    const fromReal = layers.length - 1 - dragIndex
    const toReal = layers.length - 1 - toIndex
    reorderLayers(fromReal, toReal)
    setDragIndex(null)
  }

  const startRename = (layer: Layer) => {
    setRenamingId(layer.id)
    setRenameValue(layer.name)
  }

  const commitRename = (id: string) => {
    if (renameValue.trim()) updateLayer(id, { name: renameValue.trim() })
    setRenamingId(null)
  }

  const activeLayer = layers.find((l) => l.id === activeLayerId)

  return (
    <div className="flex flex-col h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          handleImportFile(file)
          e.target.value = ''
        }}
      />
      {/* Header */}
      <div className="panel-header flex items-center justify-between">
        <span>Layers</span>
        <div className="flex items-center gap-1">
          <IconBtn title="Add paint layer" onClick={() => handleAddLayer('paint')}>
            <PlusIcon />
          </IconBtn>
          <LayerTypeMenu onSelect={handleAddLayer} />
        </div>
      </div>

      {/* Active layer properties */}
      {activeLayer && (
        <div className="px-3 py-2 border-b border-neutral-800/60 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 w-12 shrink-0">Opacity</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={activeLayer.opacity}
              onChange={(e) => updateLayer(activeLayer.id, { opacity: parseFloat(e.target.value) })}
              className="studio-slider flex-1"
            />
            <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">
              {Math.round(activeLayer.opacity * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 w-12 shrink-0">Blend</span>
            <select
              value={activeLayer.blendMode}
              onChange={(e) => updateLayer(activeLayer.id, { blendMode: e.target.value as BlendMode })}
              className="blend-select flex-1"
            >
              {BLEND_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto py-1">
        {reversed.length === 0 && (
          <div className="text-center text-neutral-600 text-xs py-8 px-4">
            No layers yet.<br />Click + to add one.
          </div>
        )}
        {reversed.map((layer, idx) => (
          <div
            key={layer.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, idx)}
            className={`layer-item group ${activeLayerId === layer.id ? 'active' : ''}`}
            onClick={() => setActiveLayer(layer.id)}
            onDoubleClick={() => startRename(layer)}
          >
            {/* Visibility */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id) }}
              className="text-neutral-500 hover:text-neutral-200 transition-colors shrink-0 text-xs w-4"
              title="Toggle visibility"
            >
              {layer.visible ? '👁' : '○'}
            </button>

            {/* Type icon */}
            <span className="text-[10px] text-neutral-500 shrink-0 w-4 text-center">
              {LAYER_TYPE_ICONS[layer.type]}
            </span>

            {/* Thumbnail */}
            <div className="w-6 h-6 rounded bg-neutral-800 shrink-0 overflow-hidden border border-neutral-700">
              {layer.data && (
                <Image
                  src={layer.data}
                  alt=""
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              )}
              {layer.type === 'shape' && layer.color && (
                <div className="w-full h-full" style={{ background: layer.color }} />
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              {renamingId === layer.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => commitRename(layer.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(layer.id)
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="studio-input text-xs py-0 h-5"
                />
              ) : (
                <span className="text-xs text-neutral-300 truncate block">
                  {layer.name}
                </span>
              )}
            </div>

            {/* Actions (show on hover) */}
            <div className="hidden group-hover:flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id) }}
                className="text-neutral-500 hover:text-neutral-200 text-[10px]"
                title="Lock layer"
              >
                {layer.locked ? '🔒' : '🔓'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id) }}
                className="text-neutral-500 hover:text-neutral-200 text-[10px]"
                title="Duplicate"
              >
                <DuplicateIcon />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeLayer(layer.id) }}
                className="text-neutral-500 hover:text-red-400 text-[10px]"
                title="Delete"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="border-t border-neutral-800/60 px-3 py-2 flex items-center gap-2">
        <button
          onClick={() => activeLayerId && duplicateLayer(activeLayerId)}
          disabled={!activeLayerId}
          className="flex-1 text-xs text-neutral-400 hover:text-neutral-200 disabled:opacity-30 transition-colors"
        >
          Duplicate
        </button>
        <div className="w-px h-3 bg-neutral-700" />
        <button
          onClick={() => activeLayerId && removeLayer(activeLayerId)}
          disabled={!activeLayerId}
          className="flex-1 text-xs text-neutral-400 hover:text-red-400 disabled:opacity-30 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function LayerTypeMenu({ onSelect }: { onSelect: (t: LayerType) => void }) {
  const [open, setOpen] = useState(false)
  const types: { type: LayerType; label: string }[] = [
    { type: 'paint', label: 'Paint Layer' },
    { type: 'image', label: 'Image Layer' },
    { type: 'text', label: 'Text Layer' },
    { type: 'shape', label: 'Shape Layer' },
    { type: 'adjustment', label: 'Adjustment Layer' },
  ]
  return (
    <div className="relative">
      <IconBtn title="Add layer type" onClick={() => setOpen(!open)}>
        <ChevronIcon />
      </IconBtn>
      {open && (
        <div className="absolute right-0 top-6 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50 py-1 w-40 fade-in">
          {types.map((t) => (
            <button
              key={t.type}
              onClick={() => { onSelect(t.type); setOpen(false) }}
              className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-5 h-5 flex items-center justify-center text-neutral-500 hover:text-neutral-200 transition-colors rounded hover:bg-neutral-800"
    >
      {children}
    </button>
  )
}

function PlusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function DuplicateIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <rect x="3" y="3" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 7H1.5A0.5 0.5 0 011 6.5V1.5A0.5 0.5 0 011.5 1H6.5A0.5 0.5 0 017 1.5V2" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M1.5 3H8.5M4 3V2H6V3M3 3L3.5 8H6.5L7 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}