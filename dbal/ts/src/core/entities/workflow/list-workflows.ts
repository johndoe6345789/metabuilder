/**
 * @file list-workflows.ts
 * @description List workflows with filtering and pagination
 */
import type { Workflow, ListOptions, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * List workflows with filtering and pagination
 */
export async function listWorkflows(
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<Workflow[]>> {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options;

  let workflows = Array.from(store.workflows.values());

  // Apply filters
  if (filter.isActive !== undefined) {
    workflows = workflows.filter((w) => w.isActive === filter.isActive);
  }
  if (filter.type !== undefined) {
    workflows = workflows.filter((w) => w.type === filter.type);
  }

  // Apply sorting
  if (sort.name) {
    workflows.sort((a, b) => (sort.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  } else if (sort.createdAt) {
    workflows.sort((a, b) =>
      sort.createdAt === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Apply pagination
  const start = (page - 1) * limit;
  const paginated = workflows.slice(start, start + limit);

  return { success: true, data: paginated };
}
