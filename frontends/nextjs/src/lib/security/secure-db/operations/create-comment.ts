import { addComment } from '@/lib/db/comments'
import type { Comment } from '@/lib/types/level-types'
import type { SecurityContext } from '../types'
import { executeQuery } from '../execute-query'
import { sanitizeInput } from '../sanitize-input'

/**
 * Create a comment with security checks
 */
export async function createComment(
  ctx: SecurityContext,
  commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Comment> {
  const sanitized = sanitizeInput(commentData)
  const newComment: Comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: sanitized.userId,
    content: sanitized.content,
    createdAt: Date.now(),
    parentId: sanitized.parentId,
  }

  return executeQuery(
    ctx,
    'comment',
    'CREATE',
    async () => {
      await addComment(newComment)
      return newComment
    },
    newComment.id
  )
}
