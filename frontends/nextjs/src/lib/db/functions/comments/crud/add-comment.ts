/**
 * Add Comment
 * Adds a new comment to database
 */

import type { Comment } from '../../../types/level-types'
import { prisma } from '../prisma'

/**
 * Add a new comment
 * @param comment - Comment to add
 */
export const addComment = async (comment: Comment): Promise<void> => {
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
