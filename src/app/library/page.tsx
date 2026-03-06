'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PANTONE_COLORS } from '@/data/pantone'
import { useStudioStore } from '@/store'
import { PantoneColor } from '@/types'

type SortBy = 'code' | 'name' | 'hue'

export default function LibraryPage() {
  const router = useRouter()
  const { setActivePantone } = useStudioStore()

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('code')
  const [selected, setSelected] = useState<PantoneColor | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [filterFavs, setFilterFavs] = useState(false)

  const filtered = useMemo(() => {
    let list = PANTONE_COLORS

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      )
    }

    if (filterFavs) {
      list = list.filter((c) => favorites.has(c.code))
    }

    switch (sortBy) {
      case 'name':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'hue':
        list = [...list].sort((a, b) => hexToHue(a.hex) - hexToHue(b.hex))
        break
      default:
        break
    }

    return list
  }, [search, sortBy, filterFavs, favorites])

  const toggleFav = (code: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const openInStudio = (color: PantoneColor) => {
    setActivePantone(color.code, color.hex)
    router.push('/studio')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-neutral-800/60 sticky top-0 bg-neutral-950 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-neutral-500 hover:text-neutral-200 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-neutral-800" />
          <h1 className="text-sm font-semibold">Pantone Color Library</h1>
          <span className="text-[10px] text-neutral-600 font-mono">
            {filtered.length} / {PANTONE_COLORS.length} colors
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="studio-input w-56 text-xs"
          />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="blend-select w-32"
          >
            <option value="code">Sort: Code</option>
            <option value="name">Sort: Name</option>
            <option value="hue">Sort: Hue</option>
          </select>

          {/* Favorites filter */}
          <button
            onClick={() => setFilterFavs(!filterFavs)}
            className={`text-xs px-3 py-1 rounded border transition-colors ${
              filterFavs
                ? 'bg-[#7ec845] border-[#7ec845] text-black font-medium'
                : 'border-neutral-700 text-neutral-400 hover:text-white'
            }`}
          >
            ★ Favorites ({favorites.size})
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Color grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
            {filtered.map((color) => (
              <ColorCard
                key={color.code}
                color={color}
                isFav={favorites.has(color.code)}
                isSelected={selected?.code === color.code}
                onSelect={() => setSelected(color)}
                onToggleFav={() => toggleFav(color.code)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <p className="text-neutral-600 text-sm">No colors found for “{search}”</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <aside className="w-64 shrink-0 border-l border-neutral-800/60 bg-neutral-950 overflow-y-auto fade-in">
            <ColorDetail
              color={selected}
              isFav={favorites.has(selected.code)}
              onToggleFav={() => toggleFav(selected.code)}
              onUseInStudio={() => openInStudio(selected)}
              onClose={() => setSelected(null)}
            />
          </aside>
        )}
      </div>
    </div>
  )
}

function ColorCard({
  color,
  isFav,
  isSelected,
  onSelect,
  onToggleFav,
}: {
  color: PantoneColor
  isFav: boolean
  isSelected: boolean
  onSelect: () => void
  onToggleFav: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`group flex flex-col rounded-lg overflow-hidden cursor-pointer border transition-all ${
        isSelected
          ? 'border-white ring-1 ring-white'
          : 'border-neutral-800 hover:border-neutral-600'
      }`}
    >
      {/* Swatch */}
      <div
        className="w-full aspect-square relative"
        style={{ background: color.hex }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFav() }}
          className={`absolute top-1 right-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${
            isFav ? 'opacity-100 text-yellow-400' : 'text-white/60'
          }`}
        >
          {isFav ? '★' : '☆'}
        </button>
      </div>

      {/* Info */}
      <div className="bg-neutral-900 px-1.5 py-1">
        <p className="text-[9px] font-mono text-neutral-500 truncate">{color.code}</p>
        <p className="text-[9px] text-neutral-300 truncate capitalize">{color.name}</p>
      </div>
    </div>
  )
}

function ColorDetail({
  color,
  isFav,
  onToggleFav,
  onUseInStudio,
  onClose,
}: {
  color: PantoneColor
  isFav: boolean
  onToggleFav: () => void
  onUseInStudio: () => void
  onClose: () => void
}) {
  const clean = color.hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)

  const k = 1 - Math.max(r, g, b) / 255
  const c = k === 1 ? 0 : Math.round(((1 - r / 255 - k) / (1 - k)) * 100)
  const m = k === 1 ? 0 : Math.round(((1 - g / 255 - k) / (1 - k)) * 100)
  const y = k === 1 ? 0 : Math.round(((1 - b / 255 - k) / (1 - k)) * 100)
  const kk = Math.round(k * 100)

  const copy = (val: string) => navigator.clipboard.writeText(val)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">Color Detail</span>
        <button onClick={onClose} className="text-neutral-600 hover:text-neutral-300 text-sm">×</button>
      </div>

      {/* Large swatch */}
      <div
        className="w-full h-32 rounded-xl border border-neutral-800"
        style={{ background: color.hex }}
      />

      {/* Name & code */}
      <div>
        <h2 className="text-base font-medium capitalize text-white">{color.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="pantone-badge">{color.code}</span>
          <button
            onClick={onToggleFav}
            className={`text-sm ${isFav ? 'text-yellow-400' : 'text-neutral-600 hover:text-yellow-400'} transition-colors`}
          >
            {isFav ? '★' : '☆'}
          </button>
        </div>
      </div>

      {/* Values */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Color Values</p>
        {[
          { label: 'HEX', value: `#${clean.toUpperCase()}` },
          { label: 'RGB', value: `${r}, ${g}, ${b}` },
          { label: 'CMYK', value: `${c}% ${m}% ${y}% ${kk}%` },
        ].map(({ label, value }) => (
          <button
            key={label}
            onClick={() => copy(value)}
            className="w-full flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded px-3 py-2 transition-colors group"
          >
            <span className="text-[10px] text-neutral-600 font-mono w-10 text-left">{label}</span>
            <span className="text-xs font-mono text-neutral-300 group-hover:text-white flex-1 text-left">{value}</span>
            <span className="text-[9px] text-neutral-600 opacity-0 group-hover:opacity-100">Copy</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onUseInStudio}
          className="w-full bg-[#7ec845] hover:bg-[#6ab535] text-black text-xs font-semibold py-2.5 rounded-lg transition-colors"
        >
          Use in Studio →
        </button>
      </div>
    </div>
  )
}

function hexToHue(hex: string): number {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 0
  const d = max - min
  let h = 0
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    case b: h = ((r - g) / d + 4) / 6; break
  }
  return h * 360
}