/**
 * @file get-lua-script.ts
 * @description Get Lua script by ID operation
 */
import type { LuaScript, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../../../validation/entities/validate-id'

/**
 * Get a Lua script by ID
 */
export const getLuaScript = async (store: InMemoryStore, id: string): Promise<Result<LuaScript>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const script = store.luaScripts.get(id)
  if (!script) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Lua script not found: ${id}` } }
  }

  return { success: true, data: script }
}
