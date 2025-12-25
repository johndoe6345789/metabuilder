import { prisma } from '../../prisma'
import type { PageConfig } from '../../../types/level-types'

/**
 * Get all page configs
 * @returns Array of page configs
 */
export const getPages = async (): Promise<PageConfig[]> => {
  const pages = await prisma.pageConfig.findMany()
  return pages.map(p => ({
    id: p.id,
    path: p.path,
    title: p.title,
    level: p.level as any,
    componentTree: JSON.parse(p.componentTree),
    requiresAuth: p.requiresAuth,
    requiredRole: (p.requiredRole as any) || undefined,
  }))
}
