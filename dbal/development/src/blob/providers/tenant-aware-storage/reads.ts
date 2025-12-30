import type { DownloadOptions, BlobMetadata, BlobListOptions, BlobListResult } from '../blob-storage'
import type { TenantAwareDeps } from './context'
import { scopeKey, unscopeKey } from './context'
import { ensurePermission, resolveTenantContext } from './tenant-context'

export const downloadBuffer = async (deps: TenantAwareDeps, key: string): Promise<Buffer> => {
  const context = await resolveTenantContext(deps)
  ensurePermission(context, 'read')

  const scopedKey = scopeKey(key, context.namespace)
  return deps.baseStorage.download(scopedKey)
}

export const downloadStream = async (
  deps: TenantAwareDeps,
  key: string,
  options?: DownloadOptions,
): Promise<ReadableStream | NodeJS.ReadableStream> => {
  const context = await resolveTenantContext(deps)
  ensurePermission(context, 'read')

  const scopedKey = scopeKey(key, context.namespace)
  return deps.baseStorage.downloadStream(scopedKey, options)
}

export const listBlobs = async (
  deps: TenantAwareDeps,
  options: BlobListOptions = {},
): Promise<BlobListResult> => {
  const context = await resolveTenantContext(deps)
  ensurePermission(context, 'read')

  const scopedOptions: BlobListOptions = {
    ...options,
    prefix: options.prefix ? scopeKey(options.prefix, context.namespace) : context.namespace,
  }

  const result = await deps.baseStorage.list(scopedOptions)

  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      key: unscopeKey(item.key, context.namespace),
    })),
  }
}

export const getMetadata = async (deps: TenantAwareDeps, key: string): Promise<BlobMetadata> => {
  const context = await resolveTenantContext(deps)
  ensurePermission(context, 'read')

  const scopedKey = scopeKey(key, context.namespace)
  const metadata = await deps.baseStorage.getMetadata(scopedKey)

  return {
    ...metadata,
    key,
  }
}

export const generatePresignedUrl = async (
  deps: TenantAwareDeps,
  key: string,
  expiresIn: number,
): Promise<string> => {
  const context = await resolveTenantContext(deps)
  ensurePermission(context, 'read')

  const scopedKey = scopeKey(key, context.namespace)
  return deps.baseStorage.generatePresignedUrl(scopedKey, expiresIn)
}
