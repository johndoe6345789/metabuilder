/**
 * Set Comments
 * Replaces all comments in database
 */

import { prisma } from '../../prisma'
import type { Comment } from '../../../types/level-types'

/**
 * Set all comments (replaces existing)
 * @param comments - Array of comments to save
 */
export const setComments = async (comments: Comment[]): Promise<void> => {
  await prisma.comment.deleteMany()
  for (const comment of comments) {
    await prisma.comment.create({
      data: {
        id: comment.id,
        userId: comment.userId,
        content: comment.content,
        createdAt: BigInt(comment.createdAt),
        updatedAt: comment.updatedAt ? BigInt(comment.updatedAt) : null,
        parentId: comment.parentId,
      },
    })
  }
}
