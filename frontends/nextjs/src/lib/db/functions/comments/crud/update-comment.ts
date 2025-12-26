/**
 * Update Comment
 * Updates an existing comment
 */

import { prisma } from '../../prisma'
import type { Comment } from '../../../types/level-types'

/**
 * Update a comment
 * @param commentId - ID of comment to update
 * @param updates - Partial comment with updates
 */
export const updateComment = async (commentId: string, updates: Partial<Comment>): Promise<void> => {
  const data: any = {}
  if (updates.content !== undefined) data.content = updates.content
  if (updates.updatedAt !== undefined) data.updatedAt = BigInt(updates.updatedAt)

  await prisma.comment.update({
    where: { id: commentId },
    data,
  })
}
