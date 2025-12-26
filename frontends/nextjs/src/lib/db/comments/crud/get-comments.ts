import { getAdapter } from '../../core/dbal-client'
import type { Comment } from '../../types/level-types'

/**
 * Get all comments from database
 */
export async function getComments(): Promise<Comment[]> {
  const adapter = getAdapter()
  const result = await adapter.list('Comment')
  return (result.data as any[]).map((c) => ({
    id: c.id,
    userId: c.userId,
    content: c.content,
    createdAt: Number(c.createdAt),
    updatedAt: c.updatedAt ? Number(c.updatedAt) : undefined,
    parentId: c.parentId || undefined,
  }))
}
