import { initializePackageSystem, getModularSeedData } from './initialize-package-system'

/**
 * Get modular package metadata
 */
export async function getModularPackageMetadata(): Promise<any[]> {
  await initializePackageSystem()
  return getModularSeedData().packages
}
