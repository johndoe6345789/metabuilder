/**
 * Update Component Node
 * Updates an existing component node
 */

import { prisma } from '../../prisma'
import type { ComponentNode } from './types'

/**
 * Update a component node
 * @param nodeId - ID of node to update
 * @param updates - Partial node with updates
 */
export const updateComponentNode = async (nodeId: string, updates: Partial<ComponentNode>): Promise<void> => {
  const data: any = {}
  if (updates.type !== undefined) data.type = updates.type
  if (updates.parentId !== undefined) data.parentId = updates.parentId
  if (updates.childIds !== undefined) data.childIds = JSON.stringify(updates.childIds)
  if (updates.order !== undefined) data.order = updates.order
  if (updates.pageId !== undefined) data.pageId = updates.pageId

  await prisma.componentNode.update({
    where: { id: nodeId },
    data,
  })
}
