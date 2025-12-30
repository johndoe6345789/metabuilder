/**
 * @file lua-script-operations.ts
 * @description LuaScript entity CRUD operations for DBAL client
 * 
 * Single-responsibility module following the small-function-file pattern.
 */

import type { DBALAdapter } from '../../adapters/adapter'
import type { LuaScript, ListOptions, ListResult } from '../types'
import { createLuaScript, deleteLuaScript, getLuaScript, listLuaScripts, updateLuaScript } from '../../lua-script'

export interface LuaScriptOperations {
  create: (data: Omit<LuaScript, 'id' | 'createdAt' | 'updatedAt'>) => Promise<LuaScript>
  read: (id: string) => Promise<LuaScript | null>
  update: (id: string, data: Partial<LuaScript>) => Promise<LuaScript>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<LuaScript>>
}

/**
 * Create Lua script operations object for the DBAL client
 */
export const createLuaScriptOperations = (adapter: DBALAdapter): LuaScriptOperations => ({
  /**
   * Create a new Lua script
   */
  create: (data) => createLuaScript(adapter, data),

  /**
   * Read a Lua script by ID
   */
  read: (id) => getLuaScript(adapter, id),

  /**
   * Update an existing Lua script
   */
  update: (id, data) => updateLuaScript(adapter, id, data),

  /**
   * Delete a Lua script by ID
   */
  delete: (id) => deleteLuaScript(adapter, id),

  /**
   * List Lua scripts with filtering and pagination
   */
  list: (options) => listLuaScripts(adapter, options),
})
