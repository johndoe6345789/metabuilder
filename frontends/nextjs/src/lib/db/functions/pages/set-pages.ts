import { prisma } from '../../prisma'
import type { PageConfig } from '../../../types/level-types'

/**
 * Set all page configs (replaces existing)
 * @param pages - Array of page configs
 */
export const setPages = async (pages: PageConfig[]): Promise<void> => {
  await prisma.pageConfig.deleteMany()
  for (const page of pages) {
    await prisma.pageConfig.create({
      data: {
        id: page.id,
        path: page.path,
        title: page.title,
        level: page.level,
        componentTree: JSON.stringify(page.componentTree),
        requiresAuth: page.requiresAuth,
        requiredRole: page.requiredRole,
      },
    })
  }
}
