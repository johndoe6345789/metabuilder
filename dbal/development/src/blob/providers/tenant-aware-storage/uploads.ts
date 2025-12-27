import type { BlobMetadata, UploadOptions } from '../../blob-storage'
import { scopeKey } from './key-scope'
import { assertWithinQuota, recordQuotaDelta } from './quota'
import { ensureCanReadBlob, ensureCanWriteBlob } from './permissions'
import type { TenantStorageDependencies, TenantContextLoader } from './context'
import { withUnscopedMetadata } from './unscoped-metadata'

export const createUploadHandlers = (
  dependencies: TenantStorageDependencies,
  getContext: TenantContextLoader
) => {
  const upload = async (
    key: string,
    data: Buffer,
    options?: UploadOptions
  ): Promise<BlobMetadata> => {
    const context = await getContext()
    ensureCanWriteBlob(context)
    assertWithinQuota(context, data.length)

    const scopedKey = scopeKey(key, context.namespace)
    const metadata = await dependencies.baseStorage.upload(scopedKey, data, options)

    await recordQuotaDelta(dependencies.tenantManager, dependencies.tenantId, data.length, 1)

    return withUnscopedMetadata(metadata, key)
  }

  const uploadStream = async (
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    size: number,
    options?: UploadOptions
  ): Promise<BlobMetadata> => {
    const context = await getContext()
    ensureCanWriteBlob(context)
    assertWithinQuota(context, size)

    const scopedKey = scopeKey(key, context.namespace)
    const metadata = await dependencies.baseStorage.uploadStream(scopedKey, stream, size, options)

    await recordQuotaDelta(dependencies.tenantManager, dependencies.tenantId, size, 1)

    return withUnscopedMetadata(metadata, key)
  }

  const copy = async (sourceKey: string, destKey: string): Promise<BlobMetadata> => {
    const context = await getContext()
    ensureCanReadBlob(context)
    ensureCanWriteBlob(context)

    const sourceScoped = scopeKey(sourceKey, context.namespace)
    const sourceMetadata = await dependencies.baseStorage.getMetadata(sourceScoped)
    assertWithinQuota(context, sourceMetadata.size)

    const destScoped = scopeKey(destKey, context.namespace)
    const metadata = await dependencies.baseStorage.copy(sourceScoped, destScoped)

    await recordQuotaDelta(
      dependencies.tenantManager,
      dependencies.tenantId,
      sourceMetadata.size,
      1
    )

    return withUnscopedMetadata(metadata, destKey)
  }

  return { upload, uploadStream, copy }
}
