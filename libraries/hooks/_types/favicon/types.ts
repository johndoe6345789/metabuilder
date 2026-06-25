/**
 * Type definitions for the favicon designer feature.
 */

export type BrushEffect = 'solid' | 'gradient' | 'glow' | 'spray'

export interface FaviconElement {
  id: string
  type: 'circle' | 'square' | 'text' | 'emoji' | 'freehand'
  x: number
  y: number
  width: number
  height: number
  color: string
  rotation: number
  text?: string
  emoji?: string
  fontSize?: number
  fontWeight?: string
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
}
