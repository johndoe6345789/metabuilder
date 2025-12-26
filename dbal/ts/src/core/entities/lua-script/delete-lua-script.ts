/**
 * @file delete-lua-script.ts
 * @description Delete Lua script operation
 */
import type { DBALAdapter } from '../../../adapters/adapter'
import { DBALError } from '../../errors'
import { validateId } from '../../validation'

/**
 * Delete a Lua script by ID
 */
export async function deleteLuaScript(adapter: DBALAdapter, id: string): Promise<boolean> {
  const validationErrors = validateId(id)
  if (validationErrors.length > 0) {
    throw DBALError.validationError(
      'Invalid Lua script ID',
      validationErrors.map(error => ({ field: 'id', error }))
    )
  }

  const result = await adapter.delete('LuaScript', id)
  if (!result) {
    throw DBALError.notFound(`Lua script not found: ${id}`)
  }
  return result
}
