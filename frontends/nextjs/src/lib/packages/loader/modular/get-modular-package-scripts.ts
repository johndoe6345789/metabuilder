import { getModularSeedData } from './get-modular-seed-data'
import { initializePackageSystem } from '../state/initialize-package-system'

/**
 * Get modular package scripts
 */
export async function getModularPackageScripts(): Promise<any[]> {
  await initializePackageSystem()
  return getModularSeedData().scripts
}
