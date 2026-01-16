/**
 * Update Comment
 * Updates an existing comment
 */

import type { Comment } from '@/lib/types/level-types'
import { prisma } from '@/lib/config/prisma'

type CommentUpdateData = {
  content?: string
  updatedAt?: bigint
}

/**
 * Update a comment
 * @param commentId - ID of comment to update
 * @param updates - Partial comment with updates
 */
export const updateComment = async (
  commentId: string,
  updates: Partial<Comment>
): Promise<void> => {
  const data: CommentUpdateData = {}
  if (updates.content !== undefined) data.content = updates.content
  if (updates.updatedAt !== undefined && updates.updatedAt !== null) {
    data.updatedAt = BigInt(updates.updatedAt)
  }

  await (prisma as any).comment.update({
    where: { id: commentId },
    data,
  })
}
