'use client'

import { useStudioStore } from '@/store'
import { BlendMode, TextureType } from '@/types'

const BLEND_MODES: BlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay',
  'darken', 'lighten', 'color-dodge', 'color-burn',
  'hard-light', 'soft-light', 'difference', 'exclusion',
]

const TEXTURES: { type: TextureType; label: string }[] = [
  { type: 'none', label: 'None' },
  { type: 'linen', label: 'Linen' },
  { type: 'silk', label: 'Silk' },
  { type: 'denim', label: 'Denim' },
  { type: 'wool', label: 'Wool' },
  { type: 'jersey', label: 'Jersey' },
]

export default function BrushSettingsPanel() {
  const {
    brushSettings,
    setBrushSettings,
    gradientSettings,
    setGradientSettings,
    activeTexture,
    setActiveTexture,
    activeTool,
    activePantoneHex,
    secondaryPantoneHex,
  } = useStudioStore()

  const isBrush = activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'clone-stamp' || activeTool === 'healing-brush'
  const isGradient = activeTool === 'gradient'
  const showTextures = isBrush

  return (
    <div className="flex flex-col">
      <div className="panel-header">Tool Settings</div>

      <div className="px-3 py-2 space-y-3">
        {isBrush && (
          <>
            <SliderRow
              label="Size"
              min={1}
              max={200}
              value={brushSettings.size}
              onChange={(v) => setBrushSettings({ size: v })}
              unit="px"
            />
            <SliderRow
              label="Opacity"
              min={0}
              max={1}
              step={0.01}
              value={brushSettings.opacity}
              onChange={(v) => setBrushSettings({ opacity: v })}
              unit="%"
              displayMultiplier={100}
            />
            <SliderRow
              label="Hardness"
              min={0}
              max={1}
              step={0.01}
              value={brushSettings.hardness}
              onChange={(v) => setBrushSettings({ hardness: v })}
              unit="%"
              displayMultiplier={100}
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 w-14 shrink-0">Blend</span>
              <select
                value={brushSettings.blendMode}
                onChange={(e) => setBrushSettings({ blendMode: e.target.value as BlendMode })}
                className="blend-select flex-1"
              >
                {BLEND_MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {isGradient && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 w-14 shrink-0">Type</span>
              <div className="flex gap-1 flex-1">
                {(['linear', 'radial'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setGradientSettings({ type: t })}
                    className={`flex-1 text-[10px] py-1 rounded transition-colors capitalize ${
                      gradientSettings.type === t
                        ? 'bg-neutral-700 text-white'
                        : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 w-14 shrink-0">Colors</span>
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-6 h-6 rounded border border-neutral-700"
                  style={{ background: activePantoneHex }}
                  title="From color (active)"
                />
                <div
                  className="flex-1 h-4 rounded"
                  style={{
                    background: `linear-gradient(to right, ${activePantoneHex}, ${secondaryPantoneHex})`,
                  }}
                />
                <div
                  className="w-6 h-6 rounded border border-neutral-700"
                  style={{ background: secondaryPantoneHex }}
                  title="To color (secondary)"
                />
              </div>
            </div>
            <SliderRow
              label="Angle"
              min={0}
              max={360}
              value={gradientSettings.angle}
              onChange={(v) => setGradientSettings({ angle: v })}
              unit="°"
            />
          </>
        )}

        {showTextures && (
          <div>
            <p className="text-[10px] text-neutral-500 mb-1.5">Fabric Texture</p>
            <div className="grid grid-cols-3 gap-1">
              {TEXTURES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => setActiveTexture(t.type)}
                  className={`text-[10px] py-1 rounded transition-colors ${
                    activeTexture === t.type
                      ? 'bg-neutral-700 text-white border border-neutral-500'
                      : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300 border border-neutral-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isBrush && !isGradient && (
          <p className="text-[10px] text-neutral-600 py-2 text-center">
            Select a brush or gradient tool to see settings
          </p>
        )}
      </div>
    </div>
  )
}

function SliderRow({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = '',
  displayMultiplier = 1,
}: {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  unit?: string
  displayMultiplier?: number
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-neutral-500 w-14 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="studio-slider flex-1"
      />
      <span className="text-[10px] font-mono text-neutral-400 w-10 text-right">
        {Math.round(value * displayMultiplier)}{unit}
      </span>
    </div>
  )
}