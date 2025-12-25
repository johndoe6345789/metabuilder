import { prisma } from '../../prisma'
import type { PageConfig } from '../../../types/level-types'

/**
 * Add a single page config
 * @param page - The page to add
 */
export const addPage = async (page: PageConfig): Promise<void> => {
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
