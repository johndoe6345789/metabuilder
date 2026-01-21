export type BrushEffect = 'solid' | 'gradient' | 'spray' | 'glow'
export type CanvasFilter = 'none' | 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'sepia' | 'invert' | 'saturate' | 'hue-rotate' | 'pixelate'

export interface FaviconElement {
  id: string
  type: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'polygon' | 'text' | 'emoji' | 'freehand'
  x: number
  y: number
  width: number
  height: number
  color: string
  rotation: number
  text?: string
  fontSize?: number
  fontWeight?: string
  emoji?: string
  paths?: Array<{ x: number; y: number }>
  strokeWidth?: number
  brushEffect?: BrushEffect
  gradientColor?: string
  glowIntensity?: number
}

export interface FaviconDesign {
  id: string
  name: string
  size: number
  backgroundColor: string
  elements: FaviconElement[]
  createdAt: number
  updatedAt: number
  filter?: CanvasFilter
  filterIntensity?: number
}
