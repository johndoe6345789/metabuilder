import { getAdapter } from '../../core/dbal-client'
import type { ComponentNode } from '../types'

type DBALComponentNodeRecord = {
  id: string
}

export async function setComponentHierarchy(
  hierarchy: Record<string, ComponentNode>
): Promise<void> {
  const adapter = getAdapter()

  // Delete existing hierarchy
  const existing = (await adapter.list('ComponentNode')) as { data: DBALComponentNodeRecord[] }
  for (const n of existing.data) {
    await adapter.delete('ComponentNode', n.id)
  }

  // Create new hierarchy
  for (const node of Object.values(hierarchy)) {
    await adapter.create('ComponentNode', {
      id: node.id,
      type: node.type,
      parentId: node.parentId,
      childIds: JSON.stringify(node.childIds),
      order: node.order,
      pageId: node.pageId,
    })
  }
}
