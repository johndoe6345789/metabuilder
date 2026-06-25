/**
 * Love2D-style AABB collision detection for exploded diagram parts
 *
 * Re-exports from focused sub-modules:
 *   collision-bounds    – BoundingBox types and per-part bound calculation
 *   collision-detection – Core AABB overlap tests
 *   collision-layout    – Physics-style iterative part positioning
 */

export type { BoundingBox, PositionedPart } from './collision-bounds'
export { getPartBounds } from './collision-bounds'
export {
  aabbCollision,
  getVerticalSeparation,
  checkLabelCollision,
} from './collision-detection'
export type { UIBoundaries } from './collision-layout'
export { positionPartsWithCollision } from './collision-layout'
