/**
 * @file list-lua-scripts.ts
 * @description List Lua scripts with filtering and pagination
 */
import type { DBALAdapter } from '../../../adapters/adapter'
import type { LuaScript, ListOptions, ListResult } from '../../types'

/**
 * List Lua scripts with filtering and pagination
 */
export async function listLuaScripts(
  adapter: DBALAdapter,
  options?: ListOptions
): Promise<ListResult<LuaScript>> {
  return adapter.list('LuaScript', options) as Promise<ListResult<LuaScript>>
}
