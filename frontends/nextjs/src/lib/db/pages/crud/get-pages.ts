import { getAdapter } from '../dbal-client'
import type { PageConfig } from '../../types/level-types'

/**
 * Get all pages
 */
export async function getPages(): Promise<PageConfig[]> {
  const adapter = getAdapter()
  const result = await adapter.list('PageConfig')
  return (result.data as any[]).map((p) => ({
    id: p.id,
    path: p.path,
    title: p.title,
    level: p.level as any,
    componentTree: JSON.parse(p.componentTree),
    requiresAuth: p.requiresAuth,
    requiredRole: (p.requiredRole as any) || undefined,
  }))
}
