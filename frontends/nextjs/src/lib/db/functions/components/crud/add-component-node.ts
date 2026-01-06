/**
 * Add Component Node
 * Adds a new component node to hierarchy
 */

import { prisma } from '@/lib/config/prisma'
import type { ComponentNode } from '../hierarchy/types'

/**
 * Add a component node
 * @param node - Component node to add
 */
export const addComponentNode = async (node: ComponentNode): Promise<void> => {
  await prisma.componentNode.create({
    data: {
      id: node.id,
      type: node.type,
      parentId: node.parentId,
      childIds: JSON.stringify(node.childIds),
      order: node.order,
      pageId: node.pageId,
    },
  })
}
