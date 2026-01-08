/**
 * @file update-package.ts
 * @description Update package operation
 */
import type { InstalledPackage, Result, UpdatePackageInput } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'
import { validatePackageUpdate } from '../validation/validate-package-update'

/**
 * Update an existing installed package
 */
export const updatePackage = async (
  store: InMemoryStore,
  id: string,
  input: UpdatePackageInput
): Promise<Result<InstalledPackage>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] ?? 'Invalid ID' } }
  }

  if (input.tenantId !== undefined) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'tenantId is immutable' } }
  }

  const pkg = store.installedPackages.get(id)
  if (!pkg) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Package not found: ${id}` } }
  }

  const validationErrors = validatePackageUpdate(input)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  if (input.installedAt !== undefined) {
    pkg.installedAt = input.installedAt
  }

  if (input.version !== undefined) {
    pkg.version = input.version
  }

  if (input.enabled !== undefined) {
    pkg.enabled = input.enabled
  }

  if (input.config !== undefined) {
    pkg.config = input.config ?? null
  }

  return { success: true, data: pkg }
}
