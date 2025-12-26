import { getAdapter } from '../dbal-client'
import type { Tenant } from '../../types/level-types'

/**
 * Get all tenants from database
 */
export async function getTenants(): Promise<Tenant[]> {
  const adapter = getAdapter()
  const result = await adapter.list('Tenant')
  return (result.data as any[]).map((t) => ({
    id: t.id,
    name: t.name,
    ownerId: t.ownerId,
    createdAt: Number(t.createdAt),
    homepageConfig: t.homepageConfig
      ? typeof t.homepageConfig === 'string'
        ? JSON.parse(t.homepageConfig)
        : t.homepageConfig
      : undefined,
  }))
}
