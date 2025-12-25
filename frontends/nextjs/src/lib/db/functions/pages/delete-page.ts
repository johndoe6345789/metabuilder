import { prisma } from '../../prisma'

/**
 * Delete a page config by ID
 * @param pageId - The page ID
 */
export const deletePage = async (pageId: string): Promise<void> => {
  await prisma.pageConfig.delete({ where: { id: pageId } })
}
