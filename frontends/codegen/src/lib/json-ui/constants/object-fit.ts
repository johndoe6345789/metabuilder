/**
 * Object fit constants for images
 */

export const OBJECT_FIT_CLASSES = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
} as const

export type ObjectFit = keyof typeof OBJECT_FIT_CLASSES
