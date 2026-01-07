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
  const now = BigInt(Date.now())
  const script: LuaScript = {
    id: input.id ?? store.generateId('lua'),
    tenantId: input.tenantId ?? null,
    name: input.name,
    description: input.description,
    code: input.code,
    parameters: input.parameters,
    returnType: input.returnType ?? null,
    isSandboxed: input.isSandboxed ?? true,
    allowedGlobals: input.allowedGlobals,
    timeoutMs: input.timeoutMs ?? 5000,
    version: input.version ?? 1,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    createdBy: input.createdBy ?? null
  }

  const validationErrors = validateLuaScriptCreate(script)

  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  if (store.luaScriptNames.has(input.name)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Lua script name already exists' } }
  }

  store.luaScripts.set(script.id, script)
  store.luaScriptNames.set(script.name, script.id)

  return { success: true, data: script }
}
