import { prisma } from '../prisma'
import type { ComponentNode } from '../types'

export async function setComponentHierarchy(hierarchy: Record<string, ComponentNode>): Promise<void> {
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
