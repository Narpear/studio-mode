'use client'

import { useState } from 'react'
import { useStudioStore } from '@/store'
import { PANTONE_COLORS } from '@/data/pantone'

export default function AnnotationsPanel() {
  const {
    annotations,
    removeAnnotation,
    updateAnnotation,
    activePantoneCode,
    activePantoneHex,
  } = useStudioStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')

  const startEdit = (id: string, label: string) => {
    setEditingId(id)
    setEditVal(label)
  }

  const commitEdit = (id: string) => {
    updateAnnotation(id, { label: editVal })
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header">Annotations</div>

      <div className="px-3 py-2 border-b border-neutral-800/60">
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5">
          <div
            className="w-4 h-4 rounded-full border border-neutral-700 shrink-0"
            style={{ background: activePantoneHex }}
          />
          <p className="text-[10px] text-neutral-500">
            Active: <span className="text-neutral-300">{activePantoneCode ?? '—'}</span>
          </p>
        </div>
        <p className="text-[10px] text-neutral-600 mt-1.5">
          Select the Annotation tool (A) and click on the canvas to pin color tags.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {annotations.length === 0 ? (
          <div className="text-center text-neutral-600 text-xs py-8 px-4">
            No annotations yet.<br />
            Use the pin tool to annotate garment zones.
          </div>
        ) : (
          annotations.map((pin, idx) => {
            const color = PANTONE_COLORS.find((c) => c.code === pin.pantoneCode)
            return (
              <div
                key={pin.id}
                className="flex items-start gap-2 px-3 py-2 hover:bg-neutral-800/30 group transition-colors border-b border-neutral-800/20"
              >
                <div className="flex flex-col items-center gap-0.5 shrink-0 mt-0.5">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white/20 shadow"
                    style={{ background: color?.hex ?? pin.pantoneCode }}
                  />
                  <span className="text-[8px] text-neutral-600 font-mono">{idx + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  {editingId === pin.id ? (
                    <input
                      autoFocus
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      onBlur={() => commitEdit(pin.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(pin.id) }}
                      className="studio-input text-xs py-0 h-5 mb-1"
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(pin.id, pin.label)}
                      className="text-left w-full"
                    >
                      <p className="text-xs text-neutral-300 truncate">{pin.label}</p>
                    </button>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="pantone-badge">{pin.pantoneCode}</span>
                    <span className="text-[9px] text-neutral-600 font-mono">
                      {Math.round(pin.x)}, {Math.round(pin.y)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeAnnotation(pin.id)}
                  className="hidden group-hover:block text-neutral-600 hover:text-red-400 transition-colors text-sm mt-0.5"
                >
                  ×
                </button>
              </div>
            )
          })
        )}
      </div>

      {annotations.length > 0 && (
        <div className="border-t border-neutral-800/60 px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] text-neutral-600">
            {annotations.length} pin{annotations.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => {
              const text = annotations
                .map((a, i) => `${i + 1}. ${a.label} — ${a.pantoneCode} (${a.x.toFixed(0)}, ${a.y.toFixed(0)})`)
                .join('\n')
              navigator.clipboard.writeText(text)
            }}
            className="text-[10px] text-neutral-500 hover:text-neutral-200 transition-colors"
          >
            Copy spec
          </button>
        </div>
      )}
    </div>
  )
}