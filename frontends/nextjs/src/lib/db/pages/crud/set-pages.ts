import { getAdapter } from '../../core/dbal-client'
import type { PageConfig } from '@/lib/types/level-types'

/**
 * Set all pages (replaces existing)
 */
export async function setPages(pages: PageConfig[]): Promise<void> {
  const adapter = getAdapter()

  // Delete existing pages
  const existing = await adapter.list('PageConfig')
  for (const p of existing.data as Array<{ id: string | number }>) {
    await adapter.delete('PageConfig', p.id)
  }

  // Create new pages
  for (const page of pages) {
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
}
