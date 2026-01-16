/**
 * Get Comments
 * Retrieves all comments from database
 */

import type { Comment } from '@/lib/types/level-types'
import { prisma } from '@/lib/config/prisma'

/**
 * Get all comments
 * @returns Array of comments
 */
export const getComments = async (): Promise<Comment[]> => {
  const comments = await (prisma as any).comment.findMany()
  return comments.map((c: Record<string, unknown>) => ({
    id: c.id,
    userId: c.userId,
    entityType: c.entityType,
    entityId: c.entityId,
    content: c.content,
    createdAt: Number(c.createdAt),
    updatedAt: c.updatedAt !== null && c.updatedAt !== undefined ? Number(c.updatedAt) : undefined,
    parentId: c.parentId !== null && c.parentId !== '' ? c.parentId : undefined,
  }))
}
