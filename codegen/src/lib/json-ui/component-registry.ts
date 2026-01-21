import { ComponentType } from 'react'
import * as PhosphorIcons from '@phosphor-icons/react'
import jsonComponentsRegistry from '../../../json-components-registry.json'

export interface UIComponentRegistry {
  [key: string]: ComponentType<any>
}

interface JsonRegistryEntry {
  name?: string
  type?: string
  export?: string
  source?: string
  status?: string
  wrapperRequired?: boolean
  wrapperComponent?: string
  wrapperFor?: string
  load?: {
    path?: string
    export?: string
  }
  deprecated?: DeprecatedComponentInfo
}

interface JsonComponentRegistry {
  components?: JsonRegistryEntry[]
  sourceRoots?: Record<string, string[]>
}

export interface DeprecatedComponentInfo {
  replacedBy?: string
  message?: string
}

const jsonRegistry = jsonComponentsRegistry as JsonComponentRegistry
const sourceRoots = jsonRegistry.sourceRoots ?? {}
// Note: import.meta.glob requires literal patterns, cannot use variables
// Disabled for now since we're using explicit glob imports below
const moduleMapsBySource = Object.fromEntries(
  Object.entries(sourceRoots).map(([source]) => {
    return [source, {}]
  })
) as Record<string, Record<string, unknown>>

const getRegistryEntryKey = (entry: JsonRegistryEntry): string | undefined =>
  entry.name ?? entry.type

const getRegistryEntryExportName = (entry: JsonRegistryEntry): string | undefined =>
  entry.load?.export ?? entry.export ?? getRegistryEntryKey(entry)

const jsonRegistryEntries = jsonRegistry.components ?? []
const registryEntryByType = new Map(
  jsonRegistryEntries
    .map((entry) => {
      const entryKey = getRegistryEntryKey(entry)
      return entryKey ? [entryKey, entry] : null
    })
    .filter((entry): entry is [string, JsonRegistryEntry] => Boolean(entry))
)
const deprecatedComponentInfo = jsonRegistryEntries.reduce<Record<string, DeprecatedComponentInfo>>(
  (acc, entry) => {
    const entryKey = getRegistryEntryKey(entry)
    if (!entryKey) {
      return acc
    }
    if (entry.status === 'deprecated' || entry.deprecated) {
      acc[entryKey] = entry.deprecated ?? {}
    }
    return acc
  },
  {}
)

const buildComponentMapFromExports = (
  exports: Record<string, unknown>
): Record<string, ComponentType<any>> => {
  return Object.entries(exports).reduce<Record<string, ComponentType<any>>>((acc, [key, value]) => {
    if (value && (typeof value === 'function' || typeof value === 'object')) {
      acc[key] = value as ComponentType<any>
    }
    return acc
  }, {})
}

const buildComponentMapFromModules = (
  modules: Record<string, unknown>
): Record<string, ComponentType<any>> => {
  return Object.values(modules).reduce<Record<string, ComponentType<any>>>((acc, moduleExports) => {
    if (!moduleExports || typeof moduleExports !== 'object') {
      return acc
    }
    Object.entries(buildComponentMapFromExports(moduleExports as Record<string, unknown>)).forEach(
      ([key, component]) => {
        acc[key] = component
      }
    )
    return acc
  }, {})
}

const atomModules = import.meta.glob('@/components/atoms/*.tsx', { eager: true })
const moleculeModules = import.meta.glob('@/components/molecules/*.tsx', { eager: true })
const organismModules = import.meta.glob('@/components/organisms/*.tsx', { eager: true })
const uiModules = import.meta.glob('@/components/ui/**/*.{ts,tsx}', { eager: true })
const wrapperModules = import.meta.glob('@/lib/json-ui/wrappers/*.tsx', { eager: true })
const explicitModules = import.meta.glob(
  ['@/components/**/*.tsx', '@/lib/json-ui/wrappers/**/*.tsx'],
  { eager: true }
)

