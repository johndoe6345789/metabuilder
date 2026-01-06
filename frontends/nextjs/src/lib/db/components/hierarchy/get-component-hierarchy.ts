import { getAdapter } from '../../core/dbal-client'
import type { ComponentNode } from '../types'

type DBALComponentNodeRecord = {
  id: string
  type: string
  parentId?: string | null
  childIds: string
  order: number
  pageId: string
}

export async function getComponentHierarchy(): Promise<Record<string, ComponentNode>> {
  const adapter = getAdapter()
  const result = (await adapter.list('ComponentNode')) as { data: DBALComponentNodeRecord[] }
  const hierarchy: Record<string, ComponentNode> = {}
  for (const node of result.data) {
    hierarchy[node.id] = {
      id: node.id,
      type: node.type,
      parentId: node.parentId !== null && node.parentId !== undefined ? node.parentId : undefined,
      childIds: JSON.parse(node.childIds),
      order: node.order,
      pageId: node.pageId,
    }
  }
  return hierarchy
}
