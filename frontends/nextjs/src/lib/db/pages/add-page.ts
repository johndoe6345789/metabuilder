import { prisma } from '../prisma'
import type { PageConfig } from '../../level-types'

/**
 * Add a page
 */
export async function addPage(page: PageConfig): Promise<void> {
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
