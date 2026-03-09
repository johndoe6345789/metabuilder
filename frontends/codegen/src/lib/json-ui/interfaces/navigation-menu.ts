import type { FeatureToggles } from '@/types/project'

export interface NavigationMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
  featureToggles: FeatureToggles
  errorCount?: number
}
