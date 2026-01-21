import copy from './storageSettingsCopy.json'

export type StorageBackendKey = 'flask' | 'sqlite' | 'indexeddb' | 'sparkkv'

export const storageSettingsCopy = copy

export const getBackendCopy = (backend: StorageBackendKey | null) => {
  if (!backend) {
    return storageSettingsCopy.backends.unknown
  }

  return storageSettingsCopy.backends[backend] ?? storageSettingsCopy.backends.unknown
}
