import { initializePackageSystem } from '../state/initialize-package-system'
import { getModularSeedData } from './get-modular-seed-data'

/**
 * Get modular package metadata
 */
export async function getModularPackageMetadata(): Promise<any[]> {
  await initializePackageSystem()
  return getModularSeedData().packages
}
