import type { JsonValue } from '@/types/utility-types'

import { getAdapter } from '../../core/dbal-client'
import type { Tenant } from '@/lib/types/level-types'

/**
 * Get all tenants from database
 */
export async function getTenants(): Promise<Tenant[]> {
  const adapter = getAdapter()
  const result = await adapter.list('Tenant')
  const rows = result.data as Array<{
    id: string
    name: string
    slug: string
    ownerId: string
    createdAt: number | string | bigint
    homepageConfig?: JsonValue | string | null
  }>
  return rows.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    ownerId: t.ownerId,
    createdAt: Number(t.createdAt),
    homepageConfig: t.homepageConfig !== null && t.homepageConfig !== undefined
      ? typeof t.homepageConfig === 'string'
        ? t.homepageConfig
        : JSON.stringify(t.homepageConfig)
      : undefined,
  }))
}
