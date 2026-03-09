import dynamic from 'next/dynamic'
import componentRegistryConfig from '../../component-registry.json'

type ComponentConfig = {
  name: string
  path: string
  export: string
  type: string
  preload?: boolean
  preloadPriority?: 'high' | 'medium' | 'low'
  category?: string
  dependencies?: string[]
  preloadDependencies?: string[]
  experimental?: boolean
  description?: string
}

type RegistryConfig = {
  version: string
  components: ComponentConfig[]
  dialogs: ComponentConfig[]
  pwa: ComponentConfig[]
  preloadStrategy: {
    critical: string[]
    onDemand: string
    preloadDelay: number
  }
}

const config = componentRegistryConfig as RegistryConfig

// TSX components use next/dynamic with proper import() for code splitting
const tsxDynamicMap: Record<string, any> = {
  ProjectDashboard: dynamic(
    () => import('@/components/ProjectDashboard').then(mod => ({ default: (mod as any).default ?? (mod as any).ProjectDashboard ?? Object.values(mod).find(v => typeof v === 'function') })),
    { ssr: true }
  ),
}

function resolveComponent(componentConfig: ComponentConfig) {
  const exportName = componentConfig.export || componentConfig.name

  // 1. TSX components — pre-built next/dynamic wrappers
  const tsxComponent = tsxDynamicMap[exportName] ?? tsxDynamicMap[componentConfig.name]
  if (tsxComponent) {
    return tsxComponent
  }

  // 2. JSON+hooks components — lazy import to avoid circular dependency
  //    json-components.ts has a large import tree that can circle back here.
  //    By deferring the require to first access, the circular dep is resolved.
  const jsonExports = require('@/lib/json-ui/json-components')
  const jsonResolved = jsonExports[exportName] ?? jsonExports[componentConfig.name]
  if (jsonResolved) {
    return jsonResolved
  }

  // 3. Placeholder
  const Placeholder = () => null
  Placeholder.displayName = `${componentConfig.name}Placeholder`
  return Placeholder
}

// Lazy registry: resolves components on first access, not at module load time.
// This breaks the circular dependency between component-registry ↔ json-components.
function createLazyRegistry(components: ComponentConfig[]) {
  const cache: Record<string, any> = {}
  const configMap: Record<string, ComponentConfig> = {}
  for (const c of components) {
    configMap[c.name] = c
  }

  return new Proxy(cache, {
    get(target, prop: string) {
      if (typeof prop !== 'string') return undefined
      if (prop in target) return target[prop]
      const componentConfig = configMap[prop]
      if (!componentConfig) return undefined
      target[prop] = resolveComponent(componentConfig)
      return target[prop]
    },
    has(_, prop: string) {
      return prop in configMap
    },
    ownKeys() {
      return Object.keys(configMap)
    },
    getOwnPropertyDescriptor(_, prop: string) {
      if (prop in configMap) {
        return { configurable: true, enumerable: true, writable: true }
      }
      return undefined
    }
  }) as Record<string, any>
}

export const ComponentRegistry = createLazyRegistry(config.components)
export const DialogRegistry = createLazyRegistry(config.dialogs)
export const PWARegistry = createLazyRegistry(config.pwa)

export function preloadCriticalComponents() {
  // With lazy registry + next/dynamic, preloading is handled by Next.js
}

export function preloadComponentByName(_name: string) {
  // With lazy registry + next/dynamic, preloading is handled by Next.js
}

export function getComponentMetadata(name: string): ComponentConfig | undefined {
  return [...config.components, ...config.dialogs, ...config.pwa].find(c => c.name === name)
}

export function getComponentsByCategory(category: string): ComponentConfig[] {
  return config.components.filter(c => c.category === category)
}

export function getAllCategories(): string[] {
  const categories = new Set(config.components.map(c => c.category).filter(Boolean))
  return Array.from(categories) as string[]
}

export type ComponentName = keyof typeof ComponentRegistry
export type DialogName = keyof typeof DialogRegistry
export type PWAComponentName = keyof typeof PWARegistry
