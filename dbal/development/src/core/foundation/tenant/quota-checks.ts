/**
 * @file quota-checks.ts
 * @description Quota checking utilities for tenant resources
 */

import type { TenantQuota } from './tenant-types'

/**
 * Check if tenant can upload a blob of given size
 */
export const canUploadBlob = (quota: TenantQuota, sizeBytes: number): boolean => {
  // Check blob size limit
  if (quota.maxBlobSizeBytes && sizeBytes > quota.maxBlobSizeBytes) {
    return false
  }
  
  // Check total storage limit
  if (quota.maxBlobStorageBytes) {
    const projectedTotal = quota.currentBlobStorageBytes + sizeBytes
    if (projectedTotal > quota.maxBlobStorageBytes) {
      return false
    }
  }
  
  // Check blob count limit
  if (quota.maxBlobCount && quota.currentBlobCount >= quota.maxBlobCount) {
    return false
  }
  
  return true
}

/**
 * Check if tenant can create a new record
 */
export const canCreateRecord = (quota: TenantQuota): boolean => {
  if (quota.maxRecords && quota.currentRecords >= quota.maxRecords) {
    return false
  }
  
  return true
}

/**
 * Check if tenant can add items to a list
 */
export const canAddToList = (quota: TenantQuota, additionalItems: number): boolean => {
  if (quota.maxListLength) {
    // Assuming currentRecords includes list items
    const projectedTotal = quota.currentRecords + additionalItems
    if (projectedTotal > quota.maxListLength) {
      return false
    }
  }
  
  return true
}
