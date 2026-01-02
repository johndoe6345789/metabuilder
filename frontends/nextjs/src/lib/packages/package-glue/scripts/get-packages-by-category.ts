import type { PackageDefinition, PackageRegistry } from '../types'

/**
 * Get all packages in a category from a registry
 */
export function getPackagesByCategory(
  registry: PackageRegistry,
  category: string
): PackageDefinition[] {
  return Object.values(registry).filter(pkg => pkg.category === category)
}
