'use client'

import { useState } from 'react'
import { useStudioStore } from '@/store'
import { AppPanel } from '@/types'

interface AppShellProps {
  toolbar: React.ReactNode
  leftPanel?: React.ReactNode
  canvas: React.ReactNode
  rightPanels: React.ReactNode
  bottomBar?: React.ReactNode
}

export default function AppShell({
  toolbar,
  canvas,
  rightPanels,
  bottomBar,
}: AppShellProps) {
  const { theme } = useStudioStore()

  return (
    <div
      className="flex flex-col w-screen h-screen overflow-hidden"
      style={{ background: 'var(--panel-bg)' }}
      data-theme={theme}
    >
      {/* Top menu bar */}
      <TopMenuBar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <aside className="flex flex-col w-12 shrink-0 border-r border-neutral-800/60 bg-neutral-950">
          {toolbar}
        </aside>

        {/* Canvas area */}
        <main className="flex-1 relative overflow-hidden canvas-checker">
          {canvas}
        </main>

        {/* Right panels */}
        <aside className="flex flex-col w-64 shrink-0 border-l border-neutral-800/60 bg-neutral-950 overflow-y-auto">
          {rightPanels}
        </aside>
      </div>

      {/* Bottom bar */}
      {bottomBar && (
        <footer className="h-7 shrink-0 border-t border-neutral-800/60 bg-neutral-950 flex items-center px-4">
          {bottomBar}
        </footer>
      )}
    </div>
  )
}

const TOOL_GUIDE_ITEMS: { name: string; shortcut: string; description: string }[] = [
  { name: 'Move', shortcut: 'V', description: 'Pan and reposition the view (Alt + drag).' },
  { name: 'Rectangular Select', shortcut: 'M', description: 'Drag to create a rectangular selection.' },
  { name: 'Ellipse Select', shortcut: 'M', description: 'Drag to create an elliptical selection.' },
  { name: 'Lasso', shortcut: 'L', description: 'Freehand select an area.' },
  { name: 'Magic Wand', shortcut: 'W', description: 'Select by similar color (coming soon).' },
  { name: 'Crop', shortcut: 'C', description: 'Crop the canvas (coming soon).' },
  { name: 'Brush', shortcut: 'B', description: 'Paint with the active Pantone color.' },
  { name: 'Eraser', shortcut: 'E', description: 'Erase pixels on the active layer.' },
  { name: 'Clone Stamp', shortcut: 'S', description: 'Alt-click to sample, then paint to clone (coming soon).' },
  { name: 'Healing Brush', shortcut: 'J', description: 'Blend and repair pixels (prototype).' },
  { name: 'Gradient', shortcut: 'G', description: 'Drag to add a gradient layer.' },
  { name: 'Fill', shortcut: 'K', description: 'Flood fill with the active Pantone color.' },
  { name: 'Eyedropper', shortcut: 'I', description: 'Sample the canvas and map to the nearest Pantone.' },
  { name: 'Text', shortcut: 'T', description: 'Place text using the active Pantone color.' },
  { name: 'Rectangle Shape', shortcut: 'U', description: 'Draw a rectangle shape layer.' },
  { name: 'Ellipse Shape', shortcut: 'U', description: 'Draw an ellipse shape layer.' },
  { name: 'Line', shortcut: 'U', description: 'Draw a line (coming soon).' },
  { name: 'Annotation Pin', shortcut: 'A', description: 'Click to pin a Pantone tag on the canvas.' },
]

