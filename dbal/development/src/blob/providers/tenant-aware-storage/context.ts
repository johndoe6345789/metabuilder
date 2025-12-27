import { DBALError } from '../../core/foundation/errors'
import type { TenantContext, TenantManager } from '../../core/foundation/tenant-context'
import type { BlobStorage } from '../blob-storage'

export interface TenantAwareDeps {
  baseStorage: BlobStorage
  tenantManager: TenantManager
  tenantId: string
  userId: string
}

export const getContext = async ({ tenantManager, tenantId, userId }: TenantAwareDeps): Promise<TenantContext> => {
  return tenantManager.getTenantContext(tenantId, userId)
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

export const ensurePermission = (context: TenantContext, action: 'read' | 'write' | 'delete'): void => {
  const accessCheck =
    action === 'read' ? context.canRead('blob') : action === 'write' ? context.canWrite('blob') : context.canDelete('blob')

  if (!accessCheck) {
    const verbs: Record<typeof action, string> = {
      read: 'read',
      write: 'write',
      delete: 'delete',
    }
    throw DBALError.forbidden(`Permission denied: cannot ${verbs[action]} blobs`)
  }
}
