import { getAdapter } from '../../core/dbal-client'
import type { Comment } from '@/lib/types/level-types'

type DBALCommentRecord = {
  id: string
  userId: string
  entityType: string
  entityId: string
  content: string
  createdAt: number | string | Date
  updatedAt?: number | string | Date | null
  parentId?: string | null
  tenantId?: string | null
}

export interface GetCommentsOptions {
  /** Filter by tenant ID for multi-tenancy */
  tenantId?: string
}

/**
 * Get all comments from database, optionally filtered by tenant
 */
export async function getComments(options?: GetCommentsOptions): Promise<Comment[]> {
  const adapter = getAdapter()
  const listOptions = options?.tenantId !== undefined
    ? { filter: { tenantId: options.tenantId } }
    : undefined
  const result = listOptions !== undefined
    ? (await adapter.list('Comment', listOptions)) as { data: DBALCommentRecord[] }
    : (await adapter.list('Comment')) as { data: DBALCommentRecord[] }
  return result.data.map(c => ({
    id: c.id,
    userId: c.userId,
    entityType: c.entityType,
    entityId: c.entityId,
    content: c.content,
    createdAt: Number(c.createdAt),
    updatedAt: (c.updatedAt !== null && c.updatedAt !== undefined) ? Number(c.updatedAt) : undefined,
    parentId: (c.parentId !== null && c.parentId !== undefined && c.parentId !== '') ? c.parentId : undefined,
  }))
}
