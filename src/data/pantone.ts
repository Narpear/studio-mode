import { PantoneColor } from '@/types'

const rawPantone: Record<string, { name: string; hex: string }> = {
  "11-0103": { "name": "egret", "hex": "f3ece0" },
  "11-0602": { "name": "snow-white", "hex": "f2f0eb" },
  "11-0601": { "name": "bright-white", "hex": "f4f5f0" },
  "11-4201": { "name": "cloud-dancer", "hex": "f0eee9" },
  "11-0604": { "name": "gardenia", "hex": "f1e8df" },
  "11-4300": { "name": "marshmallow", "hex": "f0eee4" },
  "11-4800": { "name": "blanc-de-blanc", "hex": "e7e9e7" },
  "11-0606": { "name": "pristine", "hex": "f2e8da" },
  "11-0701": { "name": "whisper-white", "hex": "ede6db" },
  "12-0104": { "name": "white-asparagus", "hex": "e1dbc8" },
  "13-0905": { "name": "birch", "hex": "ddd5c7" },
  "12-5202": { "name": "turtledove", "hex": "ded7c8" },
  "12-0105": { "name": "bone-white", "hex": "d7d0c0" },
  "13-4403": { "name": "silver-birch", "hex": "d2cfc4" },
  "11-0104": { "name": "vanilla-ice", "hex": "f0eada" },
  "11-0107": { "name": "papyrus", "hex": "f5edd6" },
  "11-0105": { "name": "antique-white", "hex": "ede3d2" },
  "11-0507": { "name": "winter-white", "hex": "f5ecd2" },
  "12-0804": { "name": "cloud-cream", "hex": "e6ddc5" },
  "12-0605": { "name": "angora", "hex": "dfd1bb" },
  "12-0703": { "name": "seedpearl", "hex": "e6dac4" },
  "12-0815": { "name": "vanilla-custard", "hex": "f3e0be" },
  "12-0713": { "name": "almond-oil", "hex": "f4efc1" },
  "12-0812": { "name": "alabaster-gleam", "hex": "f0debd" },
  "12-0712": { "name": "vanilla", "hex": "f4e1c1" },
  "12-0806": { "name": "rutabaga", "hex": "ecddbe" },
  "13-0815": { "name": "banana-crepe", "hex": "e7d3ad" },
  "13-0917": { "name": "italian-straw", "hex": "e7d1a1" },
  "12-0304": { "name": "whitecap-gray", "hex": "e0d5c6" },
  "13-0607": { "name": "fog", "hex": "d0c5b1" },
  "12-0000": { "name": "white-swan", "hex": "e4d7c5" },
  "13-0907": { "name": "sandshell", "hex": "d8ccbb" },
  "12-1403": { "name": "tapioca", "hex": "dccdbc" },
  "13-1006": { "name": "creme-brulee", "hex": "dbccb5" },
  "13-0908": { "name": "parchment", "hex": "dfd1be" },
  "15-0545": { "name": "jasmine-green", "hex": "7ec845" },
  "19-4052": { "name": "classic-blue", "hex": "0f4c81" },
  "18-1550": { "name": "living-coral", "hex": "ff6f61" },
  "15-0343": { "name": "greenery", "hex": "88b04b" },
  "18-3838": { "name": "ultra-violet", "hex": "5f4b8b" },
  "16-1546": { "name": "living-coral", "hex": "ff6f61" },
  "13-1520": { "name": "rose-quartz", "hex": "f7cac9" },
  "15-3919": { "name": "serenity", "hex": "91a8d0" },
  "17-1230": { "name": "mocha-mousse", "hex": "a47864" },
  "13-0646": { "name": "meadowlark", "hex": "ead94e" },
}

export const PANTONE_COLORS: PantoneColor[] = Object.entries(rawPantone).map(
  ([code, { name, hex }]) => ({
    code,
    name: name.replace(/-/g, ' '),
    hex: `#${hex}`,
  })
)

export function findPantoneByHex(hex: string): PantoneColor | null {
  const clean = hex.replace('#', '').toLowerCase()
  let closest: PantoneColor | null = null
  let minDist = Infinity

  for (const color of PANTONE_COLORS) {
    const dist = hexDistance(clean, color.hex.replace('#', ''))
    if (dist < minDist) {
      minDist = dist
      closest = color
    }
  }
  return closest
}

export function findPantoneByCode(code: string): PantoneColor | undefined {
  return PANTONE_COLORS.find((c) => c.code === code)
}

export function searchPantone(query: string): PantoneColor[] {
  const q = query.toLowerCase()
  return PANTONE_COLORS.filter(
    (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  )
}

export function getColorHarmonies(code: string): {
  complementary: PantoneColor[]
  analogous: PantoneColor[]
  triadic: PantoneColor[]
} {
  const base = findPantoneByCode(code)
  if (!base) return { complementary: [], analogous: [], triadic: [] }

  const baseHsl = hexToHsl(base.hex.replace('#', ''))

  const complementary = findClosestToHsl((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l, 3)
  const analogous = [
    ...findClosestToHsl((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l, 2),
    ...findClosestToHsl((baseHsl.h - 30 + 360) % 360, baseHsl.s, baseHsl.l, 2),
  ]
  const triadic = [
    ...findClosestToHsl((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l, 2),
    ...findClosestToHsl((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l, 2),
  ]

  return { complementary, analogous, triadic }
}

function findClosestToHsl(h: number, s: number, l: number, count: number): PantoneColor[] {
  return PANTONE_COLORS
    .map((c) => {
      const hsl = hexToHsl(c.hex.replace('#', ''))
      const dist = Math.abs(hsl.h - h) + Math.abs(hsl.s - s) * 0.5 + Math.abs(hsl.l - l) * 0.3
      return { color: c, dist }
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map((x) => x.color)
}

function hexDistance(a: string, b: string): number {
  const ar = parseInt(a.slice(0, 2), 16)
  const ag = parseInt(a.slice(2, 4), 16)
  const ab = parseInt(a.slice(4, 6), 16)
  const br = parseInt(b.slice(0, 2), 16)
  const bg = parseInt(b.slice(2, 4), 16)
  const bb = parseInt(b.slice(4, 6), 16)
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2)
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}