import _pagesConfig from './pages.json'
import { PageSchema } from '@/types/json-ui'
import { FeatureToggles } from '@/types/project'

// Cast JSON to avoid literal type narrowing issues (type: "json" vs type: string)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pagesConfig = _pagesConfig as any

export interface PropConfig {
  /**
   * Component page prop bindings (map to stateContext).
   */
  state?: string[]
  /**
   * Component page action bindings (map to actionContext).
   */
  actions?: string[]
  /**
   * JSON page data bindings (map to stateContext).
   */
  data?: string[]
  /**
   * JSON page function bindings (map to actionContext).
   */
  functions?: string[]
}

export interface ResizableConfig {
  leftComponent: string
  leftProps: PropConfig
  leftPanel: {
    defaultSize: number
    minSize: number
    maxSize: number
  }
  rightPanel: {
    defaultSize: number
  }
}

export interface BasePageConfig {
  id: string
  title: string
  icon: string
  enabled: boolean
  isRoot?: boolean
  toggleKey?: string
  shortcut?: string
  order: number
  requiresResizable?: boolean
  props?: PropConfig
  resizableConfig?: ResizableConfig
}

export interface ComponentPageConfig extends BasePageConfig {
  type?: 'component'
  component: string
  schemaPath?: undefined
  schema?: undefined
}

export interface JsonPageConfig extends BasePageConfig {
  type: 'json'
  component?: undefined
  schemaPath?: string
  schema?: PageSchema
}

export type PageConfig = ComponentPageConfig | JsonPageConfig

export interface PagesConfig {
  pages: PageConfig[]
}

export function getPageConfig(): PagesConfig {
  return pagesConfig as PagesConfig
}

export function getPageById(id: string): PageConfig | undefined {
  const page = pagesConfig.pages.find(page => page.id === id)
  return page
}

export function getEnabledPages(featureToggles?: FeatureToggles): PageConfig[] {
  const enabled = pagesConfig.pages.filter(page => {
    if (!page.enabled) {
      return false
    }
    if (!page.toggleKey) return true
    return featureToggles?.[page.toggleKey as keyof FeatureToggles] !== false
  }).sort((a, b) => a.order - b.order)
  return enabled
}

export function getPageShortcuts(featureToggles?: FeatureToggles): Array<{
  key: string
  ctrl?: boolean
  shift?: boolean
  description: string
  action: string
}> {
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
  return shortcuts
}

export function resolveProps(propConfig: PropConfig | undefined, stateContext: Record<string, any>, actionContext: Record<string, any>): Record<string, any> {
  if (!propConfig) {
    return {}
  }

  const resolvedProps: Record<string, any> = {}

  const resolveEntries = (
    entries: string[] | undefined,
    context: Record<string, any>,
    _label: string
  ) => {
    if (!entries?.length) {
      return
    }

    for (const entry of entries) {
      try {
        const [propName, contextKey] = entry.includes(':')
          ? entry.split(':')
          : [entry, entry]

        if (context[contextKey] !== undefined) {
          resolvedProps[propName] = context[contextKey]
        }
      } catch (err) {
        // skip unresolvable prop
      }
    }
  }

  try {
    resolveEntries(propConfig.state, stateContext, 'state')
    resolveEntries(propConfig.data, stateContext, 'data')
    resolveEntries(propConfig.actions, actionContext, 'action')
    resolveEntries(propConfig.functions, actionContext, 'function')
  } catch (err) {
    console.error('[CONFIG] Failed to resolve props:', err)
  }

  return resolvedProps
}
