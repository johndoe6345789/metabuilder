import { getAdapter } from '../../core/dbal-client'
import type { PageConfig } from '../../types/level-types'

/**
 * Add a page
 */
export async function addPage(page: PageConfig): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('PageConfig', {
    id: page.id,
    path: page.path,
    title: page.title,
    level: page.level,
    componentTree: JSON.stringify(page.componentTree),
    requiresAuth: page.requiresAuth,
    requiredRole: page.requiredRole,
  })
}
