import type { ProductTier } from './types'

export const PRODUCT_TIERS: ProductTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    packageIds: ['pages', 'community'],
    memberLimit: 200,
    highlight: false,
    cta: 'Start free trial',
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 59,
    packageIds: ['pages', 'community', 'members', 'content'],
    memberLimit: 2000,
    highlight: true,
    cta: 'Start free trial',
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 129,
    packageIds: [
      'pages',
      'community',
      'members',
      'content',
      'email',
      'analytics',
    ],
    memberLimit: null,
    highlight: false,
    cta: 'Start free trial',
  },
]
