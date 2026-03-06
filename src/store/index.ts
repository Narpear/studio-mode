import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  Layer,
  Tool,
  BrushSettings,
  GradientSettings,
  HistoryEntry,
  CanvasSize,
  Selection,
  AppPanel,
  AnnotationPin,
  ColorStory,
  TextureType,
} from '@/types'

interface StudioState {
  // Canvas
  canvasSize: CanvasSize
  zoom: number
  panOffset: { x: number; y: number }

  // Layers
  layers: Layer[]
  activeLayerId: string | null

  // Tools
  activeTool: Tool
  brushSettings: BrushSettings
  gradientSettings: GradientSettings
  activeTexture: TextureType

  // Colors
  activePantoneCode: string | null
  activePantoneHex: string
  secondaryPantoneHex: string
  recentColors: string[]

  // Selection
  selection: Selection

  // History
  history: HistoryEntry[]
  historyIndex: number

  // Panels
  openPanels: AppPanel[]

  // Annotations
  annotations: AnnotationPin[]

  // Color Stories
  colorStories: ColorStory[]
  activeColorStoryId: string | null

  // UI
  showGrid: boolean
  showRulers: boolean
  theme: 'dark' | 'light'

  // Actions — Canvas
  setCanvasSize: (size: CanvasSize) => void
  setZoom: (zoom: number) => void
  setPanOffset: (offset: { x: number; y: number }) => void

  // Actions — Layers
  addLayer: (layer: Layer) => void
  removeLayer: (id: string) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  setActiveLayer: (id: string | null) => void
  reorderLayers: (from: number, to: number) => void
  duplicateLayer: (id: string) => void
  toggleLayerVisibility: (id: string) => void
  toggleLayerLock: (id: string) => void

  // Actions — Tools
  setActiveTool: (tool: Tool) => void
  setBrushSettings: (settings: Partial<BrushSettings>) => void
  setGradientSettings: (settings: Partial<GradientSettings>) => void
  setActiveTexture: (texture: TextureType) => void

  // Actions — Colors
  setActivePantone: (code: string, hex: string) => void
  setSecondaryPantone: (hex: string) => void
  addRecentColor: (hex: string) => void

  // Actions — Selection
  setSelection: (selection: Selection) => void
  clearSelection: () => void

  // Actions — History
  pushHistory: (label: string) => void
  undoHistory: () => void
  redoHistory: () => void
  jumpToHistory: (index: number) => void

  // Actions — Panels
  togglePanel: (panel: AppPanel) => void
  openPanel: (panel: AppPanel) => void

  // Actions — Annotations
  addAnnotation: (pin: AnnotationPin) => void
  removeAnnotation: (id: string) => void
  updateAnnotation: (id: string, updates: Partial<AnnotationPin>) => void

  // Actions — Color Stories
  addColorStory: (story: ColorStory) => void
  updateColorStory: (id: string, updates: Partial<ColorStory>) => void
  removeColorStory: (id: string) => void
  setActiveColorStory: (id: string | null) => void

  // Actions — UI
  toggleGrid: () => void
  toggleRulers: () => void
  setTheme: (theme: 'dark' | 'light') => void
}

