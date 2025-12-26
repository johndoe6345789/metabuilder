import { getAdapter } from '../dbal-client'
import type { ComponentNode } from '../types'

export async function addComponentNode(node: ComponentNode): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('ComponentNode', {
    id: node.id,
    type: node.type,
    parentId: node.parentId,
    childIds: JSON.stringify(node.childIds),
    order: node.order,
    pageId: node.pageId,
  })
}
