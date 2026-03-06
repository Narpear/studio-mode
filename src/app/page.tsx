'use client'

import { useRouter } from 'next/navigation'
import { useStudioStore } from '@/store'
import { useState } from 'react'

const PRESET_SIZES = [
  { name: 'HD Canvas', w: 1920, h: 1080 },
  { name: 'Square', w: 1200, h: 1200 },
  { name: 'A4 Portrait', w: 2480, h: 3508 },
  { name: 'Mood Board', w: 1200, h: 800 },
]

export default function DashboardPage() {
  const router = useRouter()
  const setCanvasSize = useStudioStore((s) => s.setCanvasSize)
  const [customW, setCustomW] = useState('1200')
  const [customH, setCustomH] = useState('800')

  const launch = (w: number, h: number) => {
    setCanvasSize({ width: w, height: h })
    router.push('/studio')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-neutral-800/60">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#7ec845] flex items-center justify-center">
            <span className="text-black text-xs font-bold">P</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Pantone Studio Pro</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-neutral-400">
          <button onClick={() => router.push('/library')} className="hover:text-white transition-colors">Color Library</button>
          <button onClick={() => router.push('/collections')} className="hover:text-white transition-colors">Collections</button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16 gap-16">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-light tracking-tight text-white">
            Design with <span className="text-[#7ec845]">color</span>
          </h1>
          <p className="text-neutral-500 text-base max-w-md mx-auto">
            A professional creative studio built around the Pantone color system.
            Paint, compose, annotate — export to spec.
          </p>
        </div>

        {/* New canvas */}
        <div className="w-full max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Start New Canvas</p>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_SIZES.map((p) => (
              <button
                key={p.name}
                onClick={() => launch(p.w, p.h)}
                className="group flex flex-col items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 rounded-xl p-5 transition-all"
              >
                <div
                  className="bg-neutral-700 group-hover:bg-neutral-600 transition-colors rounded"
                  style={{
                    width: p.w > p.h ? 40 : Math.round(40 * p.w / p.h),
                    height: p.h > p.w ? 40 : Math.round(40 * p.h / p.w),
                  }}
                />
                <span className="text-xs text-neutral-300 font-medium">{p.name}</span>
                <span className="text-[10px] text-neutral-600 font-mono">{p.w} × {p.h}</span>
              </button>
            ))}
          </div>

          {/* Custom size */}
          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <span className="text-xs text-neutral-500 w-24 shrink-0">Custom size</span>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="number"
                value={customW}
                onChange={(e) => setCustomW(e.target.value)}
                className="studio-input w-24 text-center font-mono"
                placeholder="Width"
              />
              <span className="text-neutral-600 text-sm">×</span>
              <input
                type="number"
                value={customH}
                onChange={(e) => setCustomH(e.target.value)}
                className="studio-input w-24 text-center font-mono"
                placeholder="Height"
              />
              <span className="text-xs text-neutral-600">px</span>
            </div>
            <button
              onClick={() => launch(parseInt(customW) || 1200, parseInt(customH) || 800)}
              className="bg-[#7ec845] hover:bg-[#6ab535] text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Create
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/library')}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded-lg px-4 py-2.5 transition-all"
          >
            <span className="text-base">🎨</span>
            Browse Pantone Library
          </button>
          <button
            onClick={() => router.push('/collections')}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded-lg px-4 py-2.5 transition-all"
          >
            <span className="text-base">📚</span>
            Color Stories
          </button>
        </div>
      </main>
    </div>
  )
}