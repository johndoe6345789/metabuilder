import type { PackageDefinition, PackageRegistry } from '../types'

export function getPackagesByCategory(
  registry: PackageRegistry,
  category: string
): PackageDefinition[] {
  return Object.values(registry).filter((pkg) => pkg.category === category)
}
