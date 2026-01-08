import { getAdapter } from '../../core/dbal-client'
import type { PageConfig, UserRole } from '@/lib/types/level-types'

type DBALPageRecord = {
  id: string
  path: string
  title: string
  level: number | string
  componentTree: string
  requiresAuth: boolean
  requiredRole?: string | null
  tenantId?: string | null
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

export interface GetPagesOptions {
  /** Filter by tenant ID for multi-tenancy */
  tenantId?: string
}

/**
 * Get all pages, optionally filtered by tenant
 */
export async function getPages(options?: GetPagesOptions): Promise<PageConfig[]> {
  const adapter = getAdapter()
  const listOptions = options?.tenantId !== undefined
    ? { filter: { tenantId: options.tenantId } }
    : undefined
  const result = listOptions !== undefined
    ? (await adapter.list('PageConfig', listOptions)) as { data: DBALPageRecord[] }
    : (await adapter.list('PageConfig')) as { data: DBALPageRecord[] }
  return result.data.map(p => ({
    id: p.id,
    path: p.path,
    title: p.title,
    level: Number(p.level) as PageConfig['level'],
    componentTree: JSON.parse(p.componentTree) as PageConfig['componentTree'],
    requiresAuth: p.requiresAuth,
    requiredRole: p.requiredRole !== null && p.requiredRole !== undefined ? toUserRole(p.requiredRole) : undefined,
  }))
}
