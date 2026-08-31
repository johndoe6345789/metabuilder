import { PRODUCT_PACKAGES } from './packages/index'
import { PRODUCT_TIERS } from './tiers'
import type { ProductPackage, ProductTier } from './types'

export function packageById(id: string): ProductPackage | undefined {
  return PRODUCT_PACKAGES.find(p => p.id === id)
}

export function tierById(id: string): ProductTier | undefined {
  return PRODUCT_TIERS.find(t => t.id === id)
}
