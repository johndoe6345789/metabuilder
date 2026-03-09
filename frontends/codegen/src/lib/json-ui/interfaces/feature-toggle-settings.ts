import type { FeatureToggles } from '@/types/project'

export interface FeatureToggleSettingsProps {
  features: FeatureToggles
  onFeaturesChange: (features: FeatureToggles) => void
}
