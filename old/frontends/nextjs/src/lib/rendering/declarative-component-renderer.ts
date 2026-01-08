/**
 * Minimal declarative component registry
 *
 * Provides a tiny in-memory registry and a helper to load package component
 * definitions (used by the package initialization flow). This is intentionally
 * small — it avoids pulling in the full renderer while allowing packages to
 * register their component metadata at startup.
 */

import type { JsonValue, JsonObject } from '@/types/utility-types'

type ComponentDef = JsonObject

const PACKAGE_COMPONENT_REGISTRY: Record<string, Record<string, ComponentDef>> = {}

/**
 * Load components from a package seed/content object into the registry.
 * The `packageContent` object is expected to include `metadata.packageId`
 * and a `components` array (or object) with component definitions.
 */
export function loadPackageComponents(packageContent: JsonValue): void {
  if (typeof packageContent !== 'object' || packageContent === null) return

  const pkg = packageContent as JsonObject
  const metadata = pkg.metadata
  const packageId =
    (metadata !== null && metadata !== undefined && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as JsonObject)['packageId']
      : undefined) ?? 
    pkg['package'] ?? 
    pkg['packageId']
  if (packageId === null || packageId === undefined || typeof packageId !== 'string') return

  const compsArray: JsonValue[] =
    Array.isArray(pkg.components) && pkg.components.length > 0
      ? pkg.components
      : Array.isArray((pkg.ui as JsonObject | undefined)?.components)
      ? ((pkg.ui as JsonObject).components as JsonValue[])
      : []

  const compMap: Record<string, ComponentDef> = {}

  for (const c of compsArray) {
    if (c === null || typeof c !== 'object' || Array.isArray(c)) continue
    const comp = c as JsonObject
    if (typeof comp.id !== 'string') continue
    compMap[comp.id] = comp
  }

  PACKAGE_COMPONENT_REGISTRY[packageId] = {
    ...(PACKAGE_COMPONENT_REGISTRY[packageId] ?? {}),
    ...compMap,
  }
}

export function getRegisteredComponent(packageId: string, componentId: string): ComponentDef | null {
  return PACKAGE_COMPONENT_REGISTRY[packageId]?.[componentId] ?? null
}

export function listRegisteredPackages(): string[] {
  return Object.keys(PACKAGE_COMPONENT_REGISTRY)
}

export function clearRegistry(): void {
  Object.keys(PACKAGE_COMPONENT_REGISTRY).forEach(k => delete PACKAGE_COMPONENT_REGISTRY[k])
}

export type { ComponentDef }
