import { prisma } from '../../prisma'

/**
 * Delete a Lua script by ID
 * @param scriptId - The script ID
 */
export const deleteLuaScript = async (scriptId: string): Promise<void> => {
  await prisma.luaScript.delete({ where: { id: scriptId } })
}
