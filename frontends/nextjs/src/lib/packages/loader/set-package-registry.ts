import type { PackageRegistry } from '../package-glue'
import { packageRegistryState } from './package-registry-state'

/**
 * Set the package registry (called during initialization)
 */
export function setPackageRegistry(registry: PackageRegistry | null): void {
  packageRegistryState.registry = registry
}
