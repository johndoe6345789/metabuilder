import { getAdapter } from '../../dbal-client'
import type { ComponentNode } from '../types'

export async function getComponentHierarchy(): Promise<Record<string, ComponentNode>> {
  const adapter = getAdapter()
  const result = await adapter.list('ComponentNode')
  const hierarchy: Record<string, ComponentNode> = {}
  for (const node of result.data as any[]) {
    hierarchy[node.id] = {
      id: node.id,
      type: node.type,
      parentId: node.parentId || undefined,
      childIds: JSON.parse(node.childIds),
      order: node.order,
      pageId: node.pageId,
    }
  }
  return hierarchy
}
