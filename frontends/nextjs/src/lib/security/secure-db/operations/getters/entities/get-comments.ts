import { getComments as fetchComments } from '@/lib/db/comments'
import type { Comment } from '@/lib/types/level-types'
import type { SecurityContext } from '../types'
import { executeQuery } from '../../execute-query'

/**
 * Get comments with security checks
 */
export async function getComments(ctx: SecurityContext): Promise<Comment[]> {
  return executeQuery(ctx, 'comment', 'READ', async () => fetchComments(), 'all_comments')
}
