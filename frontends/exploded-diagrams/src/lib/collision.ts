/**
 * Love2D-style AABB collision detection for exploded diagram parts
 *
 * Uses Axis-Aligned Bounding Boxes (AABB) - the simplest and fastest
 * collision detection method. Each part is represented by a rectangle
 * defined by its min/max x and y coordinates.
 */

import type { Geometry, Part } from './types'

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
 * Calculate the bounding box for a single geometry primitive
 */
function getGeometryBounds(geo: Geometry, cx: number, cy: number): BoundingBox {
  const ox = geo.offsetX || 0
  const oy = geo.offsetY || 0
  const x = cx + ox
  const y = cy + oy

  switch (geo.type) {
    case 'circle': {
      const r = geo.r || 0
      return { minX: x - r, minY: y - r, maxX: x + r, maxY: y + r, width: r * 2, height: r * 2 }
    }

    case 'ellipse': {
      const rx = geo.rx || 0
      const ry = geo.ry || 0
      return { minX: x - rx, minY: y - ry, maxX: x + rx, maxY: y + ry, width: rx * 2, height: ry * 2 }
    }

    case 'rect': {
      const w = geo.width || 0
      const h = geo.height || 0
      return { minX: x - w/2, minY: y - h/2, maxX: x + w/2, maxY: y + h/2, width: w, height: h }
    }

    case 'cylinder': {
      const rx = geo.rx || 0
      const h = geo.height || 0
      return { minX: x - rx, minY: y - h/2, maxX: x + rx, maxY: y + h/2, width: rx * 2, height: h }
    }

    case 'cone': {
      const topRx = geo.topRx || 0
      const bottomRx = geo.bottomRx || 0
      const maxRx = Math.max(topRx, bottomRx)
      const h = geo.height || 0
      return { minX: x - maxRx, minY: y - h/2, maxX: x + maxRx, maxY: y + h/2, width: maxRx * 2, height: h }
    }

    case 'coilSpring': {
      const rx = geo.rx || 0
      const coils = geo.coils || 0
      const pitch = geo.pitch || 0
      const totalHeight = coils * pitch
      return { minX: x - rx, minY: y, maxX: x + rx, maxY: y + totalHeight, width: rx * 2, height: totalHeight }
    }

    case 'gearRing': {
      const outerR = (geo.outerRadius || 0) + (geo.toothHeight || 0)
      return { minX: x - outerR, minY: y - outerR * 0.5, maxX: x + outerR, maxY: y + outerR * 0.5, width: outerR * 2, height: outerR }
    }

    case 'radialRects':
    case 'radialBlades': {
      const radius = geo.radius || 0
      const w = geo.width || 0
      const h = geo.height || 0
      const size = radius + Math.max(w, h)
      return { minX: x - size, minY: y - h, maxX: x + size, maxY: y + h, width: size * 2, height: h * 2 }
    }

    case 'text': {
      // Approximate text bounds
      const fontSize = geo.fontSize || 10
      const textLen = (geo.content?.length || 0) * fontSize * 0.6
      return { minX: x - textLen/2, minY: y - fontSize/2, maxX: x + textLen/2, maxY: y + fontSize/2, width: textLen, height: fontSize }
    }

    case 'line':
    case 'polygon':
    default:
      // For lines and polygons, use a minimal bounding box
      return { minX: x - 10, minY: y - 10, maxX: x + 10, maxY: y + 10, width: 20, height: 20 }
  }
}

/**
 * Calculate combined bounding box for all geometry in a part
 */
