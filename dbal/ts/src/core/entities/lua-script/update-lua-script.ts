/**
 * @file update-lua-script.ts
 * @description Update Lua script operation
 */
import type { LuaScript, UpdateLuaScriptInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';
import { validateLuaSyntax } from '../validation/lua-script-validation';

/**
 * Update an existing Lua script
 */
export async function updateLuaScript(
  store: InMemoryStore,
  id: string,
  input: UpdateLuaScriptInput
): Promise<Result<LuaScript>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const script = store.luaScripts.get(id);
  if (!script) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Lua script not found: ${id}` } };
  }

  if (input.name !== undefined) {
    if (!input.name || input.name.length > 100) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid name' } };
    }
    script.name = input.name;
  }

  if (input.code !== undefined) {
    if (!input.code || !validateLuaSyntax(input.code)) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid Lua code' } };
    }
    script.code = input.code;
  }

  if (input.description !== undefined) script.description = input.description;
  if (input.category !== undefined) script.category = input.category;
  if (input.isActive !== undefined) script.isActive = input.isActive;

  script.updatedAt = new Date();
  return { success: true, data: script };
}
