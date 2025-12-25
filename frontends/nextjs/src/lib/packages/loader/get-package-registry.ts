import type { PackageRegistry } from '../package-glue'
import { packageRegistryState } from './package-registry-state'

/**
 * Get the current package registry
 */
export function getPackageRegistry(): PackageRegistry | null {
  return packageRegistryState.registry
}
