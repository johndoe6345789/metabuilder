import { prisma } from '../prisma'
import type { LuaScript } from '../../level-types'

/**
 * Set all Lua scripts (replaces existing)
 */
export async function setLuaScripts(scripts: LuaScript[]): Promise<void> {
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
