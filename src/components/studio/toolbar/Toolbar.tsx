'use client'

import { useEffect } from 'react'
import { useStudioStore } from '@/store'
import { Tool } from '@/types'
import ToolButton from './ToolButton'

const TOOLS: {
  tool: Tool
  icon: React.ReactNode
  label: string
  description: string
  shortcut: string
  group?: boolean
}[] = [
  {
    tool: 'move',
    icon: <MoveIcon />,
    label: 'Move',
    description: 'Pan and reposition the view (Alt + drag).',
    shortcut: 'V',
    group: true,
  },
  {
    tool: 'select-rect',
    icon: <SelectRectIcon />,
    label: 'Rectangular Select',
    description: 'Drag to create a rectangular selection.',
    shortcut: 'M',
  },
  {
    tool: 'select-ellipse',
    icon: <SelectEllipseIcon />,
    label: 'Ellipse Select',
    description: 'Drag to create an elliptical selection.',
    shortcut: 'M',
  },
  {
    tool: 'lasso',
    icon: <LassoIcon />,
    label: 'Lasso',
    description: 'Freehand select an area.',
    shortcut: 'L',
  },
  {
    tool: 'magic-wand',
    icon: <MagicWandIcon />,
    label: 'Magic Wand',
    description: 'Select by similar color (coming soon).',
    shortcut: 'W',
    group: true,
  },
  {
    tool: 'crop',
    icon: <CropIcon />,
    label: 'Crop',
    description: 'Crop the canvas (coming soon).',
    shortcut: 'C',
    group: true,
  },
  {
    tool: 'brush',
    icon: <BrushIcon />,
    label: 'Brush',
    description: 'Paint with the active Pantone color.',
    shortcut: 'B',
    group: true,
  },
  {
    tool: 'eraser',
    icon: <EraserIcon />,
    label: 'Eraser',
    description: 'Erase pixels on the active layer.',
    shortcut: 'E',
  },
  {
    tool: 'clone-stamp',
    icon: <CloneStampIcon />,
    label: 'Clone Stamp',
    description: 'Alt-click to sample, then paint to clone (coming soon).',
    shortcut: 'S',
  },
  {
    tool: 'healing-brush',
    icon: <HealingIcon />,
    label: 'Healing Brush',
    description: 'Blend and repair pixels (prototype).',
    shortcut: 'J',
    group: true,
  },
  {
    tool: 'gradient',
    icon: <GradientIcon />,
    label: 'Gradient',
    description: 'Drag to add a gradient layer.',
    shortcut: 'G',
    group: true,
  },
  {
    tool: 'fill',
    icon: <FillIcon />,
    label: 'Fill',
    description: 'Flood fill with the active Pantone color.',
    shortcut: 'K',
  },
  {
    tool: 'eyedropper',
    icon: <EyedropperIcon />,
    label: 'Eyedropper',
    description: 'Sample the canvas and map to the nearest Pantone.',
    shortcut: 'I',
    group: true,
  },
  {
    tool: 'text',
    icon: <TextIcon />,
    label: 'Text',
    description: 'Place text using the active Pantone color.',
    shortcut: 'T',
    group: true,
  },
  {
    tool: 'shape-rect',
    icon: <ShapeRectIcon />,
    label: 'Rectangle Shape',
    description: 'Drag to draw a rectangle shape layer.',
    shortcut: 'U',
  },
  {
    tool: 'shape-ellipse',
    icon: <ShapeEllipseIcon />,
    label: 'Ellipse Shape',
    description: 'Drag to draw an ellipse shape layer.',
    shortcut: 'U',
  },
  {
    tool: 'shape-line',
    icon: <ShapeLineIcon />,
    label: 'Line',
    description: 'Draw a line (coming soon).',
    shortcut: 'U',
    group: true,
  },
  {
    tool: 'annotation',
    icon: <AnnotationIcon />,
    label: 'Annotation Pin',
    description: 'Click to pin a Pantone tag on the canvas.',
    shortcut: 'A',
    group: true,
  },
]

const SHORTCUT_MAP: Record<string, Tool> = {
  v: 'move',
  m: 'select-rect',
  l: 'lasso',
  w: 'magic-wand',
  c: 'crop',
  b: 'brush',
  e: 'eraser',
  s: 'clone-stamp',
  j: 'healing-brush',
  g: 'gradient',
  k: 'fill',
  i: 'eyedropper',
  t: 'text',
  u: 'shape-rect',
  a: 'annotation',
}

