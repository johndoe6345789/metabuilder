import pagesConfig from './pages.json'
import { PageConfig } from '@/types/page-config'
import { FeatureToggles } from '@/types/project'

export function getEnabledPages(featureToggles?: FeatureToggles): PageConfig[] {
  const enabled = pagesConfig.pages.filter(page => {
    if (!page.enabled) {
      return false
    }
    if (!page.toggleKey) return true
    return featureToggles?.[page.toggleKey as keyof FeatureToggles] !== false
  }).sort((a, b) => a.order - b.order)
  return enabled as PageConfig[]
}
