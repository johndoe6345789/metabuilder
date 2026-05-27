import type { Geometry } from '@/lib/types'
import { renderSimpleShape } from './svgShapesSimple'
import { renderComplexShape } from './svgShapesComplex'

export function renderShape(
  geo: Geometry,
  x: number,
  y: number,
  fill: string
): string {
  const simple = renderSimpleShape(geo, x, y, fill)
  if (simple !== null) return simple

  const complex = renderComplexShape(geo, x, y, fill)
  if (complex !== null) return complex

  console.warn(`Unknown geometry type: ${geo.type}`)
  return ''
}