const atomComponentMap = buildComponentMapFromModules(atomModules)
const moleculeComponentMap = buildComponentMapFromModules(moleculeModules)
const organismComponentMap = buildComponentMapFromModules(organismModules)
const uiComponentMap = buildComponentMapFromModules(uiModules)
const wrapperComponentMap = buildComponentMapFromModules(wrapperModules)
const iconComponentMap = buildComponentMapFromExports(PhosphorIcons)

const resolveComponentFromExplicitPath = (
  entry: JsonRegistryEntry,
  entryExportName: string
): ComponentType<any> | undefined => {
  if (!entry.load?.path) {
    return undefined
  }
  const moduleExports = explicitModules[entry.load.path]
  if (!moduleExports || typeof moduleExports !== 'object') {
    return undefined
  }
  const explicitComponents = buildComponentMapFromExports(
    moduleExports as Record<string, unknown>
  )
  return explicitComponents[entryExportName]
}

const buildRegistryFromEntries = (
  source: string,
  componentMap: Record<string, ComponentType<any>>
): UIComponentRegistry => {
  return jsonRegistryEntries
    .filter((entry) => entry.source === source)
    .reduce<UIComponentRegistry>((registry, entry) => {
      const entryKey = getRegistryEntryKey(entry)
      const entryExportName = getRegistryEntryExportName(entry)
      if (!entryKey || !entryExportName) {
        return registry
      }
      const component =
        resolveComponentFromExplicitPath(entry, entryExportName) ??
        componentMap[entryExportName]
      if (component) {
        registry[entryKey] = component
      }
      return registry
    }, {})
}

export const primitiveComponents: UIComponentRegistry = {
  div: 'div' as any,
  span: 'span' as any,
  p: 'p' as any,
  h1: 'h1' as any,
  h2: 'h2' as any,
  h3: 'h3' as any,
  h4: 'h4' as any,
  h5: 'h5' as any,
  h6: 'h6' as any,
  section: 'section' as any,
  article: 'article' as any,
  header: 'header' as any,
  footer: 'footer' as any,
  main: 'main' as any,
  aside: 'aside' as any,
  nav: 'nav' as any,
}

export const shadcnComponents: UIComponentRegistry = buildRegistryFromEntries(
  'ui',
  uiComponentMap
)

export const atomComponents: UIComponentRegistry = buildRegistryFromEntries(
  'atoms',
  atomComponentMap
)

export const moleculeComponents: UIComponentRegistry = buildRegistryFromEntries(
  'molecules',
  moleculeComponentMap
)

export const organismComponents: UIComponentRegistry = buildRegistryFromEntries(
  'organisms',
  organismComponentMap
)

export const jsonWrapperComponents: UIComponentRegistry = buildRegistryFromEntries(
  'wrappers',
  wrapperComponentMap
)

export const iconComponents: UIComponentRegistry = buildRegistryFromEntries(
  'icons',
  iconComponentMap
)

export const uiComponentRegistry: UIComponentRegistry = {
  ...primitiveComponents,
  ...shadcnComponents,
  ...atomComponents,
  ...moleculeComponents,
  ...organismComponents,
  ...jsonWrapperComponents,
  ...iconComponents,
}

export function registerComponent(name: string, component: ComponentType<any>) {
  uiComponentRegistry[name] = component
}

const resolveWrapperComponent = (type: string): ComponentType<any> | null => {
  const entry = registryEntryByType.get(type)
  if (entry?.wrapperRequired && entry.wrapperComponent) {
    return uiComponentRegistry[entry.wrapperComponent] || null
  }
  return null
}

export function getUIComponent(type: string): ComponentType<any> | string | null {
  return resolveWrapperComponent(type) ?? uiComponentRegistry[type] ?? null
}

export function hasComponent(type: string): boolean {
  return Boolean(resolveWrapperComponent(type) ?? uiComponentRegistry[type])
}

export function getDeprecatedComponentInfo(type: string): DeprecatedComponentInfo | null {
  return deprecatedComponentInfo[type] ?? null
}
