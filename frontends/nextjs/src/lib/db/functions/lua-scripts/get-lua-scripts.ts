import { prisma } from '../../prisma'
import type { LuaScript } from '../../../types/level-types'

/**
 * Get all Lua scripts
 * @returns Array of Lua scripts
 */
export const getLuaScripts = async (): Promise<LuaScript[]> => {
  const scripts = await prisma.luaScript.findMany()
  return scripts.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || undefined,
    code: s.code,
    parameters: JSON.parse(s.parameters),
    returnType: s.returnType || undefined,
  }))
}
