export type PantoneColor = {
  code: string
  name: string
  hex: string
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'

export type LayerType = 'image' | 'paint' | 'text' | 'shape' | 'adjustment'

export type Layer = {
  id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: BlendMode
  x: number
  y: number
  width: number
  height: number
  data?: string // base64 for image/paint layers
  text?: string
  fontSize?: number
  fontFamily?: string
  color?: string
  shape?: 'rect' | 'ellipse' | 'polygon' | 'line'
  adjustmentType?: AdjustmentType
  adjustmentValues?: AdjustmentValues
  zIndex: number
}

export type AdjustmentType =
  | 'hue-saturation'
  | 'brightness-contrast'
  | 'color-balance'
  | 'curves'
  | 'levels'
  | 'vibrance'
  | 'black-white'

export type AdjustmentValues = {
  hue?: number
  saturation?: number
  lightness?: number
  brightness?: number
  contrast?: number
  vibrance?: number
  shadows?: [number, number, number]
  midtones?: [number, number, number]
  highlights?: [number, number, number]
}

export type Tool =
  | 'move'
  | 'select-rect'
  | 'select-ellipse'
  | 'lasso'
  | 'magic-wand'
  | 'crop'
  | 'brush'
  | 'eraser'
  | 'clone-stamp'
  | 'gradient'
  | 'fill'
  | 'eyedropper'
  | 'text'
  | 'shape-rect'
  | 'shape-ellipse'
  | 'shape-polygon'
  | 'shape-line'
  | 'healing-brush'
  | 'annotation'

export type GradientType = 'linear' | 'radial'

export type HistoryEntry = {
  id: string
  label: string
  timestamp: number
  layerSnapshot: Layer[]
}

export type CanvasSize = {
  width: number
  height: number
}

export type Selection = {
  x: number
  y: number
  width: number
  height: number
} | null

export type TextureType = 'none' | 'linen' | 'silk' | 'denim' | 'wool' | 'jersey'

export type ColorStoryEntry = {
  id: string
  pantoneCode: string
  label?: string
  note?: string
}

export type ColorStory = {
  id: string
  name: string
  season?: string
  entries: ColorStoryEntry[]
  moodImages?: string[]
  createdAt: number
}

export type AnnotationPin = {
  id: string
  x: number
  y: number
  pantoneCode: string
  label: string
}

export type BrushSettings = {
  size: number
  opacity: number
  hardness: number
  blendMode: BlendMode
}

export type GradientSettings = {
  type: GradientType
  colorA: string
  colorB: string
  angle: number
}

export type AppPanel =
  | 'layers'
  | 'pantone'
  | 'history'
  | 'adjustments'
  | 'colorStory'
  | 'annotations'