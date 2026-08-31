import type { Position } from '@/workflow-editor'

/** Where a node lands mid-drag: its start position plus the mouse delta,
 *  scaled back down by the current zoom level. */
export function draggedNodePosition(
  origin: Position,
  dx: number,
  dy: number,
  zoom: number
): Position {
  return { x: origin.x + dx / zoom, y: origin.y + dy / zoom }
}
