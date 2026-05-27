/**
 * Shared types and JSON registry loading for the component registry.
 */
import { ComponentType } from 'react'
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

export const getRegistryEntryKey = (
  entry: JsonRegistryEntry,
): string | undefined => entry.name ?? entry.type

export const getRegistryEntryExportName = (
  entry: JsonRegistryEntry,
): string | undefined =>
  entry.load?.export ?? entry.export ?? getRegistryEntryKey(entry)

export const jsonRegistryEntries: JsonRegistryEntry[] =
  jsonRegistry.components ?? []

export const registryEntryByType = new Map(
  jsonRegistryEntries
    .map((entry) => {
      const entryKey = getRegistryEntryKey(entry)
      return entryKey ? [entryKey, entry] : null
    })
    .filter((entry): entry is [string, JsonRegistryEntry] =>
      Boolean(entry),
    ),
)

export const deprecatedComponentInfo = jsonRegistryEntries.reduce<
  Record<string, DeprecatedComponentInfo>
>((acc, entry) => {
  const entryKey = getRegistryEntryKey(entry)
  if (!entryKey) return acc
  if (entry.status === 'deprecated' || entry.deprecated) {
    acc[entryKey] = entry.deprecated ?? {}
  }
  return acc
}, {})

export const resolveWrapperComponent = (
  type: string,
  registry: UIComponentRegistry,
): ComponentType<any> | null => {
  const entry = registryEntryByType.get(type)
  if (entry?.wrapperRequired && entry.wrapperComponent) {
    return registry[entry.wrapperComponent] || null
  }
  return null
}
