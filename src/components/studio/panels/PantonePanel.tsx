'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useStudioStore } from '@/store'
import { PANTONE_COLORS, getColorHarmonies } from '@/data/pantone'
import { PantoneColor } from '@/types'

const SEASON_COLLECTIONS = [
  {
    name: 'Color of the Year 2025',
    colors: ['17-1230', '13-1520', '15-3919'],
  },
  {
    name: 'Spring/Summer Pastels',
    colors: ['13-1520', '15-3919', '12-0752', '14-4811', '13-0117'],
  },
  {
    name: 'Fall/Winter Earthtones',
    colors: ['18-1048', '17-1230', '19-0812', '16-0947', '18-0615'],
  },
  {
    name: 'Pantone Neons',
    colors: ['15-0545', '15-1157', '14-0756', '16-4529', '16-5942'],
  },
]

type TabType = 'library' | 'harmony' | 'collections' | 'recent'

export default function PantonePanel() {
  const router = useRouter()
  const {
    activePantoneCode,
    activePantoneHex,
    recentColors,
    setActivePantone,
  } = useStudioStore()

  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabType>('library')

  const filtered = useMemo(() => {
    if (!search.trim()) return PANTONE_COLORS.slice(0, 120)
    const q = search.toLowerCase()
    return PANTONE_COLORS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    ).slice(0, 80)
  }, [search])

  const harmonies = useMemo(() => {
    if (!activePantoneCode) return null
    return getColorHarmonies(activePantoneCode)
  }, [activePantoneCode])

  const handleSelect = (color: PantoneColor) => {
    setActivePantone(color.code, `#${color.hex.replace('#', '')}`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7ec845]" />
          <span>Pantone Mode</span>
        </div>
        <button
          onClick={() => router.push('/library')}
          className="text-[10px] text-neutral-500 hover:text-neutral-200 transition-colors"
          title="Open the full Pantone library"
        >
          Library →
        </button>
      </div>

      {/* Active color display */}
      <div className="px-3 py-2.5 border-b border-neutral-800/60">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-lg border border-neutral-700 shrink-0 shadow-inner"
            style={{ background: activePantoneHex }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-neutral-200 truncate capitalize">
              {PANTONE_COLORS.find(c => c.code === activePantoneCode)?.name ?? '—'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="pantone-badge">{activePantoneCode}</span>
              <span className="text-[10px] font-mono text-neutral-600 uppercase">
                {activePantoneHex}
              </span>
            </div>
          </div>
        </div>

        {/* Color values */}
        <ColorValues hex={activePantoneHex} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800/60">
        {(['library', 'harmony', 'collections', 'recent'] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-[10px] py-1.5 capitalize transition-colors ${
              tab === t
                ? 'text-neutral-100 border-b border-[#7ec845]'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'library' && (
          <div className="p-2 space-y-2">
            <input
              type="text"
              placeholder="Search name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="studio-input text-xs"
            />
            <div className="grid grid-cols-8 gap-1">
              {filtered.map((color) => (
                <SwatchCell
                  key={color.code}
                  color={color}
                  active={activePantoneCode}
                  onSelect={handleSelect}
                />
              ))}
            </div>
            {!search && (
              <p className="text-[10px] text-neutral-600 text-center">
                Showing 120 of {PANTONE_COLORS.length}. Search to filter.
              </p>
            )}
          </div>
        )}

        {tab === 'harmony' && (
          <div className="p-3 space-y-4">
            {!harmonies ? (
              <p className="text-xs text-neutral-600 text-center py-6">
                Select a Pantone color first
              </p>
            ) : (
              <>
                <HarmonyGroup
                  label="Complementary"
                  colors={harmonies.complementary}
                  active={activePantoneCode}
                  onSelect={handleSelect}
                />
                <HarmonyGroup
                  label="Analogous"
                  colors={harmonies.analogous}
                  active={activePantoneCode}
                  onSelect={handleSelect}
                />
                <HarmonyGroup
                  label="Triadic"
                  colors={harmonies.triadic}
                  active={activePantoneCode}
                  onSelect={handleSelect}
                />
              </>
            )}
          </div>
        )}

        {tab === 'collections' && (
          <div className="p-2 space-y-4">
            {SEASON_COLLECTIONS.map((col) => (
              <div key={col.name}>
                <p className="text-[10px] text-neutral-500 mb-1.5 font-medium">{col.name}</p>
                <div className="flex gap-1.5">
                  {col.colors.map((code) => {
                    const c = PANTONE_COLORS.find((p) => p.code === code)
                    if (!c) return null
                    return (
                      <div key={code} className="flex flex-col items-center gap-1">
                        <SwatchCell
                          color={c}
                          active={activePantoneCode}
                          onSelect={handleSelect}
                          size="lg"
                        />
                        <span className="text-[8px] font-mono text-neutral-600">{code}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'recent' && (
          <div className="p-2">
            {recentColors.length === 0 ? (
              <p className="text-xs text-neutral-600 text-center py-6">
                No recent colors yet
              </p>
            ) : (
              <div className="grid grid-cols-8 gap-1">
                {recentColors.map((hex) => {
                  const found = PANTONE_COLORS.find(
                    (c) => c.hex.toLowerCase() === hex.replace('#', '').toLowerCase()
                  )
                  return (
                    <button
                      key={hex}
                      title={found?.name ?? hex}
                      onClick={() => found && handleSelect(found)}
                      className="swatch w-6 h-6 rounded border border-neutral-700"
                      style={{ background: hex }}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SwatchCell({
  color,
  active,
  onSelect,
  size = 'sm',
}: {
  color: PantoneColor
  active: string | null
  onSelect: (c: PantoneColor) => void
  size?: 'sm' | 'lg'
}) {
  const dim = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return (
    <button
      title={`${color.name} (${color.code})`}
      onClick={() => onSelect(color)}
      className={`swatch ${dim} rounded border ${
        active === color.code ? 'active border-white' : 'border-neutral-800'
      }`}
      style={{ background: color.hex }}
    />
  )
}

function HarmonyGroup({
  label,
  colors,
  active,
  onSelect,
}: {
  label: string
  colors: PantoneColor[]
  active: string | null
  onSelect: (c: PantoneColor) => void
}) {
  return (
    <div>
      <p className="text-[10px] text-neutral-500 mb-1.5 font-medium uppercase tracking-wider">
        {label}
      </p>
      <div className="flex gap-1.5">
        {colors.map((c) => (
          <div key={c.code} className="flex flex-col items-center gap-1">
            <SwatchCell color={c} active={active} onSelect={onSelect} size="lg" />
            <span className="text-[8px] font-mono text-neutral-600 truncate w-8 text-center">
              {c.code}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ColorValues({ hex }: { hex: string }) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)

  // Rough CMYK
  const rr = r / 255, gg = g / 255, bb = b / 255
  const k = 1 - Math.max(rr, gg, bb)
  const c = k === 1 ? 0 : Math.round(((1 - rr - k) / (1 - k)) * 100)
  const m = k === 1 ? 0 : Math.round(((1 - gg - k) / (1 - k)) * 100)
  const y = k === 1 ? 0 : Math.round(((1 - bb - k) / (1 - k)) * 100)
  const kk = Math.round(k * 100)

  return (
    <div className="mt-2 grid grid-cols-2 gap-1">
      <ValueChip label="HEX" value={`#${clean.toUpperCase()}`} />
      <ValueChip label="RGB" value={`${r}, ${g}, ${b}`} />
      <ValueChip label="CMYK" value={`${c} ${m} ${y} ${kk}`} />
    </div>
  )
}

function ValueChip({ label, value }: { label: string; value: string }) {
  const copy = () => navigator.clipboard.writeText(value)
  return (
    <button
      onClick={copy}
      title="Click to copy"
      className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 hover:border-neutral-600 transition-colors group"
    >
      <span className="text-[9px] text-neutral-600 font-mono w-8 shrink-0">{label}</span>
      <span className="text-[9px] font-mono text-neutral-300 truncate group-hover:text-white">
        {value}
      </span>
    </button>
  )
}