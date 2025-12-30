/**
 * @file list-lua-scripts.ts
 * @description List Lua scripts with filtering and pagination
 */
import type { ListOptions, LuaScript, Result } from '../../types'
import type { InMemoryStore } from '../../store/in-memory-store'

/**
 * List Lua scripts with filtering and pagination
 */
export const listLuaScripts = async (
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<LuaScript[]>> => {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options

  let scripts = Array.from(store.luaScripts.values())

  if (filter.createdBy !== undefined) {
    scripts = scripts.filter((s) => s.createdBy === filter.createdBy)
  }

  if (filter.isSandboxed !== undefined) {
    scripts = scripts.filter((s) => s.isSandboxed === filter.isSandboxed)
  }

  if (sort.name) {
    scripts.sort((a, b) =>
      sort.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    )
  } else if (sort.createdAt) {
    scripts.sort((a, b) =>
      sort.createdAt === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  const start = (page - 1) * limit
  const paginated = scripts.slice(start, start + limit)

  return { success: true, data: paginated }
}
