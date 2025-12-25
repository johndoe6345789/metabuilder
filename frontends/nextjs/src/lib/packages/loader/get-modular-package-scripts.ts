import { initializePackageSystem, getModularSeedData } from './initialize-package-system'

/**
 * Get modular package scripts
 */
export async function getModularPackageScripts(): Promise<any[]> {
  await initializePackageSystem()
  return getModularSeedData().scripts
}
