/**
 * @file get-package.ts
 * @description Get package operations
 */
import type { Package, Result } from '../../types'
import type { InMemoryStore } from '../../store/in-memory-store'
import { validateId } from '../../validation/validate-id'

/**
 * Get a package by ID
 */
export const getPackage = async (store: InMemoryStore, id: string): Promise<Result<Package>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const pkg = store.packages.get(id)
  if (!pkg) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Package not found: ${id}` } }
  }

  return { success: true, data: pkg }
}

/**
 * Get a package by name+version key (name@version)
 */
export const getPackageByPackageId = async (store: InMemoryStore, packageKey: string): Promise<Result<Package>> => {
  if (!packageKey) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Package key is required' } }
  }

  const id = store.packageKeys.get(packageKey)
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Package not found: ${packageKey}` } }
  }

  return getPackage(store, id)
}
