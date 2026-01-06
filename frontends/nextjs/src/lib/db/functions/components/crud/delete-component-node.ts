/**
 * Delete Component Node
 * Deletes a component node from hierarchy
 */

import { prisma } from '@/lib/config/prisma'

/**
 * Delete a component node
 * @param nodeId - ID of node to delete
 */
export const deleteComponentNode = async (nodeId: string): Promise<void> => {
  await prisma.componentNode.delete({ where: { id: nodeId } })
}
