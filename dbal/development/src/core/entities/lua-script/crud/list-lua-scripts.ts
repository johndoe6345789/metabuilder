/**
 * @file list-lua-scripts.ts
 * @description List Lua scripts with filtering and pagination
 */
import type { ListOptions, LuaScript, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'

/**
 * List Lua scripts with filtering and pagination
 */
export const listLuaScripts = async (
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<LuaScript[]>> => {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options

  let scripts = Array.from(store.luaScripts.values())

  if (filter && Object.keys(filter).length > 0) {
    scripts = scripts.filter((script) =>
      Object.entries(filter).every(([key, value]) => (script as Record<string, unknown>)[key] === value)
    )
  }

  const sortKey = Object.keys(sort)[0]
  if (sortKey) {
    const direction = sort[sortKey]
    scripts.sort((a, b) => {
      const left = (a as Record<string, unknown>)[sortKey]
      const right = (b as Record<string, unknown>)[sortKey]
      if (typeof left === 'string' && typeof right === 'string') {
        return direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left)
      }
      if (typeof left === 'bigint' && typeof right === 'bigint') {
        return direction === 'asc' ? Number(left - right) : Number(right - left)
      }
      if (typeof left === 'number' && typeof right === 'number') {
        return direction === 'asc' ? left - right : right - left
      }
      if (typeof left === 'boolean' && typeof right === 'boolean') {
        return direction === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
      }
      return 0
    })
  }

  const start = (page - 1) * limit
  const paginated = scripts.slice(start, start + limit)

  return { success: true, data: paginated }
}
