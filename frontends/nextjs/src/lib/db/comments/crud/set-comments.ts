import { getAdapter } from '../../core/dbal-client'
import type { Comment } from '../../types/level-types'

/**
 * Set all comments (replaces existing)
 */
export async function setComments(comments: Comment[]): Promise<void> {
  const adapter = getAdapter()
  
  // Delete existing comments
  const existing = await adapter.list('Comment')
  for (const c of existing.data as any[]) {
    await adapter.delete('Comment', c.id)
  }
  
  // Create new comments
  for (const comment of comments) {
    await adapter.create('Comment', {
      id: comment.id,
      userId: comment.userId,
      content: comment.content,
      createdAt: BigInt(comment.createdAt),
      updatedAt: comment.updatedAt ? BigInt(comment.updatedAt) : null,
      parentId: comment.parentId,
    })
  }
}
