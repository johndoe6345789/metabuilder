import { initializePackageSystem } from '../state/initialize-package-system'
import { getModularSeedData } from './get-modular-seed-data'
import type { ModularPackageMetadataSeed } from './modular-package-seed-data'

/**
 * Get modular package metadata
 */
export async function getModularPackageMetadata(): Promise<ModularPackageMetadataSeed[]> {
  await initializePackageSystem()
  return getModularSeedData().packages
}
