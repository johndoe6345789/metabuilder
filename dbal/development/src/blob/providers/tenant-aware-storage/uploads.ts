import { DBALError } from '../../core/foundation/errors'
import type { UploadOptions, BlobMetadata } from '../blob-storage'
import type { TenantAwareDeps } from './context'
import { ensurePermission, getContext, scopeKey } from './context'

export const uploadBuffer = async (
  deps: TenantAwareDeps,
  key: string,
  data: Buffer,
  options?: UploadOptions,
): Promise<BlobMetadata> => {
  const context = await getContext(deps)
  ensurePermission(context, 'write')

  if (!context.canUploadBlob(data.length)) {
    throw DBALError.rateLimitExceeded()
  }

  const scopedKey = scopeKey(key, context.namespace)
  const metadata = await deps.baseStorage.upload(scopedKey, data, options)
  await deps.tenantManager.updateBlobUsage(deps.tenantId, data.length, 1)

  return {
    ...metadata,
    key,
  }
}

export const uploadStream = async (
  deps: TenantAwareDeps,
  key: string,
  stream: NodeJS.ReadableStream,
  size: number,
  options?: UploadOptions,
): Promise<BlobMetadata> => {
  const context = await getContext(deps)
  ensurePermission(context, 'write')

  if (!context.canUploadBlob(size)) {
    throw DBALError.rateLimitExceeded()
  }

  const scopedKey = scopeKey(key, context.namespace)
  const metadata = await deps.baseStorage.uploadStream(scopedKey, stream, size, options)
  await deps.tenantManager.updateBlobUsage(deps.tenantId, size, 1)

  return {
    ...metadata,
    key,
  }
}
