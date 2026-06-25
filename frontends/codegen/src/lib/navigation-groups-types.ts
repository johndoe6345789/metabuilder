import { FeatureToggles } from '@/types/project'

export interface NavigationItemData {
  id: string
  label: string
  icon: React.ReactNode
  value: string
  badge?: number
  featureKey?: keyof FeatureToggles
}

export interface NavigationGroup {
  id: string
  label: string
  items: NavigationItemData[]
}
