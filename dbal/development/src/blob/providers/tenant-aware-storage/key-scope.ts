import type { BlobListResult, BlobMetadata } from '../../blob-storage'

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

export const withUnscopedItems = (
  result: BlobListResult,
  namespace: string
): BlobListResult => ({
  ...result,
  items: result.items.map((item: BlobMetadata) => ({
    ...item,
    key: unscopeKey(item.key, namespace),
  })),
})
