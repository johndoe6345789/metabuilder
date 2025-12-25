import { prisma } from '../prisma'
import type { ComponentNode } from '../types'

export async function getComponentHierarchy(): Promise<Record<string, ComponentNode>> {
  const nodes = await prisma.componentNode.findMany()
  const result: Record<string, ComponentNode> = {}
  for (const node of nodes) {
    result[node.id] = {
      id: node.id,
      type: node.type,
      parentId: node.parentId || undefined,
      childIds: JSON.parse(node.childIds),
      order: node.order,
      pageId: node.pageId,
    }
  }
  return result
}
