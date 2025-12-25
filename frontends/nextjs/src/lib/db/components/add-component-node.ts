import { prisma } from '../prisma'
import type { ComponentNode } from '../types'

export async function addComponentNode(node: ComponentNode): Promise<void> {
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
