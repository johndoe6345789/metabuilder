/**
 * @file tenant-types.ts
 * @description Type definitions for tenant context and identity
 */

export interface TenantIdentity {
  tenantId: string
  userId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: Set<string>
}

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
  identity: TenantIdentity
  quota: TenantQuota
  namespace: string
  
  canRead(resource: string): boolean
  canWrite(resource: string): boolean
  canDelete(resource: string): boolean
  
  canUploadBlob(sizeBytes: number): boolean
  canCreateRecord(): boolean
  canAddToList(additionalItems: number): boolean
}
