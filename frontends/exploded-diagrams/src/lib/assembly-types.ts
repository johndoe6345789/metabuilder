/**
 * Assembly and material type definitions
 */

import type { Part } from './part-types'

export interface Assembly {
  name: string
  description?: string
  category?: string
  parts: Part[]
}

export interface MaterialGradient {
  angle?: number
  stops: Array<{ offset: number; color: string }>
}

export interface Material {
  name: string
  gradient: MaterialGradient
}

export type Materials = Record<string, Material>
