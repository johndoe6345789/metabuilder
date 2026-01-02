/**
 * Minimal declarative component registry
 *
 * Provides a tiny in-memory registry and a helper to load package component
 * definitions (used by the package initialization flow). This is intentionally
 * small — it avoids pulling in the full renderer while allowing packages to
 * register their component metadata at startup.
 */

type ComponentDef = any

const PACKAGE_COMPONENT_REGISTRY: Record<string, Record<string, ComponentDef>> = {}

/**
 * Load components from a package seed/content object into the registry.
 * The `packageContent` object is expected to include `metadata.packageId`
 * and a `components` array (or object) with component definitions.
 */
export function loadPackageComponents(packageContent: any): void {
  if (!packageContent) return

  const packageId = packageContent?.metadata?.packageId || packageContent?.package || packageContent?.packageId
  if (!packageId) return

  const compsArray: any[] =
    Array.isArray(packageContent.components) && packageContent.components.length
      ? packageContent.components
      : Array.isArray(packageContent.ui?.components)
      ? packageContent.ui.components
      : []

  const compMap: Record<string, ComponentDef> = {}

  for (const c of compsArray) {
    if (!c || !c.id) continue
    compMap[c.id] = c
  }

  PACKAGE_COMPONENT_REGISTRY[packageId] = {
    ...(PACKAGE_COMPONENT_REGISTRY[packageId] || {}),
    ...compMap,
  }
}

export function getRegisteredComponent(packageId: string, componentId: string): ComponentDef | null {
  return PACKAGE_COMPONENT_REGISTRY[packageId]?.[componentId] || null
}

export function listRegisteredPackages(): string[] {
  return Object.keys(PACKAGE_COMPONENT_REGISTRY)
}

export function clearRegistry(): void {
  Object.keys(PACKAGE_COMPONENT_REGISTRY).forEach(k => delete PACKAGE_COMPONENT_REGISTRY[k])
}

export type { ComponentDef }
