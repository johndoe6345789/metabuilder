/**
 * Set Component Hierarchy
 * Replaces all component hierarchy in database
 */

import { prisma } from '@/lib/config/prisma'
import type { ComponentNode } from './types'

/**
 * Set the component hierarchy (replaces existing)
 * @param hierarchy - Record of component nodes by ID
 */
export const setComponentHierarchy = async (
  hierarchy: Record<string, ComponentNode>
): Promise<void> => {
  await prisma.componentNode.deleteMany()
  for (const node of Object.values(hierarchy)) {
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
}
