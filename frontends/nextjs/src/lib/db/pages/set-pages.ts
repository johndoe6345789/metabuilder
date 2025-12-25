import { prisma } from '../prisma'
import type { PageConfig } from '../../level-types'

/**
 * Set all pages (replaces existing)
 */
export async function setPages(pages: PageConfig[]): Promise<void> {
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
