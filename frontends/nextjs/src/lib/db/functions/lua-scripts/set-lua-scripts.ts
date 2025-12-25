import { prisma } from '../../prisma'
import type { LuaScript } from '../../../types/level-types'

/**
 * Set all Lua scripts (replaces existing)
 * @param scripts - Array of Lua scripts
 */
export const setLuaScripts = async (scripts: LuaScript[]): Promise<void> => {
  await prisma.luaScript.deleteMany()
  for (const script of scripts) {
    await prisma.luaScript.create({
      data: {
        id: script.id,
        name: script.name,
        description: script.description,
        code: script.code,
        parameters: JSON.stringify(script.parameters),
        returnType: script.returnType,
      },
    })
  }
}
