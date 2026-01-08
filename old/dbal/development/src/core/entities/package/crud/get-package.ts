/**
 * @file get-package.ts
 * @description Get package operations
 */
import type { InstalledPackage, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'

/**
 * Get an installed package by ID
 */
export const getPackage = async (store: InMemoryStore, id: string): Promise<Result<InstalledPackage>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] ?? 'Invalid ID' } }
  }

  const pkg = store.installedPackages.get(id)
  if (!pkg) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Package not found: ${id}` } }
  }

  return { success: true, data: pkg }
}

/**
 * Get an installed package by packageId
 */
export const getPackageByPackageId = async (
  store: InMemoryStore,
  packageId: string
): Promise<Result<InstalledPackage>> => {
  if (!packageId) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'packageId is required' } }
  }

  return getPackage(store, packageId)
}
