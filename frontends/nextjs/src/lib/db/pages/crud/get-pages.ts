import { getAdapter } from '../../core/dbal-client'
import type { PageConfig, UserRole } from '@/lib/level-types'

type DBALPageRecord = {
  id: string
  path: string
  title: string
  level: number | string
  componentTree: string
  requiresAuth: boolean
  requiredRole?: string | null
}

const USER_ROLES = new Set<UserRole>([
  'public',
  'user',
  'moderator',
  'admin',
  'god',
  'supergod',
])

function toUserRole(role: string): UserRole {
  return USER_ROLES.has(role as UserRole) ? (role as UserRole) : 'user'
}

/**
 * Get all pages
 */
export async function getPages(): Promise<PageConfig[]> {
  const adapter = getAdapter()
  const result = (await adapter.list('PageConfig')) as { data: DBALPageRecord[] }
  return result.data.map(p => ({
    id: p.id,
    path: p.path,
    title: p.title,
    level: Number(p.level) as PageConfig['level'],
    componentTree: JSON.parse(p.componentTree) as PageConfig['componentTree'],
    requiresAuth: p.requiresAuth,
    requiredRole: p.requiredRole ? toUserRole(p.requiredRole) : undefined,
    sortOrder: Number((p as any).sortOrder || 0),
    isPublished: Boolean((p as any).isPublished !== false),
  }))
}
