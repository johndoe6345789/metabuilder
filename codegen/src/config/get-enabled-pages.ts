import pagesConfig from './pages.json'
import { PageConfig } from '@/types/page-config'
import { FeatureToggles } from '@/types/project'

export function getEnabledPages(featureToggles?: FeatureToggles): PageConfig[] {
  console.log('[CONFIG] 🔍 getEnabledPages called with toggles:', featureToggles)
  const enabled = pagesConfig.pages.filter(page => {
    if (!page.enabled) {
      console.log('[CONFIG] ⏭️ Skipping disabled page:', page.id)
      return false
    }
    if (!page.toggleKey) return true
    return featureToggles?.[page.toggleKey as keyof FeatureToggles] !== false
  }).sort((a, b) => a.order - b.order)
  console.log('[CONFIG] ✅ Enabled pages:', enabled.map(p => p.id).join(', '))
  return enabled as PageConfig[]
}
