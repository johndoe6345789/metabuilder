'use client'

/**
 * Where a drop lands relative to the row under the pointer.
 *
 * A tree row is three targets, not one: the top and bottom edges reorder the
 * dragged node among its target's siblings, and the middle nests it inside.
 * Edges are deliberately a small slice of the row -- most of it should still
 * mean "put it in here", which is the commoner intent.
 */

export type DropWhere = 'before' | 'into' | 'after'

/** Fraction of the row height treated as an edge rather than the middle. */
const EDGE = 0.3

export function dropWhere(event: {
  clientY: number
  currentTarget: { getBoundingClientRect: () => DOMRect }
}): DropWhere {
  const box = event.currentTarget.getBoundingClientRect()
  if (box.height === 0) return 'into'
  const offset = (event.clientY - box.top) / box.height
  if (offset < EDGE) return 'before'
  if (offset > 1 - EDGE) return 'after'
  return 'into'
}
