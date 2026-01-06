/**
 * @file create-lua-script.ts
 * @description Create Lua script operation
 */
import type { CreateLuaScriptInput, LuaScript, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateLuaScriptCreate } from '../../../validation/entities/lua-script/validate-lua-script-create'

/**
 * Create a new Lua script in the store
 */
export const createLuaScript = async (
  store: InMemoryStore,
  input: CreateLuaScriptInput
): Promise<Result<LuaScript>> => {
  const isSandboxed = input.isSandboxed ?? true
  const timeoutMs = input.timeoutMs ?? 5000
  const validationErrors = validateLuaScriptCreate({
    name: input.name,
    description: input.description,
    code: input.code,
    isSandboxed,
    allowedGlobals: input.allowedGlobals,
    timeoutMs,
    createdBy: input.createdBy
  })

  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] } }
  }

  if (store.luaScriptNames.has(input.name)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Lua script name already exists' } }
  }

  const script: LuaScript = {
    id: store.generateId('lua'),
    name: input.name,
    description: input.description,
    code: input.code,
    isSandboxed,
    allowedGlobals: [...input.allowedGlobals],
    timeoutMs,
    createdBy: input.createdBy,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  store.luaScripts.set(script.id, script)
  store.luaScriptNames.set(script.name, script.id)

  return { success: true, data: script }
}
