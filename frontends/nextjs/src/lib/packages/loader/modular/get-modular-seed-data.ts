import {
  emptyModularPackageSeedData,
  type ModularPackageSeedData,
} from './modular-package-seed-data'
import { packageSystemState } from '../state/package-system-state'

/**
 * Get cached modular package seed data
 */
export function getModularSeedData(): ModularPackageSeedData {
  return packageSystemState.modularPackageSeedData ?? emptyModularPackageSeedData
}
