import { DBALError } from '../../core/foundation/errors'
import { auditUpload } from './audit-hooks'
import type { TenantAwareDeps } from './context'
import { scopeKey } from './context'
import { ensurePermission, resolveTenantContext } from './tenant-context'
import type { UploadOptions, BlobMetadata } from '../blob-storage'

export const uploadBuffer = async (
  deps: TenantAwareDeps,
  key: string,
  data: Buffer,
  options?: UploadOptions,
): Promise<BlobMetadata> => {
  const context = await resolveTenantContext(deps)
  ensurePermission(context, 'write')

  if (!context.canUploadBlob(data.length)) {
    throw DBALError.rateLimitExceeded()
  }

  const scopedKey = scopeKey(key, context.namespace)
  const metadata = await deps.baseStorage.upload(scopedKey, data, options)
  await auditUpload(deps, data.length)

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
  const context = await resolveTenantContext(deps)
  ensurePermission(context, 'write')

  if (!context.canUploadBlob(size)) {
    throw DBALError.rateLimitExceeded()
  }

  const scopedKey = scopeKey(key, context.namespace)
  const metadata = await deps.baseStorage.uploadStream(scopedKey, stream, size, options)
  await auditUpload(deps, size)

  return {
    ...metadata,
    key,
  }
}
