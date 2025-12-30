/**
 * @file permission-checks.ts
 * @description Permission checking utilities for tenant resources
 */

import type { TenantIdentity } from './tenant-types'

/**
 * Check if tenant has read permission for a resource
 */
export const canRead = (identity: TenantIdentity, resource: string): boolean => {
  if (identity.role === 'owner' || identity.role === 'admin') {
    return true
  }
  
  return (
    identity.permissions.has('read:*') ||
    identity.permissions.has(`read:${resource}`)
  )
}

/**
 * Check if tenant has write permission for a resource
 */
export const canWrite = (identity: TenantIdentity, resource: string): boolean => {
  if (identity.role === 'owner' || identity.role === 'admin') {
    return true
  }
  
  return (
    identity.permissions.has('write:*') ||
    identity.permissions.has(`write:${resource}`)
  )
}

/**
 * Check if tenant has delete permission for a resource
 */
export const canDelete = (identity: TenantIdentity, resource: string): boolean => {
  if (identity.role === 'owner' || identity.role === 'admin') {
    return true
  }
  
  return (
    identity.permissions.has('delete:*') ||
    identity.permissions.has(`delete:${resource}`)
  )
}
