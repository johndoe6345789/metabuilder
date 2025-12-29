import { initializePackageSystem } from '../state/initialize-package-system'
import { getModularSeedData } from './get-modular-seed-data'

/**
 * Get modular package components
 */
export async function getModularPackageComponents(): Promise<any[]> {
  await initializePackageSystem()
  return getModularSeedData().components
}
