import { getAdapter } from '../../core/dbal-client'
import type { Comment } from '@/lib/types/level-types'

/**
 * Add a single comment
 */
export async function addComment(comment: Comment): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('Comment', {
    id: comment.id,
    userId: comment.userId,
    content: comment.content,
    createdAt: BigInt(comment.createdAt),
    updatedAt: comment.updatedAt !== null && comment.updatedAt !== undefined ? BigInt(comment.updatedAt) : null,
    parentId: comment.parentId ?? null,
  })
}
