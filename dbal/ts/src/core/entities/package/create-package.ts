/**
 * @file create-package.ts
 * @description Create package operation
 */
import type { Package, CreatePackageInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';
import { validatePackageId, validateVersion } from '../validation/package-validation';

/**
 * Create a new package in the store
 */
export async function createPackage(
  store: InMemoryStore,
  input: CreatePackageInput
): Promise<Result<Package>> {
  if (!input.name || input.name.length > 100) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required (max 100)' } };
  }
  if (!validatePackageId(input.packageId)) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid package ID format' } };
  }
  if (!validateVersion(input.version)) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid version format' } };
  }

  if (store.packageIds.has(input.packageId)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Package ID exists' } };
  }

  const pkg: Package = {
    id: store.generateId('package'),
    packageId: input.packageId,
    name: input.name,
    description: input.description ?? '',
    version: input.version,
    metadata: input.metadata ?? {},
    isActive: input.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.packages.set(pkg.id, pkg);
  store.packageIds.set(pkg.packageId, pkg.id);

  return { success: true, data: pkg };
}
