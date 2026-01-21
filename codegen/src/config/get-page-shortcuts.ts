import { FeatureToggles } from '@/types/project'
import { getEnabledPages } from './get-enabled-pages'

export function getPageShortcuts(featureToggles?: FeatureToggles): Array<{
  key: string
  ctrl?: boolean
  shift?: boolean
  description: string
  action: string
}> {
  console.log('[CONFIG] ⌨️ getPageShortcuts called')
  const shortcuts = getEnabledPages(featureToggles)
    .filter(page => page.shortcut)
    .map(page => {
      const parts = page.shortcut!.toLowerCase().split('+')
      const ctrl = parts.includes('ctrl')
      const shift = parts.includes('shift')
      const key = parts[parts.length - 1]

      return {
        key,
        ctrl,
        shift,
        description: `Go to ${page.title}`,
        action: page.id
      }
    })
  console.log('[CONFIG] ✅ Shortcuts configured:', shortcuts.length)
  return shortcuts
}
