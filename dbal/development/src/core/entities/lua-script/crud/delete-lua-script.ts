/**
 * @file delete-lua-script.ts
 * @description Delete Lua script operation
 */
import type { Result } from '../../types'
import type { InMemoryStore } from '../../store/in-memory-store'
import { validateId } from '../../validation/validate-id'

/**
 * Delete a Lua script by ID
 */
export const deleteLuaScript = async (store: InMemoryStore, id: string): Promise<Result<boolean>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const script = store.luaScripts.get(id)
  if (!script) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Lua script not found: ${id}` } }
  }

  store.luaScripts.delete(id)
  store.luaScriptNames.delete(script.name)

  return { success: true, data: true }
}
