import { prisma } from '../prisma'
import type { PageConfig } from '../../level-types'

/**
 * Get all pages
 */
export async function getPages(): Promise<PageConfig[]> {
  const pages = await prisma.pageConfig.findMany()
  return pages.map((p) => ({
    id: p.id,
    path: p.path,
    title: p.title,
    level: p.level as any,
    componentTree: JSON.parse(p.componentTree),
    requiresAuth: p.requiresAuth,
    requiredRole: (p.requiredRole as any) || undefined,
  }))
}
