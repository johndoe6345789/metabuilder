import { prisma } from '../prisma'

/**
 * Delete a page by ID
 */
export async function deletePage(pageId: string): Promise<void> {
  await prisma.pageConfig.delete({ where: { id: pageId } })
}
