/**
 * @file get-package.ts
 * @description Get package operations
 */
import type { Package, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Get a package by ID
 */
export async function getPackage(store: InMemoryStore, id: string): Promise<Result<Package>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const pkg = store.packages.get(id);
  if (!pkg) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Package not found: ${id}` } };
  }

  return { success: true, data: pkg };
}

/**
 * Get a package by package_id (snake_case identifier)
 */
export async function getPackageByPackageId(store: InMemoryStore, packageId: string): Promise<Result<Package>> {
  if (!packageId) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Package ID required' } };
  }

  const id = store.packageIds.get(packageId);
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Package not found: ${packageId}` } };
  }

  return getPackage(store, id);
}
