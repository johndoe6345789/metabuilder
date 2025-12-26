import { getModularSeedData } from './get-modular-seed-data'
import { initializePackageSystem } from '../state/initialize-package-system'

/**
 * Get modular package metadata
 */
export async function getModularPackageMetadata(): Promise<any[]> {
  await initializePackageSystem()
  return getModularSeedData().packages
}
