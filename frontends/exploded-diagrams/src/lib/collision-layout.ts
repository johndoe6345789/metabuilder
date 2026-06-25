/**
 * Layout/positioning logic using AABB collision detection
 */

import type { Part } from './types'
import type { BoundingBox, PositionedPart } from './collision-bounds'
import { getPartBounds } from './collision-bounds'
import { aabbCollision, getVerticalSeparation } from './collision-detection'

/**
 * UI boundary configuration for collision detection.
 * Parts should never overlap these fixed UI elements.
 */
export interface UIBoundaries {
  /** Y position of the horizontal rule (title divider) */
  horizontalRuleY: number
  /** Grace margin below the horizontal rule */
  graceMargin: number
}

const DEFAULT_UI_BOUNDARIES: UIBoundaries = {
  horizontalRuleY: 65,  // The title divider line
  graceMargin: 20,      // Minimum space below the rule
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
  const minGap = 12

  const minY = uiBoundaries.horizontalRuleY + uiBoundaries.graceMargin

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    let y = baseOffset +
      part.baseY * 0.7 +
      (i * maxExplosion * explosionFactor)

    let bbox: BoundingBox = getPartBounds(part, centerX, y)

    // Push below UI boundary if needed
    if (bbox.minY < minY) {
      y += minY - bbox.minY
      bbox = getPartBounds(part, centerX, y)
    }

    let iterations = 0
    const maxIterations = 20

    while (iterations < maxIterations) {
      let hadCollision = false

      if (bbox.minY < minY) {
        y += minY - bbox.minY
        bbox = getPartBounds(part, centerX, y)
        hadCollision = true
      }

      for (const other of positioned) {
        if (aabbCollision(bbox, other.bbox)) {
          const separation = getVerticalSeparation(other.bbox, bbox)
          y += Math.abs(separation) + minGap
          bbox = getPartBounds(part, centerX, y)
          hadCollision = true
          break
        }
      }

      if (!hadCollision) break
      iterations++
    }

    positioned.push({ part, y, bbox })
  }

  return positioned
}
