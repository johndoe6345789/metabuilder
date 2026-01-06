/**
 * @file create-package.ts
 * @description Create package operation
 */
import type { CreatePackageInput, Package, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validatePackageCreate } from '../validation/validate-package-create'

/**
 * Create a new package in the store
 */
export const createPackage = async (
  store: InMemoryStore,
  input: CreatePackageInput
): Promise<Result<Package>> => {
  const isInstalled = input.isInstalled ?? false
  const validationErrors = validatePackageCreate({
    name: input.name,
    version: input.version,
    description: input.description,
    author: input.author,
    manifest: input.manifest,
    isInstalled,
    installedAt: input.installedAt,
    installedBy: input.installedBy
  })

  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  const key = `${input.name}@${input.version}`
  if (store.packageKeys.has(key)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Package name+version already exists' } }
  }

  const pkg: Package = {
    id: store.generateId('package'),
    name: input.name,
    version: input.version,
    description: input.description,
    author: input.author,
    manifest: input.manifest,
    isInstalled,
    installedAt: input.installedAt,
    installedBy: input.installedBy,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  store.packages.set(pkg.id, pkg)
  store.packageKeys.set(key, pkg.id)

  return { success: true, data: pkg }
}