export function getPartBounds(part: Part, cx: number, cy: number): BoundingBox {
  if (part.geometry.length === 0) {
    return { minX: cx - 10, minY: cy - 10, maxX: cx + 10, maxY: cy + 10, width: 20, height: 20 }
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

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

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

/**
 * Check if two bounding boxes overlap (AABB collision test)
 * This is the core Love2D-style collision check
 */
export function aabbCollision(a: BoundingBox, b: BoundingBox): boolean {
  return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY
}

/**
 * Calculate how much box B needs to move vertically to stop overlapping box A
 * Returns positive value to move down, negative to move up
 */
export function getVerticalSeparation(a: BoundingBox, b: BoundingBox): number {
  if (!aabbCollision(a, b)) return 0

  // Calculate overlap amounts in both directions
  const overlapDown = a.maxY - b.minY  // How much B penetrates from above
  const overlapUp = b.maxY - a.minY    // How much B penetrates from below

  // Return the smaller movement (minimum translation vector)
  return overlapDown < overlapUp ? overlapDown + 4 : -(overlapUp + 4)
}

/**
 * UI boundary configuration for collision detection
 * Parts should never overlap these fixed UI elements
 */
export interface UIBoundaries {
  /** Y position of the horizontal rule (title divider) */
  horizontalRuleY: number
  /** Grace margin below the horizontal rule */
  graceMargin: number
}

const DEFAULT_UI_BOUNDARIES: UIBoundaries = {
  horizontalRuleY: 65,  // The title divider line
  graceMargin: 20       // Minimum space below the rule
}

/**
 * Position parts with collision detection - no overlaps allowed!
 * Uses an iterative approach similar to physics engines:
 * 1. Position each part based on explosion factor
 * 2. Check for collisions with UI boundaries (horizontal rule)
 * 3. Check for collisions with all previous parts
 * 4. Push apart any overlapping parts
 */
export function positionPartsWithCollision(
  parts: Part[],
  centerX: number,
  baseOffset: number,
  explosionFactor: number,
  maxExplosion: number,
  uiBoundaries: UIBoundaries = DEFAULT_UI_BOUNDARIES
): PositionedPart[] {
  const positioned: PositionedPart[] = []
  const minGap = 12 // Minimum gap between parts

  // Calculate the minimum Y position (below horizontal rule + grace margin)
  const minY = uiBoundaries.horizontalRuleY + uiBoundaries.graceMargin

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    // Initial position based on explosion
    let y = baseOffset + part.baseY * 0.7 + (i * maxExplosion * explosionFactor)

    // Calculate initial bounding box
    let bbox = getPartBounds(part, centerX, y)

    // First: Check collision with UI boundary (horizontal rule)
    // If the top of the part would go above the grace boundary, push it down
    if (bbox.minY < minY) {
      const pushAmount = minY - bbox.minY
      y += pushAmount
      bbox = getPartBounds(part, centerX, y)
    }

    // Collision resolution with other parts - iterate until no overlaps
    let iterations = 0
    const maxIterations = 20 // Prevent infinite loops

    while (iterations < maxIterations) {
      let hadCollision = false

      // Check collision with UI boundary again (in case we were pushed up)
      if (bbox.minY < minY) {
        const pushAmount = minY - bbox.minY
        y += pushAmount
        bbox = getPartBounds(part, centerX, y)
        hadCollision = true
      }

      // Check collision with all positioned parts
      for (const other of positioned) {
        if (aabbCollision(bbox, other.bbox)) {
          // Push this part down (away from the other)
          const separation = getVerticalSeparation(other.bbox, bbox)
          if (separation > 0) {
            y += separation + minGap
          } else {
            y += Math.abs(separation) + minGap
          }
          bbox = getPartBounds(part, centerX, y)
          hadCollision = true
          break // Re-check all collisions after moving
        }
      }

      if (!hadCollision) break
      iterations++
    }

    positioned.push({ part, y, bbox })
  }

  return positioned
}

/**
 * Check if a part's position would overlap with text labels
 */
export function checkLabelCollision(
  partBbox: BoundingBox,
  labelX: number,
  labelY: number,
  labelWidth: number = 80
): boolean {
  const labelBbox: BoundingBox = {
    minX: labelX - labelWidth/2,
    minY: labelY - 15,
    maxX: labelX + labelWidth/2,
    maxY: labelY + 15,
    width: labelWidth,
    height: 30
  }
  return aabbCollision(partBbox, labelBbox)
}
