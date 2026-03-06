'use client'

import { useState } from 'react'
import { useStudioStore } from '@/store'
import { AdjustmentType, AdjustmentValues, Layer } from '@/types'

const ADJUSTMENT_TYPES: { type: AdjustmentType; label: string; icon: string }[] = [
  { type: 'hue-saturation', label: 'Hue / Saturation', icon: '◑' },
  { type: 'brightness-contrast', label: 'Brightness / Contrast', icon: '☀' },
  { type: 'color-balance', label: 'Color Balance', icon: '⚖' },
  { type: 'curves', label: 'Curves', icon: '〜' },
  { type: 'levels', label: 'Levels', icon: '▦' },
  { type: 'vibrance', label: 'Vibrance', icon: '✦' },
  { type: 'black-white', label: 'Black & White', icon: '◐' },
]

export default function AdjustmentsPanel() {
  const { layers, addLayer, updateLayer } = useStudioStore()
  const [expandedType, setExpandedType] = useState<AdjustmentType | null>(null)

  const adjustmentLayers = layers.filter((l) => l.type === 'adjustment')

  const addAdjustmentLayer = (type: AdjustmentType) => {
    const defaults = getDefaults(type)
    const layer: Layer = {
      id: crypto.randomUUID(),
      name: ADJUSTMENT_TYPES.find((a) => a.type === type)?.label ?? type,
      type: 'adjustment',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      adjustmentType: type,
      adjustmentValues: defaults,
      zIndex: layers.length,
    }
    addLayer(layer)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header">Adjustments</div>

      {/* Add adjustment */}
      <div className="px-3 py-2 border-b border-neutral-800/60">
        <p className="text-[10px] text-neutral-500 mb-2">Add Adjustment Layer</p>
        <div className="grid grid-cols-2 gap-1">
          {ADJUSTMENT_TYPES.map((a) => (
            <button
              key={a.type}
              onClick={() => addAdjustmentLayer(a.type)}
              className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 rounded text-[10px] text-neutral-300 hover:text-white transition-all text-left"
            >
              <span className="text-neutral-500">{a.icon}</span>
              <span className="truncate">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Existing adjustment layers */}
      <div className="flex-1 overflow-y-auto">
        {adjustmentLayers.length === 0 ? (
          <div className="text-center text-neutral-600 text-xs py-8 px-4">
            No adjustment layers.<br />Add one above.
          </div>
        ) : (
          <div className="py-1">
            {adjustmentLayers.map((layer) => (
              <AdjustmentLayerItem
                key={layer.id}
                layer={layer}
                expanded={expandedType === layer.adjustmentType}
                onToggle={() =>
                  setExpandedType(
                    expandedType === layer.adjustmentType ? null : layer.adjustmentType!
                  )
                }
                onUpdate={(vals) => updateLayer(layer.id, { adjustmentValues: vals })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AdjustmentLayerItem({
  layer,
  expanded,
  onToggle,
  onUpdate,
}: {
  layer: Layer
  expanded: boolean
  onToggle: () => void
  onUpdate: (vals: AdjustmentValues) => void
}) {
  const vals = layer.adjustmentValues ?? {}
  const info = ADJUSTMENT_TYPES.find((a) => a.type === layer.adjustmentType)

  return (
    <div className="border-b border-neutral-800/40">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-800/40 transition-colors text-left"
      >
        <span className="text-neutral-500 text-xs">{info?.icon}</span>
        <span className="text-xs text-neutral-300 flex-1">{layer.name}</span>
        <span className="text-[10px] text-neutral-600">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && layer.adjustmentType && (
        <div className="px-3 pb-3 space-y-2 fade-in">
          <AdjustmentControls
            type={layer.adjustmentType}
            values={vals}
            onChange={onUpdate}
          />
        </div>
      )}
    </div>
  )
}

function AdjustmentControls({
  type,
  values,
  onChange,
}: {
  type: AdjustmentType
  values: AdjustmentValues
  onChange: (v: AdjustmentValues) => void
}) {
  const set = (key: keyof AdjustmentValues, val: number) =>
    onChange({ ...values, [key]: val })

  switch (type) {
    case 'hue-saturation':
      return (
        <>
          <SliderRow label="Hue" min={-180} max={180} value={values.hue ?? 0} onChange={(v) => set('hue', v)} />
          <SliderRow label="Saturation" min={-100} max={100} value={values.saturation ?? 0} onChange={(v) => set('saturation', v)} />
          <SliderRow label="Lightness" min={-100} max={100} value={values.lightness ?? 0} onChange={(v) => set('lightness', v)} />
        </>
      )
    case 'brightness-contrast':
      return (
        <>
          <SliderRow label="Brightness" min={-150} max={150} value={values.brightness ?? 0} onChange={(v) => set('brightness', v)} />
          <SliderRow label="Contrast" min={-150} max={150} value={values.contrast ?? 0} onChange={(v) => set('contrast', v)} />
        </>
      )
    case 'vibrance':
      return (
        <>
          <SliderRow label="Vibrance" min={-100} max={100} value={values.vibrance ?? 0} onChange={(v) => set('vibrance', v)} />
          <SliderRow label="Saturation" min={-100} max={100} value={values.saturation ?? 0} onChange={(v) => set('saturation', v)} />
        </>
      )
    case 'black-white':
      return (
        <div className="text-[10px] text-neutral-500 py-1">
          Converts layer to grayscale when applied.
          <SliderRow label="Intensity" min={0} max={100} value={values.brightness ?? 100} onChange={(v) => set('brightness', v)} />
        </div>
      )
    case 'color-balance':
      return (
        <>
          <p className="text-[10px] text-neutral-600 mb-1">Shadows</p>
          <SliderRow label="C/R" min={-100} max={100} value={values.shadows?.[0] ?? 0} onChange={(v) => onChange({ ...values, shadows: [v, values.shadows?.[1] ?? 0, values.shadows?.[2] ?? 0] })} />
          <SliderRow label="M/G" min={-100} max={100} value={values.shadows?.[1] ?? 0} onChange={(v) => onChange({ ...values, shadows: [values.shadows?.[0] ?? 0, v, values.shadows?.[2] ?? 0] })} />
          <SliderRow label="Y/B" min={-100} max={100} value={values.shadows?.[2] ?? 0} onChange={(v) => onChange({ ...values, shadows: [values.shadows?.[0] ?? 0, values.shadows?.[1] ?? 0, v] })} />
        </>
      )
    default:
      return (
        <p className="text-[10px] text-neutral-600">
          Controls for {type} coming soon.
        </p>
      )
  }
}

function SliderRow({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-neutral-500 w-16 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="studio-slider flex-1"
      />
      <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">
        {Math.round(value)}
      </span>
    </div>
  )
}

function getDefaults(type: AdjustmentType): AdjustmentValues {
  switch (type) {
    case 'hue-saturation': return { hue: 0, saturation: 0, lightness: 0 }
    case 'brightness-contrast': return { brightness: 0, contrast: 0 }
    case 'vibrance': return { vibrance: 0, saturation: 0 }
    case 'black-white': return { brightness: 100 }
    case 'color-balance': return { shadows: [0, 0, 0], midtones: [0, 0, 0], highlights: [0, 0, 0] }
    default: return {}
  }
}