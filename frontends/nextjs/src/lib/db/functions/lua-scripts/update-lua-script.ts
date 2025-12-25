import { prisma } from '../../prisma'
import type { LuaScript } from '../../../types/level-types'

/**
 * Update a Lua script by ID
 * @param scriptId - The script ID
 * @param updates - Partial script data
 */
export const updateLuaScript = async (scriptId: string, updates: Partial<LuaScript>): Promise<void> => {
  const data: any = {}
  if (updates.name !== undefined) data.name = updates.name
  if (updates.description !== undefined) data.description = updates.description
  if (updates.code !== undefined) data.code = updates.code
  if (updates.parameters !== undefined) data.parameters = JSON.stringify(updates.parameters)
  if (updates.returnType !== undefined) data.returnType = updates.returnType

  await prisma.luaScript.update({
    where: { id: scriptId },
    data,
  })
}
