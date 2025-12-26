import { getAdapter } from '../../../../core/dbal-client'
import type { ComponentNode } from '../types'

export async function updateComponentNode(nodeId: string, updates: Partial<ComponentNode>): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, unknown> = {}
  if (updates.type !== undefined) data.type = updates.type
  if (updates.parentId !== undefined) data.parentId = updates.parentId
  if (updates.childIds !== undefined) data.childIds = JSON.stringify(updates.childIds)
  if (updates.order !== undefined) data.order = updates.order
  if (updates.pageId !== undefined) data.pageId = updates.pageId
  await adapter.update('ComponentNode', nodeId, data)
}
