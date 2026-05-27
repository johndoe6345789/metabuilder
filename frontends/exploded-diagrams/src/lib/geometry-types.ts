/**
 * 2D and 3D geometry type definitions
 */

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

/** 3D Geometry types for WebGL viewer */
export interface Geometry3D {
  type: 'cylinder' | 'box' | 'sphere' | 'torus' | 'cone' | 'extrude' | 'revolve'

  // Positioning
  offsetX?: number
  offsetY?: number
  offsetZ?: number
  rotateX?: number  // degrees
  rotateY?: number
  rotateZ?: number

  // Boolean operations
  subtract?: boolean
  intersect?: boolean

  // Appearance
  fill?: string
  material?: string
  opacity?: number

  // Cylinder
  r?: number
  height?: number
  segments?: number

  // Box
  width?: number
  depth?: number
  // height shared with cylinder

  // Torus
  tubeR?: number

  // Cone/Frustum
  r1?: number  // bottom radius
  r2?: number  // top radius

  // Extrude
  points?: number[]  // [x1,y1, x2,y2, ...]

  // Revolve
  angle?: number  // default 360
}
