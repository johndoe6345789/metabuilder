import type { Position } from '@/workflow-editor'

export interface DrawingConnection {
  sourceNodeId: string
  sourceOutput: string
  position: Position
}

export interface DragState {
  kind: 'pan' | 'node'
  id?: string
  sx: number
  sy: number
  ox: number
  oy: number
}

export const MIN_ZOOM = 0.3
export const MAX_ZOOM = 2