function TopMenuBar() {
  const {
    activePantoneCode,
    activePantoneHex,
    zoom,
    setZoom,
    undoHistory,
    redoHistory,
    togglePanel,
    openPanels,
    showGrid,
    toggleGrid,
    showRulers,
    toggleRulers,
  } = useStudioStore()

  const [showToolGuide, setShowToolGuide] = useState(false)

  const panels: { key: AppPanel; label: string }[] = [
    { key: 'layers', label: 'Layers' },
    { key: 'pantone', label: 'Pantone' },
    { key: 'history', label: 'History' },
    { key: 'adjustments', label: 'Adjustments' },
    { key: 'colorStory', label: 'Color Story' },
    { key: 'annotations', label: 'Annotations' },
  ]

  return (
    <div className="h-9 shrink-0 flex items-center gap-0 border-b border-neutral-800/60 bg-neutral-950 px-3 text-xs text-neutral-400 select-none">
      {/* Logo */}
      <div className="flex items-center gap-2 pr-4 mr-2 border-r border-neutral-800">
        <div className="w-5 h-5 rounded bg-[#7ec845] flex items-center justify-center">
          <span className="text-black text-[9px] font-bold">P</span>
        </div>
        <span className="text-neutral-300 font-medium text-xs">Studio Pro</span>
      </div>

      {/* Edit actions */}
      <MenuGroup>
        <MenuBtn onClick={undoHistory} title="Undo (Ctrl+Z)">Undo</MenuBtn>
        <MenuBtn onClick={redoHistory} title="Redo (Ctrl+Y)">Redo</MenuBtn>
      </MenuGroup>

      <Separator />

      {/* View */}
      <MenuGroup>
        <MenuBtn onClick={() => setZoom(zoom - 0.1)}>-</MenuBtn>
        <span className="px-2 font-mono text-neutral-300 text-[10px]">
          {Math.round(zoom * 100)}%
        </span>
        <MenuBtn onClick={() => setZoom(zoom + 0.1)}>+</MenuBtn>
        <MenuBtn onClick={() => setZoom(1)}>Fit</MenuBtn>
      </MenuGroup>

      <Separator />

      {/* View toggles */}
      <MenuGroup>
        <ToggleBtn active={showGrid} onClick={toggleGrid}>Grid</ToggleBtn>
        <ToggleBtn active={showRulers} onClick={toggleRulers}>Rulers</ToggleBtn>
      </MenuGroup>

      <Separator />

      {/* Panels */}
      <MenuGroup>
        {panels.map((p) => (
          <ToggleBtn
            key={p.key}
            active={openPanels.includes(p.key)}
            onClick={() => togglePanel(p.key)}
          >
            {p.label}
          </ToggleBtn>
        ))}
      </MenuGroup>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowToolGuide(true)}
          className="w-5 h-5 flex items-center justify-center rounded-full border border-neutral-700 text-[10px] text-neutral-400 hover:text-neutral-100 hover:border-neutral-500 transition-colors"
          title="Show all tools"
        >
          i
        </button>
        <div className="flex items-center gap-2">
          <span className="text-neutral-600 text-[10px] font-mono">
            {activePantoneCode}
          </span>
          <div
            className="w-4 h-4 rounded border border-neutral-700"
            style={{ background: activePantoneHex }}
          />
        </div>
      </div>

      {showToolGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-100">
                  Tool reference
                </span>
                <span className="text-[10px] text-neutral-500">
                  Hover the left toolbar icons for quick labels.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowToolGuide(false)}
                className="text-neutral-500 hover:text-neutral-200 text-sm px-1"
                aria-label="Close tool reference"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
              {TOOL_GUIDE_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start gap-2 text-xs text-neutral-300"
                >
                  <span className="w-32 shrink-0 font-medium text-neutral-100">
                    {item.name}
                  </span>
                  <span className="kbd mt-[1px]">{item.shortcut}</span>
                  <span className="text-[11px] text-neutral-400">
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5 px-1">{children}</div>
}

function MenuBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="px-2 py-0.5 rounded hover:bg-neutral-800 hover:text-neutral-100 transition-colors text-[11px]"
    >
      {children}
    </button>
  )
}

function ToggleBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded transition-colors text-[11px] ${
        active
          ? 'bg-neutral-800 text-neutral-100'
          : 'hover:bg-neutral-800/50 hover:text-neutral-300'
      }`}
    >
      {children}
    </button>
  )
}

function Separator() {
  return <div className="w-px h-4 bg-neutral-800 mx-1" />
}