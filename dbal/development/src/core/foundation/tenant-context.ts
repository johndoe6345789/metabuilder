/**
 * @file tenant-context.ts
 * @description Tenant context stub
 */

export interface TenantQuota {
  // Blob storage quotas
  maxBlobStorageBytes?: number
  maxBlobCount?: number
  maxBlobSizeBytes?: number
  
  // Structured data quotas
  maxRecords?: number
  maxDataSizeBytes?: number
  maxListLength?: number
  
  // Computed usage
  currentBlobStorageBytes: number
  currentBlobCount: number
  currentRecords: number
  currentDataSizeBytes: number
}

export interface TenantContext {
  tenantId: string
  quota?: TenantQuota
  namespace?: string
  
  canRead(resource: string): boolean
  canWrite(resource: string): boolean
  canDelete(resource: string): boolean
  canUploadBlob(sizeBytes: number): boolean
  canCreateRecord(): boolean
  canAddToList(additionalItems: number): boolean
}

export interface TenantManager {
  getTenantContext(tenantId: string): Promise<TenantContext>
  updateQuota(tenantId: string, quota: Partial<TenantQuota>): Promise<void>
  validateTenantAccess(tenantId: string, userId: string): Promise<boolean>
  updateBlobUsage(tenantId: string, sizeDelta: number): Promise<void>
}
