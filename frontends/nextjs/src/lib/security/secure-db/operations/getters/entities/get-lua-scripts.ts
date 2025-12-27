import { getLuaScripts as fetchLuaScripts } from '@/lib/db/lua-scripts'
import type { LuaScript } from '@/lib/types/level-types'
import type { SecurityContext } from '../types'
import { executeQuery } from '../../execute-query'

/**
 * Get Lua scripts with security checks
 */
export async function getLuaScripts(ctx: SecurityContext): Promise<LuaScript[]> {
  return executeQuery(
    ctx,
    'luaScript',
    'READ',
    async () => fetchLuaScripts(),
    'all_lua_scripts'
  )
}
