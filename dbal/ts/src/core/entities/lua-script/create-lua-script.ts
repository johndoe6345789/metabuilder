/**
 * @file create-lua-script.ts
 * @description Create Lua script operation
 */
import type { LuaScript, CreateLuaScriptInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';
import { validateLuaSyntax } from '../validation/lua-script-validation';

/**
 * Create a new Lua script in the store
 */
export async function createLuaScript(
  store: InMemoryStore,
  input: CreateLuaScriptInput
): Promise<Result<LuaScript>> {
  if (!input.name || input.name.length > 100) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required (max 100)' } };
  }
  if (!input.code) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Code required' } };
  }
  if (!validateLuaSyntax(input.code)) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid Lua syntax' } };
  }

  const script: LuaScript = {
    id: store.generateId('lua_script'),
    name: input.name,
    description: input.description ?? '',
    code: input.code,
    category: input.category ?? 'general',
    isActive: input.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.luaScripts.set(script.id, script);
  return { success: true, data: script };
}
