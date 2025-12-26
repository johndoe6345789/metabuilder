/**
 * @file get-lua-script.ts
 * @description Get Lua script operation
 */
import type { LuaScript, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Get a Lua script by ID
 */
export async function getLuaScript(store: InMemoryStore, id: string): Promise<Result<LuaScript>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const script = store.luaScripts.get(id);
  if (!script) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Lua script not found: ${id}` } };
  }

  return { success: true, data: script };
}
