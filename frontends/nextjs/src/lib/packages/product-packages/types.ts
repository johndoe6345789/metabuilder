export interface ProductPackage {
  id: string
  name: string
  tagline: string
  icon: string
  color: string
  features: string[]
  defaultRoutes: Array<{ path: string; title: string }>
  category: 'core' | 'social' | 'members' | 'content' | 'comms' | 'analytics'
}

export interface ProductTier {
  id: 'starter' | 'creator' | 'studio'
  name: string
  price: number
  packageIds: string[]
  memberLimit: number | null
  highlight: boolean
  cta: string
}
