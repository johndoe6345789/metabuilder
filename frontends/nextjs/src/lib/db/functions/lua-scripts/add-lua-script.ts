import { prisma } from '../../prisma'
import type { LuaScript } from '../../../types/level-types'

/**
 * Add a single Lua script
 * @param script - The script to add
 */
export const addLuaScript = async (script: LuaScript): Promise<void> => {
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
