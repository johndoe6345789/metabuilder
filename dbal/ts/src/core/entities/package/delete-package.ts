/**
 * @file delete-package.ts
 * @description Delete package operation
 */
import type { Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Delete a package by ID
 */
export async function deletePackage(store: InMemoryStore, id: string): Promise<Result<boolean>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const pkg = store.packages.get(id);
  if (!pkg) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Package not found: ${id}` } };
  }

  store.packageIds.delete(pkg.packageId);
  store.packages.delete(id);

  return { success: true, data: true };
}
