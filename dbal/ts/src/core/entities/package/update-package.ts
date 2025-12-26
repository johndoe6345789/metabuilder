/**
 * @file update-package.ts
 * @description Update package operation
 */
import type { Package, UpdatePackageInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';
import { validateVersion } from '../validation/package-validation';

/**
 * Update an existing package
 */
export async function updatePackage(
  store: InMemoryStore,
  id: string,
  input: UpdatePackageInput
): Promise<Result<Package>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const pkg = store.packages.get(id);
  if (!pkg) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Package not found: ${id}` } };
  }

  if (input.name !== undefined) {
    if (!input.name || input.name.length > 100) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid name' } };
    }
    pkg.name = input.name;
  }

  if (input.version !== undefined) {
    if (!validateVersion(input.version)) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid version' } };
    }
    pkg.version = input.version;
  }

  if (input.description !== undefined) pkg.description = input.description;
  if (input.metadata !== undefined) pkg.metadata = input.metadata;
  if (input.isActive !== undefined) pkg.isActive = input.isActive;

  pkg.updatedAt = new Date();
  return { success: true, data: pkg };
}
