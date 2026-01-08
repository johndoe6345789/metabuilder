/**
 * Set Comments
 * Replaces all comments in database
 */

import type { Comment } from '@/lib/types/level-types'
import { prisma } from '@/lib/config/prisma'

/**
 * Set all comments (replaces existing)
 * @param comments - Array of comments to save
 */
export const setComments = async (comments: Comment[]): Promise<void> => {
  await (prisma as any).comment.deleteMany()
  for (const comment of comments) {
    await (prisma as any).comment.create({
      data: {
        id: comment.id,
        userId: comment.userId,
        content: comment.content,
        createdAt: BigInt(comment.createdAt),
        updatedAt: comment.updatedAt !== null && comment.updatedAt !== undefined ? BigInt(comment.updatedAt) : null,
        parentId: comment.parentId,
      },
    })
  }
}
