import type { PackageComponent } from '../../package-glue/types'
import { initializePackageSystem } from '../state/initialize-package-system'
import { getModularSeedData } from './get-modular-seed-data'

/**
 * Get modular package components
 */
export async function getModularPackageComponents(): Promise<PackageComponent[]> {
  await initializePackageSystem()
  return getModularSeedData().components
}
