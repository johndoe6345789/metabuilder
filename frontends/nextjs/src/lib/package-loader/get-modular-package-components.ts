import { initializePackageSystem, getModularSeedData } from './initialize-package-system'

/**
 * Get modular package components
 */
export async function getModularPackageComponents(): Promise<any[]> {
  await initializePackageSystem()
  return getModularSeedData().components
}
