import { getAdapter } from '../../core/dbal-client'
import type { PageConfig } from '../../types/level-types'

/**
 * Update a page by ID
 */
export async function updatePage(pageId: string, updates: Partial<PageConfig>): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, unknown> = {}
  if (updates.path !== undefined) data.path = updates.path
  if (updates.title !== undefined) data.title = updates.title
  if (updates.level !== undefined) data.level = updates.level
  if (updates.componentTree !== undefined)
    data.componentTree = JSON.stringify(updates.componentTree)
  if (updates.requiresAuth !== undefined) data.requiresAuth = updates.requiresAuth
  if (updates.requiredRole !== undefined) data.requiredRole = updates.requiredRole

  await adapter.update('PageConfig', pageId, data)
}
