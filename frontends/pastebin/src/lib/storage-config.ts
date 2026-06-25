/**
 * Storage configuration helpers
 */

export type StorageBackend = 'indexeddb' | 'dbal'

export interface StorageConfig {
  backend: StorageBackend
  dbalUrl?: string
}

const STORAGE_CONFIG_KEY = 'codesnippet-storage-config'

export function getDefaultConfig(): StorageConfig {
  const dbalUrl = process.env.NEXT_PUBLIC_DBAL_API_URL
  if (dbalUrl) return { backend: 'dbal', dbalUrl }
  return { backend: 'indexeddb' }
}

let currentConfig: StorageConfig = getDefaultConfig()

export function loadStorageConfig(): StorageConfig {
  const defaultConfig = getDefaultConfig()

  if (defaultConfig.backend === 'dbal' && defaultConfig.dbalUrl) {
    currentConfig = defaultConfig
    return currentConfig
  }

  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY)
    if (saved) currentConfig = JSON.parse(saved)
  } catch (error) {
    console.warn('Failed to load storage config:', error)
  }
  return currentConfig
}

export function saveStorageConfig(config: StorageConfig): void {
  currentConfig = config
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config))
  } catch (error) {
    console.warn('Failed to save storage config:', error)
  }
}

export function getStorageConfig(): StorageConfig {
  return currentConfig
}
