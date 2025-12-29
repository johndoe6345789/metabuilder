import { initializePackageSystem } from '../state/initialize-package-system'
import { getModularSeedData } from './get-modular-seed-data'
import type { ModularPackageScriptSeed } from './modular-package-seed-data'

/**
 * Get modular package scripts
 */
export async function getModularPackageScripts(): Promise<ModularPackageScriptSeed[]> {
  await initializePackageSystem()
  return getModularSeedData().scripts
}
