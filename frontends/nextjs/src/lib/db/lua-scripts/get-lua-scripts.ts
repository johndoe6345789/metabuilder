import { prisma } from '../prisma'
import type { LuaScript } from '../../level-types'

/**
 * Get all Lua scripts
 */
export async function getLuaScripts(): Promise<LuaScript[]> {
  const scripts = await prisma.luaScript.findMany()
  return scripts.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description || undefined,
    code: s.code,
    parameters: JSON.parse(s.parameters),
    returnType: s.returnType || undefined,
  }))
}
