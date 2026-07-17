import type { RenditionConfig } from '@/store/slices/god-slice'

export const LEVELS = [1, 2, 3, 4, 5] as const

export const DENSITIES: RenditionConfig['density'][] = [
  'compact',
  'comfortable',
  'spacious',
]

export type AccessLevel = (typeof LEVELS)[number]
