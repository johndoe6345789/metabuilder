/**
 * @file create-lua-script.ts
 * @description Create Lua script operation
 */
import type { DBALAdapter } from '../../../adapters/adapter'
import type { LuaScript } from '../../types'
import { DBALError } from '../../errors'
import { validateLuaScriptCreate } from '../../validation'

/**
 * Create a new Lua script in the store
 */
export async function createLuaScript(
  adapter: DBALAdapter,
  data: Omit<LuaScript, 'id' | 'createdAt' | 'updatedAt'>
): Promise<LuaScript> {
  const validationErrors = validateLuaScriptCreate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError(
      'Invalid Lua script data',
      validationErrors.map(error => ({ field: 'luaScript', error }))
    )
  }

  try {
    return adapter.create('LuaScript', data) as Promise<LuaScript>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict(`Lua script with name '${data.name}' already exists`)
    }
    throw error
  }
}
