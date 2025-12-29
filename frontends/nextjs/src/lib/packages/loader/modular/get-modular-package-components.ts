import { initializePackageSystem } from '../state/initialize-package-system'
import { getModularSeedData } from './get-modular-seed-data'
import type { PackageComponent } from '../../package-glue/types'

/**
 * Get modular package components
 */
export async function getModularPackageComponents(): Promise<PackageComponent[]> {
  await initializePackageSystem()
  return getModularSeedData().components
}
