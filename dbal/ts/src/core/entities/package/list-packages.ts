/**
 * @file list-packages.ts
 * @description List packages with filtering and pagination
 */
import type { Package, ListOptions, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * List packages with filtering and pagination
 */
export async function listPackages(
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<Package[]>> {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options;

  let packages = Array.from(store.packages.values());

  // Apply filters
  if (filter.isActive !== undefined) {
    packages = packages.filter((p) => p.isActive === filter.isActive);
  }

  // Apply sorting
  if (sort.name) {
    packages.sort((a, b) => (sort.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  } else if (sort.createdAt) {
    packages.sort((a, b) =>
      sort.createdAt === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Apply pagination
  const start = (page - 1) * limit;
  const paginated = packages.slice(start, start + limit);

  return { success: true, data: paginated };
}
