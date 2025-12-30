import type { TenantManager } from '../../core/foundation/tenant-context'
import type { BlobStorage } from '../blob-storage'

export interface TenantAwareDeps {
  baseStorage: BlobStorage
  tenantManager: TenantManager
  tenantId: string
  userId: string
}

export const scopeKey = (key: string, namespace: string): string => {
  const cleanKey = key.startsWith('/') ? key.substring(1) : key
  return `${namespace}${cleanKey}`
}

export const unscopeKey = (scopedKey: string, namespace: string): string => {
  if (scopedKey.startsWith(namespace)) {
    return scopedKey.substring(namespace.length)
  }
  return scopedKey
}
