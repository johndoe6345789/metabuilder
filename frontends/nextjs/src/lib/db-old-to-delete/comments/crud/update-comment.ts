import { getAdapter } from '../../core/dbal-client'
import type { Comment } from '@/lib/types/level-types'

/**
 * Update a comment by ID
 */
export async function updateComment(commentId: string, updates: Partial<Comment>): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, unknown> = {}
  if (updates.content !== undefined) data.content = updates.content
  if (updates.updatedAt !== undefined && updates.updatedAt !== null) {
    data.updatedAt = BigInt(updates.updatedAt)
  }
  await adapter.update('Comment', commentId, data)
}
