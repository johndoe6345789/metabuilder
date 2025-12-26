import { getModularSeedData } from './get-modular-seed-data'
import { initializePackageSystem } from './initialize-package-system'

/**
 * Get modular package components
 */
export async function getModularPackageComponents(): Promise<any[]> {
  await initializePackageSystem()
  return getModularSeedData().components
}
