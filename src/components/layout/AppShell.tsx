'use client'

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

      {/* Active color — right side */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-neutral-600 text-[10px] font-mono">
          {activePantoneCode}
        </span>
        <div
          className="w-4 h-4 rounded border border-neutral-700"
          style={{ background: activePantoneHex }}
        />
      </div>
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