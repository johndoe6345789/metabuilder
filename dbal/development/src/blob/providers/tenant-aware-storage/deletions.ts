import { scopeKey } from './key-scope'
import { ensureCanDeleteBlob } from './permissions'
import { recordQuotaDelta } from './quota'
import type { TenantStorageDependencies, TenantContextLoader } from './context'

export const createDeletionHandler = (
  dependencies: TenantStorageDependencies,
  getContext: TenantContextLoader
) => {
  const deleteBlob = async (key: string): Promise<boolean> => {
    const context = await getContext()
    ensureCanDeleteBlob(context)

    const scopedKey = scopeKey(key, context.namespace)

    try {
      const metadata = await dependencies.baseStorage.getMetadata(scopedKey)
      const deleted = await dependencies.baseStorage.delete(scopedKey)

      if (deleted) {
        await recordQuotaDelta(
          dependencies.tenantManager,
          dependencies.tenantId,
          -metadata.size,
          -1
        )
      }

      return deleted
    } catch {
      return dependencies.baseStorage.delete(scopedKey)
    }
  }

  return { deleteBlob }
}
