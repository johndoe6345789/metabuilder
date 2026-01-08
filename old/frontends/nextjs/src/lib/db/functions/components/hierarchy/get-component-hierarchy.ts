/**
 * Get Component Hierarchy
 * Retrieves component hierarchy from database
 */

import { prisma } from '@/lib/config/prisma'
import type { ComponentNode } from './types'

/**
 * Get the component hierarchy
 * @returns Record of component nodes by ID
 */
export const getComponentHierarchy = async (): Promise<Record<string, ComponentNode>> => {
  const nodes = await prisma.componentNode.findMany()
  const result: Record<string, ComponentNode> = {}
  for (const node of nodes) {
    result[node.id] = {
      id: node.id,
      type: node.type,
      parentId: node.parentId !== null && node.parentId !== '' ? node.parentId : undefined,
      childIds: JSON.parse(node.childIds) as string[],
      order: node.order,
      pageId: node.pageId,
    }
  }
  return result
}
