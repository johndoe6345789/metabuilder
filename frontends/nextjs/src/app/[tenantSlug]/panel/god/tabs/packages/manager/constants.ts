import type { RegistryPackage } from '../use-package-registry'

export const CATEGORIES: RegistryPackage['manifest']['category'][] = [
  'social',
  'entertainment',
  'productivity',
  'gaming',
  'ecommerce',
  'content',
  'other',
]

// A curated set rather than the full 421-icon library (@metabuilder/icons)
// -- enough variety for a package badge without building a searchable icon
// browser just for this.
export const ICONS = [
  'deployed_code',
  'widgets',
  'web',
  'chat',
  'forum',
  'groups',
  'shield',
  'bolt',
  'star',
  'extension',
  'dashboard',
  'palette',
]
