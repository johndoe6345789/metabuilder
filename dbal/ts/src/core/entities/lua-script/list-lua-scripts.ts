/**
 * @file list-lua-scripts.ts
 * @description List Lua scripts with filtering and pagination
 */
import type { LuaScript, ListOptions, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * List Lua scripts with filtering and pagination
 */
export async function listLuaScripts(
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<LuaScript[]>> {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options;

  let scripts = Array.from(store.luaScripts.values());

  // Apply filters
  if (filter.isActive !== undefined) {
    scripts = scripts.filter((s) => s.isActive === filter.isActive);
  }
  if (filter.category !== undefined) {
    scripts = scripts.filter((s) => s.category === filter.category);
  }

  // Apply sorting
  if (sort.name) {
    scripts.sort((a, b) => (sort.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  } else if (sort.createdAt) {
    scripts.sort((a, b) =>
      sort.createdAt === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Apply pagination
  const start = (page - 1) * limit;
  const paginated = scripts.slice(start, start + limit);

  return { success: true, data: paginated };
}