export default function Toolbar() {
  const {
    activeTool,
    setActiveTool,
    activePantoneHex,
    secondaryPantoneHex,
    openPanel,
    openPanels,
  } = useStudioStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const tool = SHORTCUT_MAP[e.key.toLowerCase()]
      if (tool) setActiveTool(tool)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveTool])

  return (
    <div className="flex flex-col items-center py-2 gap-0.5 h-full overflow-y-auto overflow-x-visible">
      {TOOLS.map((t, i) => (
        <div key={t.tool} className="flex flex-col items-center w-full px-1.5">
          {t.group && i !== 0 && <div className="panel-divider w-6 my-1" />}
          <ToolButton
            tool={t.tool}
            activeTool={activeTool}
            onClick={setActiveTool}
            icon={t.icon}
            label={t.label}
            description={t.description}
            shortcut={t.shortcut}
          />
        </div>
      ))}

      {/* Color swatches at bottom */}
      <div className="mt-auto mb-2 flex flex-col items-center gap-1 px-1.5">
        <div className="panel-divider w-6 mb-1" />
        <button
          type="button"
          className={`relative w-8 h-8 rounded-md ${
            openPanels.includes('pantone') ? 'ring-1 ring-[#7ec845]/60' : 'hover:ring-1 hover:ring-neutral-700'
          } transition-shadow`}
          onClick={() => openPanel('pantone')}
          title="Pantone mode: open the Pantone panel"
        >
          {/* Secondary color */}
          <div
            className="absolute bottom-0 right-0 w-5 h-5 rounded border border-neutral-700 cursor-pointer"
            style={{ background: secondaryPantoneHex }}
            title="Secondary Pantone color"
          />
          {/* Primary color */}
          <div
            className="absolute top-0 left-0 w-5 h-5 rounded border border-neutral-600 cursor-pointer z-10"
            style={{ background: activePantoneHex }}
            title="Primary Pantone color"
          />
        </button>
      </div>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────
function MoveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1L7.5 14M1 7.5L14 7.5M7.5 1L5 3.5M7.5 1L10 3.5M7.5 14L5 11.5M7.5 14L10 11.5M1 7.5L3.5 5M1 7.5L3.5 10M14 7.5L11.5 5M14 7.5L11.5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function SelectRectIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="2" y="2" width="11" height="11" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5" rx="0.5"/>
    </svg>
  )
}
function SelectEllipseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <ellipse cx="7.5" cy="7.5" rx="5.5" ry="5.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5"/>
    </svg>
  )
}
function LassoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M3 7C3 4.8 4.8 3 7 3C9.8 3 12 5.2 12 8C12 10.2 10.5 11.5 8.5 11.5C7 11.5 6 10.8 6 9.5C6 8.2 7 7.5 8.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 1.5"/>
    </svg>
  )
}
function MagicWandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 13L8 7M8 7L10 2L11 5L14 6L9 8M6 1L6.5 2.5L8 3L6.5 3.5L6 5L5.5 3.5L4 3L5.5 2.5L6 1Z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function CropIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M3 1V11H13M1 3H11V13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function BrushIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 13C2 13 4 11 5 10C6 9 5.5 7 7 6C8.5 5 10 5.5 11 4.5L12 3.5C12.5 3 12.5 2 12 1.5C11.5 1 10.5 1 10 1.5L9 2.5C8 3.5 8.5 5 7.5 6C6.5 7 4.5 6.5 3.5 7.5C2.5 8.5 1 11 1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="2.5" cy="12.5" r="1.5" fill="currentColor"/>
    </svg>
  )
}
function EraserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M12 2L3 11L5 13H13M12 2L14 4L8 10M12 2L10 1L3 8L5 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function CloneStampIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M5 6.5V9M3.5 9H6.5M2 12H8V14H2V12Z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M10 7L13 10M13 7L10 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  )
}
function HealingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 2V13M2 7.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  )
}
function GradientIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1.5" y="1.5" width="12" height="12" rx="1.5" fill="url(#grad)" stroke="currentColor" strokeWidth="1"/>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
function FillIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 11L7 2L9 6L11 4L14 11H2Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
      <path d="M1 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function EyedropperIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M10 2L13 5L6 12L2 13L3 9L10 2Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
      <path d="M8.5 3.5L11.5 6.5" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  )
}
function TextIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 3H13M7.5 3V12M5 12H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function ShapeRectIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="2" y="4" width="11" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}
function ShapeEllipseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <ellipse cx="7.5" cy="7.5" rx="5.5" ry="4" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}
function ShapeLineIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 13L13 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function AnnotationIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7.5 9.5V13M5.5 13H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}