/**
 * Core AABB collision detection algorithms
 *
 * Uses Axis-Aligned Bounding Boxes (AABB) - the simplest and fastest
 * collision detection method.
 */

import type { BoundingBox } from './collision-bounds'

/**
 * Check if two bounding boxes overlap (AABB collision test)
 * This is the core Love2D-style collision check
 */
export function aabbCollision(
  a: BoundingBox,
  b: BoundingBox
): boolean {
  return (
    a.minX < b.maxX &&
    a.maxX > b.minX &&
    a.minY < b.maxY &&
    a.maxY > b.minY
  )
}

/**
 * Calculate how much box B needs to move vertically to stop overlapping A.
 * Returns positive value to move down, negative to move up.
 */
export function getVerticalSeparation(
  a: BoundingBox,
  b: BoundingBox
): number {
  if (!aabbCollision(a, b)) return 0

  // Calculate overlap amounts in both directions
  const overlapDown = a.maxY - b.minY  // How much B penetrates from above
  const overlapUp = b.maxY - a.minY    // How much B penetrates from below

  // Return the smaller movement (minimum translation vector)
  return overlapDown < overlapUp
    ? overlapDown + 4
    : -(overlapUp + 4)
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
    minX: labelX - labelWidth / 2,
    minY: labelY - 15,
    maxX: labelX + labelWidth / 2,
    maxY: labelY + 15,
    width: labelWidth,
    height: 30,
  }
  return aabbCollision(partBbox, labelBbox)
}