export const useStudioStore = create<StudioState>()(
  immer((set) => ({
    // Initial state
    canvasSize: { width: 1200, height: 800 },
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    layers: [],
    activeLayerId: null,
    activeTool: 'move',
    brushSettings: {
      size: 24,
      opacity: 1,
      hardness: 0.8,
      blendMode: 'normal',
    },
    gradientSettings: {
      type: 'linear',
      colorA: '#ffffff',
      colorB: '#000000',
      angle: 0,
    },
    activeTexture: 'none',
    activePantoneCode: '15-0545',
    activePantoneHex: '#7ec845',
    secondaryPantoneHex: '#000000',
    recentColors: [],
    selection: null,
    history: [],
    historyIndex: -1,
    openPanels: ['layers', 'pantone'],
    annotations: [],
    colorStories: [],
    activeColorStoryId: null,
    showGrid: false,
    showRulers: true,
    theme: 'dark',

    // Canvas
    setCanvasSize: (size) => set((s) => { s.canvasSize = size }),
    setZoom: (zoom) => set((s) => { s.zoom = Math.min(Math.max(zoom, 0.1), 10) }),
    setPanOffset: (offset) => set((s) => { s.panOffset = offset }),

    // Layers
    addLayer: (layer) =>
      set((s) => {
        s.layers.push(layer)
        s.activeLayerId = layer.id
      }),
    removeLayer: (id) =>
      set((s) => {
        s.layers = s.layers.filter((l) => l.id !== id)
        if (s.activeLayerId === id) s.activeLayerId = s.layers[0]?.id ?? null
      }),
    updateLayer: (id, updates) =>
      set((s) => {
        const idx = s.layers.findIndex((l) => l.id === id)
        if (idx !== -1) Object.assign(s.layers[idx], updates)
      }),
    setActiveLayer: (id) => set((s) => { s.activeLayerId = id }),
    reorderLayers: (from, to) =>
      set((s) => {
        const [item] = s.layers.splice(from, 1)
        s.layers.splice(to, 0, item)
      }),
    duplicateLayer: (id) =>
      set((s) => {
        const layer = s.layers.find((l) => l.id === id)
        if (!layer) return
        const copy = {
          ...JSON.parse(JSON.stringify(layer)),
          id: crypto.randomUUID(),
          name: `${layer.name} copy`,
          x: layer.x + 10,
          y: layer.y + 10,
        }
        s.layers.push(copy)
        s.activeLayerId = copy.id
      }),
    toggleLayerVisibility: (id) =>
      set((s) => {
        const l = s.layers.find((l) => l.id === id)
        if (l) l.visible = !l.visible
      }),
    toggleLayerLock: (id) =>
      set((s) => {
        const l = s.layers.find((l) => l.id === id)
        if (l) l.locked = !l.locked
      }),

    // Tools
    setActiveTool: (tool) => set((s) => { s.activeTool = tool }),
    setBrushSettings: (settings) =>
      set((s) => { Object.assign(s.brushSettings, settings) }),
    setGradientSettings: (settings) =>
      set((s) => { Object.assign(s.gradientSettings, settings) }),
    setActiveTexture: (texture) => set((s) => { s.activeTexture = texture }),

    // Colors
    setActivePantone: (code, hex) =>
      set((s) => {
        s.activePantoneCode = code
        s.activePantoneHex = hex
        if (!s.recentColors.includes(hex)) {
          s.recentColors.unshift(hex)
          if (s.recentColors.length > 12) s.recentColors.pop()
        }
      }),
    setSecondaryPantone: (hex) => set((s) => { s.secondaryPantoneHex = hex }),
    addRecentColor: (hex) =>
      set((s) => {
        if (!s.recentColors.includes(hex)) {
          s.recentColors.unshift(hex)
          if (s.recentColors.length > 12) s.recentColors.pop()
        }
      }),

    // Selection
    setSelection: (selection) => set((s) => { s.selection = selection }),
    clearSelection: () => set((s) => { s.selection = null }),

    // History
    pushHistory: (label) =>
      set((s) => {
        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          label,
          timestamp: Date.now(),
          layerSnapshot: JSON.parse(JSON.stringify(s.layers)),
        }
        s.history = s.history.slice(0, s.historyIndex + 1)
        s.history.push(entry)
        s.historyIndex = s.history.length - 1
      }),
    undoHistory: () =>
      set((s) => {
        if (s.historyIndex <= 0) return
        s.historyIndex--
        s.layers = JSON.parse(JSON.stringify(s.history[s.historyIndex].layerSnapshot))
      }),
    redoHistory: () =>
      set((s) => {
        if (s.historyIndex >= s.history.length - 1) return
        s.historyIndex++
        s.layers = JSON.parse(JSON.stringify(s.history[s.historyIndex].layerSnapshot))
      }),
    jumpToHistory: (index) =>
      set((s) => {
        if (index < 0 || index >= s.history.length) return
        s.historyIndex = index
        s.layers = JSON.parse(JSON.stringify(s.history[index].layerSnapshot))
      }),

    // Panels
    togglePanel: (panel) =>
      set((s) => {
        const idx = s.openPanels.indexOf(panel)
        if (idx === -1) s.openPanels.push(panel)
        else s.openPanels.splice(idx, 1)
      }),
    openPanel: (panel) =>
      set((s) => {
        if (!s.openPanels.includes(panel)) s.openPanels.push(panel)
      }),

    // Annotations
    addAnnotation: (pin) => set((s) => { s.annotations.push(pin) }),
    removeAnnotation: (id) =>
      set((s) => { s.annotations = s.annotations.filter((a) => a.id !== id) }),
    updateAnnotation: (id, updates) =>
      set((s) => {
        const idx = s.annotations.findIndex((a) => a.id === id)
        if (idx !== -1) Object.assign(s.annotations[idx], updates)
      }),

    // Color Stories
    addColorStory: (story) => set((s) => { s.colorStories.push(story) }),
    updateColorStory: (id, updates) =>
      set((s) => {
        const idx = s.colorStories.findIndex((c) => c.id === id)
        if (idx !== -1) Object.assign(s.colorStories[idx], updates)
      }),
    removeColorStory: (id) =>
      set((s) => { s.colorStories = s.colorStories.filter((c) => c.id !== id) }),
    setActiveColorStory: (id) => set((s) => { s.activeColorStoryId = id }),

    // UI
    toggleGrid: () => set((s) => { s.showGrid = !s.showGrid }),
    toggleRulers: () => set((s) => { s.showRulers = !s.showRulers }),
    setTheme: (theme) => set((s) => { s.theme = theme }),
  }))
)