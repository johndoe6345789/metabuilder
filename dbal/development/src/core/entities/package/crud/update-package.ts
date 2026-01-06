/**
 * @file update-package.ts
 * @description Update package operation
 */
import type { Package, Result, UpdatePackageInput } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'
import { validatePackageUpdate } from '../validation/validate-package-update'

/**
 * Update an existing package
 */
export const updatePackage = async (
  store: InMemoryStore,
  id: string,
  input: UpdatePackageInput
): Promise<Result<Package>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] ?? 'Invalid ID' } }
  }

  const pkg = store.packages.get(id)
  if (!pkg) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Package not found: ${id}` } }
  }

  const validationErrors = validatePackageUpdate(input)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  const nextName = input.name ?? pkg.name
  const nextVersion = input.version ?? pkg.version
  const currentKey = `${pkg.name}@${pkg.version}`
  const nextKey = `${nextName}@${nextVersion}`

  if (nextKey !== currentKey) {
    const existingId = store.packageKeys.get(nextKey)
    if (existingId && existingId !== id) {
      return { success: false, error: { code: 'CONFLICT', message: 'Package name+version already exists' } }
    }
    store.packageKeys.delete(currentKey)
    store.packageKeys.set(nextKey, id)
  }

  pkg.name = nextName
  pkg.version = nextVersion

  if (input.description !== undefined) {
    pkg.description = input.description
  }

  if (input.author !== undefined) {
    pkg.author = input.author
  }

  if (input.manifest !== undefined) {
    pkg.manifest = input.manifest
  }

  if (input.isInstalled !== undefined) {
    pkg.isInstalled = input.isInstalled
  }

  if (input.installedAt !== undefined) {
    pkg.installedAt = input.installedAt
  }

  if (input.installedBy !== undefined) {
    pkg.installedBy = input.installedBy
  }

  pkg.updatedAt = new Date()

  return { success: true, data: pkg }
}
