import { getAdapter } from '../../core/dbal-client'
import type { Comment } from '@/lib/types/level-types'

type DBALCommentRecord = {
  id: string
  userId: string
  content: string
  createdAt: number | string | Date
  updatedAt?: number | string | Date | null
  parentId?: string | null
}

/**
 * Get all comments from database
 */
export async function getComments(): Promise<Comment[]> {
  const adapter = getAdapter()
  const result = (await adapter.list('Comment')) as { data: DBALCommentRecord[] }
  return result.data.map(c => ({
    id: c.id,
    userId: c.userId,
    content: c.content,
    createdAt: Number(c.createdAt),
    updatedAt: c.updatedAt ? Number(c.updatedAt) : undefined,
    parentId: c.parentId || undefined,
  }))
}
