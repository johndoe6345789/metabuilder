import { getAdapter } from '../../core/dbal-client'
import type { Comment } from '../../types/level-types'

type DBALCommentRecord = {
  id: string
}

/**
 * Set all comments (replaces existing)
 */
export async function setComments(comments: Comment[]): Promise<void> {
  const adapter = getAdapter()

  // Delete existing comments
  const existing = (await adapter.list('Comment')) as { data: DBALCommentRecord[] }
  for (const c of existing.data) {
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
