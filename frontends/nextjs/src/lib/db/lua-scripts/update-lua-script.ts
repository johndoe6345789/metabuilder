import { prisma } from '../prisma'
import type { LuaScript } from '../../level-types'

/**
 * Update a Lua script by ID
 */
export async function updateLuaScript(scriptId: string, updates: Partial<LuaScript>): Promise<void> {
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
