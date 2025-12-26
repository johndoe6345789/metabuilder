/**
 * @file delete-lua-script.ts
 * @description Delete Lua script operation
 */
import type { Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Delete a Lua script by ID
 */
export async function deleteLuaScript(store: InMemoryStore, id: string): Promise<Result<boolean>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const script = store.luaScripts.get(id);
  if (!script) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Lua script not found: ${id}` } };
  }

  store.luaScripts.delete(id);
  return { success: true, data: true };
}
