import type { PackageRegistry } from '../package-glue'

/**
 * Cached package registry singleton
 */
let packageRegistry: PackageRegistry | null = null

/**
 * Get the current package registry
 */
export function getPackageRegistry(): PackageRegistry | null {
  return packageRegistry
}

/**
 * Set the package registry (called during initialization)
 */
export function setPackageRegistry(registry: PackageRegistry | null): void {
  packageRegistry = registry
}
