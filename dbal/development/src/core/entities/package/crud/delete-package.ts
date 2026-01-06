/**
 * @file delete-package.ts
 * @description Delete package operation
 */
import type { Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'

/**
 * Delete a package by ID
 */
export const deletePackage = async (store: InMemoryStore, id: string): Promise<Result<boolean>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const pkg = store.packages.get(id)
  if (!pkg) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Package not found: ${id}` } }
  }

  store.packages.delete(id)
  store.packageKeys.delete(`${pkg.name}@${pkg.version}`)

  return { success: true, data: true }
}
