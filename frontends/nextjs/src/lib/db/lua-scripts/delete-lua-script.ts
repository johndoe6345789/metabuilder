import { prisma } from '../prisma'

/**
 * Delete a Lua script by ID
 */
export async function deleteLuaScript(scriptId: string): Promise<void> {
  await prisma.luaScript.delete({ where: { id: scriptId } })
}
