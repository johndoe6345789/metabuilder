import type { BlobStorage } from '../../blob-storage'
import type { TenantContext, TenantManager } from '../core/tenant-context'

export interface TenantStorageDependencies {
  baseStorage: BlobStorage
  tenantManager: TenantManager
  tenantId: string
  userId: string
}

export type TenantContextLoader = () => Promise<TenantContext>

export const createTenantContextLoader = (
  dependencies: TenantStorageDependencies
): TenantContextLoader => {
  const { tenantManager, tenantId, userId } = dependencies
  return () => tenantManager.getTenantContext(tenantId, userId)
}
