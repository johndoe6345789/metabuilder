/**
 * @file list-users.ts
 * @description List users with filtering and pagination
 */
import type { User, ListOptions, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * List users with filtering and pagination
 */
export async function listUsers(
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<User[]>> {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options;

  let users = Array.from(store.users.values());

  // Apply filters
  if (filter.isActive !== undefined) {
    users = users.filter((u) => u.isActive === filter.isActive);
  }
  if (filter.level !== undefined) {
    users = users.filter((u) => u.level === filter.level);
  }

  // Apply sorting
  if (sort.name) {
    users.sort((a, b) => (sort.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  } else if (sort.createdAt) {
    users.sort((a, b) =>
      sort.createdAt === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Apply pagination
  const start = (page - 1) * limit;
  const paginated = users.slice(start, start + limit);

  return { success: true, data: paginated };
}
