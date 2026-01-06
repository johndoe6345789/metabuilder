/**
 * Delete Comment
 * Deletes a comment from database
 */

import { prisma } from '@/lib/config/prisma'

/**
 * Delete a comment
 * @param commentId - ID of comment to delete
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  await prisma.comment.delete({ where: { id: commentId } })
}
