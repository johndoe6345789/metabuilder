/**
 * @file update-lua-script.ts
 * @description Update Lua script operation
 */
import type { LuaScript, Result, UpdateLuaScriptInput } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../../../validation/entities/validate-id'
import { validateLuaScriptUpdate } from '../../../validation/entities/lua-script/validate-lua-script-update'

/**
 * Update an existing Lua script
 */
export const updateLuaScript = async (
  store: InMemoryStore,
  id: string,
  input: UpdateLuaScriptInput
): Promise<Result<LuaScript>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] ?? 'Invalid ID' } }
  }

  const script = store.luaScripts.get(id)
  if (!script) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Lua script not found: ${id}` } }
  }

  const validationErrors = validateLuaScriptUpdate(input)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  if (input.name !== undefined && input.name !== script.name) {
    if (store.luaScriptNames.has(input.name)) {
      return { success: false, error: { code: 'CONFLICT', message: 'Lua script name already exists' } }
    }
    store.luaScriptNames.delete(script.name)
    store.luaScriptNames.set(input.name, id)
    script.name = input.name
  }

  if (input.description !== undefined) {
    script.description = input.description
  }

  if (input.code !== undefined) {
    script.code = input.code
  }

  if (input.isSandboxed !== undefined) {
    script.isSandboxed = input.isSandboxed
  }

  if (input.allowedGlobals !== undefined) {
    script.allowedGlobals = [...input.allowedGlobals]
  }

  if (input.timeoutMs !== undefined) {
    script.timeoutMs = input.timeoutMs
  }

  if (input.createdBy !== undefined) {
    script.createdBy = input.createdBy
  }

  script.updatedAt = new Date()

  return { success: true, data: script }
}
