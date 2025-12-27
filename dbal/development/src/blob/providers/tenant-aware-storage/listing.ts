import type { BlobListOptions, BlobListResult } from '../../blob-storage'
import { scopeKey, withUnscopedItems } from './key-scope'
import { ensureCanReadBlob } from './permissions'
import type { TenantStorageDependencies, TenantContextLoader } from './context'

export const createListingHandler = (
  dependencies: TenantStorageDependencies,
  getContext: TenantContextLoader
) => {
  const list = async (options?: BlobListOptions): Promise<BlobListResult> => {
    const context = await getContext()
    ensureCanReadBlob(context)

    const scopedOptions: BlobListOptions = {
      ...options,
      prefix: options?.prefix ? scopeKey(options.prefix, context.namespace) : context.namespace,
    }

    const result = await dependencies.baseStorage.list(scopedOptions)
    return withUnscopedItems(result, context.namespace)
  }

  return { list }
}
