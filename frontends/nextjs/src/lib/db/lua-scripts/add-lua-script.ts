import { prisma } from '../prisma'
import type { LuaScript } from '../../level-types'

/**
 * Add a Lua script
 */
export async function addLuaScript(script: LuaScript): Promise<void> {
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
