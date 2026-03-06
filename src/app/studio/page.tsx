'use client'

import { useEffect } from 'react'
import { useStudioStore } from '@/store'
import AppShell from '@/components/layout/AppShell'
import Toolbar from '@/components/studio/toolbar/Toolbar'
import StudioCanvas from '@/components/studio/canvas/StudioCanvas'
import LayersPanel from '@/components/studio/panels/LayersPanel'
import PantonePanel from '@/components/studio/panels/PantonePanel'
import HistoryPanel from '@/components/studio/panels/HistoryPanel'
import AdjustmentsPanel from '@/components/studio/panels/AdjustmentsPanel'
import ColorStoryPanel from '@/components/studio/panels/ColorStoryPanel'
import AnnotationsPanel from '@/components/studio/panels/AnnotationsPanel'
import BrushSettingsPanel from '@/components/studio/panels/BrushSettingsPanel'

export default function StudioPage() {
  const {
    openPanels,
    canvasSize,
    zoom,
    layers,
    activeTool,
    activePantoneCode,
    activePantoneHex,
    selection,
    undoHistory,
    redoHistory,
    setZoom,
  } = useStudioStore()

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redoHistory()
        else undoHistory()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redoHistory()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault()
        setZoom(zoom + 0.1)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        setZoom(zoom - 0.1)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        setZoom(1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undoHistory, redoHistory, zoom, setZoom])

  const rightPanels = (
    <div className="flex flex-col h-full overflow-y-auto divide-y divide-neutral-800/60">
      {/* Brush settings always visible at top */}
      <BrushSettingsPanel />

      {openPanels.includes('pantone') && (
        <div className="flex-shrink-0" style={{ minHeight: 320 }}>
          <PantonePanel />
        </div>
      )}

      {openPanels.includes('layers') && (
        <div className="flex-shrink-0" style={{ minHeight: 200 }}>
          <LayersPanel />
        </div>
      )}

      {openPanels.includes('adjustments') && (
        <div className="flex-shrink-0">
          <AdjustmentsPanel />
        </div>
      )}

      {openPanels.includes('history') && (
        <div className="flex-shrink-0" style={{ minHeight: 160 }}>
          <HistoryPanel />
        </div>
      )}

      {openPanels.includes('colorStory') && (
        <div className="flex-shrink-0" style={{ minHeight: 200 }}>
          <ColorStoryPanel />
        </div>
      )}

      {openPanels.includes('annotations') && (
        <div className="flex-shrink-0" style={{ minHeight: 160 }}>
          <AnnotationsPanel />
        </div>
      )}
    </div>
  )

  const bottomBar = (
    <div className="flex items-center gap-4 w-full text-[10px] font-mono text-neutral-500">
      <span>
        {canvasSize.width} × {canvasSize.height}px
      </span>
      <span className="text-neutral-700">|</span>
      <span>{Math.round(zoom * 100)}%</span>
      <span className="text-neutral-700">|</span>
      <span className="capitalize">{activeTool.replace(/-/g, ' ')}</span>
      <span className="text-neutral-700">|</span>
      <span>{layers.length} layer{layers.length !== 1 ? 's' : ''}</span>

      {selection && (
        <>
          <span className="text-neutral-700">|</span>
          <span>
            Selection: {Math.round(selection.width)} × {Math.round(selection.height)}
          </span>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        {activePantoneCode && (
          <>
            <div
              className="w-3 h-3 rounded-sm border border-neutral-700"
              style={{ background: activePantoneHex }}
            />
            <span>{activePantoneCode}</span>
            <span className="text-neutral-700">|</span>
            <span className="uppercase">{activePantoneHex}</span>
          </>
        )}
      </div>
    </div>
  )

  return (
    <AppShell
      toolbar={<Toolbar />}
      canvas={<StudioCanvas />}
      rightPanels={rightPanels}
      bottomBar={bottomBar}
    />
  )
}