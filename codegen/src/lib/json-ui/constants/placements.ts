/**
 * Placement/positioning constants for popovers, tooltips, etc.
 */

export const POPOVER_PLACEMENTS = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
} as const

export type PlacementType = keyof typeof POPOVER_PLACEMENTS
