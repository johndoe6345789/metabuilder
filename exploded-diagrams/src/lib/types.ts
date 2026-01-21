export interface Geometry {
  type: string
  offsetX?: number
  offsetY?: number
  fill?: string
  material?: string
  opacity?: number
  // circle
  r?: number
  // ellipse
  rx?: number
  ry?: number
  // rect
  width?: number
  height?: number
  // line
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  stroke?: string
  strokeWidth?: number
  // polygon
  points?: number[]
  // cylinder/cone
  topRx?: number
  topRy?: number
  bottomRx?: number
  bottomRy?: number
  // coilSpring
  coils?: number
  pitch?: number
  // gearRing
  teeth?: number
  outerRadius?: number
  toothHeight?: number
  // radialRects/radialBlades
  count?: number
  radius?: number
  curve?: number
  // text
  content?: string
  fontSize?: number
  fontFamily?: string
}

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
  installation?: Installation
}

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
