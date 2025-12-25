import { prisma } from '../../prisma'
import type { PageConfig } from '../../../types/level-types'

/**
 * Update a page config by ID
 * @param pageId - The page ID
 * @param updates - Partial page data
 */
export const updatePage = async (pageId: string, updates: Partial<PageConfig>): Promise<void> => {
  const data: any = {}
  if (updates.path !== undefined) data.path = updates.path
  if (updates.title !== undefined) data.title = updates.title
  if (updates.level !== undefined) data.level = updates.level
  if (updates.componentTree !== undefined) data.componentTree = JSON.stringify(updates.componentTree)
  if (updates.requiresAuth !== undefined) data.requiresAuth = updates.requiresAuth
  if (updates.requiredRole !== undefined) data.requiredRole = updates.requiredRole

  await prisma.pageConfig.update({
    where: { id: pageId },
    data,
  })
}
