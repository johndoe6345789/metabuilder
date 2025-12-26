/**
 * @file lua-script-operations.ts
 * @description LuaScript entity CRUD operations for DBAL client
 * 
 * Single-responsibility module following the small-function-file pattern.
 */

import type { DBALAdapter } from '../../adapters/adapter'
import type { LuaScript, ListOptions, ListResult } from '../types'
import { DBALError } from '../errors'
import { validateLuaScriptCreate, validateLuaScriptUpdate, validateId } from '../validation'

/**
 * Create Lua script operations object for the DBAL client
 */
export const createLuaScriptOperations = (adapter: DBALAdapter) => ({
  /**
   * Create a new Lua script
   */
  create: async (data: Omit<LuaScript, 'id' | 'createdAt' | 'updatedAt'>): Promise<LuaScript> => {
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
  },

  /**
   * Read a Lua script by ID
   */
  read: async (id: string): Promise<LuaScript | null> => {
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
  },

  /**
   * Update an existing Lua script
   */
  update: async (id: string, data: Partial<LuaScript>): Promise<LuaScript> => {
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
  },

  /**
   * Delete a Lua script by ID
   */
  delete: async (id: string): Promise<boolean> => {
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
  },

  /**
   * List Lua scripts with filtering and pagination
   */
  list: async (options?: ListOptions): Promise<ListResult<LuaScript>> => {
    return adapter.list('LuaScript', options) as Promise<ListResult<LuaScript>>
  },
})
