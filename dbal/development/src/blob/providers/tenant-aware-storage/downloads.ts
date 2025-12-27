import type { BlobMetadata, DownloadOptions } from '../../blob-storage'
import { scopeKey } from './key-scope'
import { ensureCanReadBlob } from './permissions'
import type { TenantStorageDependencies, TenantContextLoader } from './context'
import { withUnscopedMetadata } from './unscoped-metadata'

export const createDownloadHandlers = (
  dependencies: TenantStorageDependencies,
  getContext: TenantContextLoader
) => {
  const download = async (key: string): Promise<Buffer> => {
    const context = await getContext()
    ensureCanReadBlob(context)

    const scopedKey = scopeKey(key, context.namespace)
    return dependencies.baseStorage.download(scopedKey)
  }

  const downloadStream = async (
    key: string,
    options?: DownloadOptions
  ): Promise<ReadableStream | NodeJS.ReadableStream> => {
    const context = await getContext()
    ensureCanReadBlob(context)

    const scopedKey = scopeKey(key, context.namespace)
    return dependencies.baseStorage.downloadStream(scopedKey, options)
  }

  const exists = async (key: string): Promise<boolean> => {
    const context = await getContext()
    ensureCanReadBlob(context)

    const scopedKey = scopeKey(key, context.namespace)
    return dependencies.baseStorage.exists(scopedKey)
  }

  const getMetadata = async (key: string): Promise<BlobMetadata> => {
    const context = await getContext()
    ensureCanReadBlob(context)

    const scopedKey = scopeKey(key, context.namespace)
    const metadata = await dependencies.baseStorage.getMetadata(scopedKey)

    return withUnscopedMetadata(metadata, key)
  }

  return {
    download,
    downloadStream,
    exists,
    getMetadata,
  }
}
