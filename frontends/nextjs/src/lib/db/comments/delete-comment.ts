import { getAdapter } from '../dbal-client'

/**
 * Delete a comment by ID
 */
export async function deleteComment(commentId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('Comment', commentId)
}
