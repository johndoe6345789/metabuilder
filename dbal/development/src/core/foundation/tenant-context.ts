/**
 * @file tenant-context.ts
 * @description Multi-tenant context and identity management
 */

import type { TenantIdentity, TenantQuota, TenantContext } from './tenant/tenant-types'
import * as PermissionChecks from './tenant/permission-checks'
import * as QuotaChecks from './tenant/quota-checks'

export type { TenantIdentity, TenantQuota, TenantContext }

export class DefaultTenantContext implements TenantContext {
  constructor(
    public readonly identity: TenantIdentity,
    public readonly quota: TenantQuota,
    public readonly namespace: string
  ) {}
  
  canRead(resource: string): boolean {
    return PermissionChecks.canRead(this.identity, resource)
  }
  
  canWrite(resource: string): boolean {
    return PermissionChecks.canWrite(this.identity, resource)
  }
  
  canDelete(resource: string): boolean {
    return PermissionChecks.canDelete(this.identity, resource)
  }
  
  canUploadBlob(sizeBytes: number): boolean {
    return QuotaChecks.canUploadBlob(this.quota, sizeBytes)
  }
  
  canCreateRecord(): boolean {
    return QuotaChecks.canCreateRecord(this.quota)
  }
  
  canAddToList(additionalItems: number): boolean {
    return QuotaChecks.canAddToList(this.quota, additionalItems)
  }
}

export const createTenantContext = (
  identity: TenantIdentity,
  quota: TenantQuota,
  namespace?: string
): TenantContext => {
  return new DefaultTenantContext(
    identity,
    quota,
    namespace || `tenant_${identity.tenantId}`
  )
}
