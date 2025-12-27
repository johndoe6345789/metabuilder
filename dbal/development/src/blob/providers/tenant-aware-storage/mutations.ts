import { DBALError } from '../../core/foundation/errors'
import type { BlobMetadata } from '../blob-storage'
import { ensurePermission, getContext, scopeKey } from './context'
import type { TenantAwareDeps } from './context'

export const deleteBlob = async (deps: TenantAwareDeps, key: string): Promise<boolean> => {
  const context = await getContext(deps)
  ensurePermission(context, 'delete')

  const scopedKey = scopeKey(key, context.namespace)

  try {
    const metadata = await deps.baseStorage.getMetadata(scopedKey)
    const deleted = await deps.baseStorage.delete(scopedKey)

    if (deleted) {
      await deps.tenantManager.updateBlobUsage(deps.tenantId, -metadata.size, -1)
    }

    return deleted
  } catch {
    return deps.baseStorage.delete(scopedKey)
  }
}

export const exists = async (deps: TenantAwareDeps, key: string): Promise<boolean> => {
  const context = await getContext(deps)
  ensurePermission(context, 'read')

  const scopedKey = scopeKey(key, context.namespace)
  return deps.baseStorage.exists(scopedKey)
}

export const copyBlob = async (
  deps: TenantAwareDeps,
  sourceKey: string,
  destKey: string,
): Promise<BlobMetadata> => {
  const context = await getContext(deps)
  ensurePermission(context, 'read')
  ensurePermission(context, 'write')

  const sourceScoped = scopeKey(sourceKey, context.namespace)
  const sourceMetadata = await deps.baseStorage.getMetadata(sourceScoped)

  if (!context.canUploadBlob(sourceMetadata.size)) {
    throw DBALError.rateLimitExceeded()
  }

  const destScoped = scopeKey(destKey, context.namespace)
  const metadata = await deps.baseStorage.copy(sourceScoped, destScoped)

  await deps.tenantManager.updateBlobUsage(deps.tenantId, sourceMetadata.size, 1)

  return {
    ...metadata,
    key: destKey,
  }
}

export const getStats = async (deps: TenantAwareDeps) => {
  const context = await getContext(deps)
  return {
    count: context.quota.currentBlobCount,
    totalSize: context.quota.currentBlobStorageBytes,
  }
}
