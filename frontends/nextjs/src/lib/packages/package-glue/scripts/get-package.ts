import type { PackageDefinition, PackageRegistry } from '../types'

/**
 * Get a package by ID from a registry
 */
export function getPackage(
  registry: PackageRegistry,
  packageId: string
): PackageDefinition | undefined {
  return registry[packageId]
}
