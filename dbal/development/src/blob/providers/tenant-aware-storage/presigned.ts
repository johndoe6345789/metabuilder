import { scopeKey } from './key-scope'
import { ensureCanReadBlob } from './permissions'
import type { TenantStorageDependencies, TenantContextLoader } from './context'

export const createPresignedUrlHandler = (
  dependencies: TenantStorageDependencies,
  getContext: TenantContextLoader
) => {
  const generatePresignedUrl = async (key: string, expiresIn: number): Promise<string> => {
    const context = await getContext()
    ensureCanReadBlob(context)

    const scopedKey = scopeKey(key, context.namespace)
    return dependencies.baseStorage.generatePresignedUrl(scopedKey, expiresIn)
  }

  return { generatePresignedUrl }
}
