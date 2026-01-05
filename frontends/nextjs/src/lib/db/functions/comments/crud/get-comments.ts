/**
 * Get Comments
 * Retrieves all comments from database
 */

import type { Comment } from '@/lib/types/level-types'
import { prisma } from '../../prisma'

/**
 * Get all comments
 * @returns Array of comments
 */
export const getComments = async (): Promise<Comment[]> => {
  const comments = await prisma.comment.findMany()
  return comments.map(c => ({
    id: c.id,
    userId: c.userId,
    content: c.content,
    createdAt: Number(c.createdAt),
    updatedAt: c.updatedAt ? Number(c.updatedAt) : undefined,
    parentId: c.parentId || undefined,
  }))
}
