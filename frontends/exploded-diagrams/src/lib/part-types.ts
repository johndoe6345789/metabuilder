/**
 * Part, hardware, tool, torque, and installation type definitions
 */

import type { Geometry, Geometry3D } from './geometry-types'

export interface Tool {
  name: string
  size: string
  required: boolean
}

export interface Hardware {
  name: string
  spec: string
  qty: number
  grade?: string
  reusable: boolean
}

export interface TorqueSpec {
  fastener: string
  value: number
  unit: string
  sequence?: string
  notes?: string
}

export interface Installation {
  tools: Tool[]
  hardware: Hardware[]
  torque: TorqueSpec[]
  notes: string[]
}

export interface Part {
  id: string
  name: string
  partNumber: string
  material: string
  weight: number
  quantity: number
  baseY: number
  geometry: Geometry[]
  geometry3d?: Geometry3D[]
  installation?: Installation
}
