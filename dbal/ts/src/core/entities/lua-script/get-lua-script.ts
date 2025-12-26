/**
 * @file get-lua-script.ts
 * @description Get Lua script operation
 */
import type { DBALAdapter } from '../../../adapters/adapter'
import type { LuaScript } from '../../types'
import { DBALError } from '../../errors'
import { validateId } from '../../validation'

/**
 * Get a Lua script by ID
 */
export async function getLuaScript(adapter: DBALAdapter, id: string): Promise<LuaScript> {
  const validationErrors = validateId(id)
  if (validationErrors.length > 0) {
    throw DBALError.validationError(
      'Invalid Lua script ID',
      validationErrors.map(error => ({ field: 'id', error }))
    )
  }

  const result = await adapter.read('LuaScript', id) as LuaScript | null
  if (!result) {
    throw DBALError.notFound(`Lua script not found: ${id}`)
  }
  return result
}
