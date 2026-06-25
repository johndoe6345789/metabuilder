/**
 * BoundingBox / PositionedPart types and part-level bound aggregation
 */

import type { Part } from './types'
import { getGeometryBounds } from './collision-geometry'

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export interface PositionedPart {
  part: Part
  y: number
  bbox: BoundingBox
}

/**
 * Calculate combined bounding box for all geometry in a part
 */
export function getPartBounds(
  part: Part,
  cx: number,
  cy: number
): BoundingBox {
  if (part.geometry.length === 0) {
    return {
      minX: cx - 10, minY: cy - 10,
      maxX: cx + 10, maxY: cy + 10,
      width: 20, height: 20,
    }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const geo of part.geometry) {
    const bounds = getGeometryBounds(geo, cx, cy)
    minX = Math.min(minX, bounds.minX)
    minY = Math.min(minY, bounds.minY)
    maxX = Math.max(maxX, bounds.maxX)
    maxY = Math.max(maxY, bounds.maxY)
  }

  // Add padding for visual comfort
  const padding = 8
  minX -= padding
  minY -= padding
  maxX += padding
  maxY += padding

  return {
    minX, minY, maxX, maxY,
    width: maxX - minX, height: maxY - minY,
  }
}
