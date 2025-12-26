/**
 * @file update-lua-script.ts
 * @description Update Lua script operation
 */
import type { DBALAdapter } from '../../../adapters/adapter'
import type { LuaScript } from '../../types'
import { DBALError } from '../../errors'
import { validateId, validateLuaScriptUpdate } from '../../validation'

/**
 * Update an existing Lua script
 */
export async function updateLuaScript(
  adapter: DBALAdapter,
  id: string,
  data: Partial<LuaScript>
): Promise<LuaScript> {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    throw DBALError.validationError(
      'Invalid Lua script ID',
      idErrors.map(error => ({ field: 'id', error }))
    )
  }

  const validationErrors = validateLuaScriptUpdate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError(
      'Invalid Lua script update data',
      validationErrors.map(error => ({ field: 'luaScript', error }))
    )
  }

  try {
    return adapter.update('LuaScript', id, data) as Promise<LuaScript>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Lua script name already exists')
    }
    throw error
  }
}
