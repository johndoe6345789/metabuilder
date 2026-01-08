/**
 * @file create-package.ts
 * @description Create package operation
 */
import type { CreatePackageInput, InstalledPackage, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validatePackageCreate } from '../validation/validate-package-create'

/**
 * Create a new installed package in the store
 */
export const createPackage = async (
  store: InMemoryStore,
  input: CreatePackageInput
): Promise<Result<InstalledPackage>> => {
  const installedAt = input.installedAt ?? BigInt(Date.now())
  const payload: InstalledPackage = {
    packageId: input.packageId,
    tenantId: input.tenantId ?? null,
    installedAt,
    version: input.version,
    enabled: input.enabled,
    config: input.config ?? null
  }

  const validationErrors = validatePackageCreate(payload)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  if (store.installedPackages.has(payload.packageId!)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Package ID already exists' } }
  }

  store.installedPackages.set(payload.packageId!, payload)

  return { success: true, data: payload }
}
