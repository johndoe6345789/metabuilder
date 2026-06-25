/**
 * Storage barrel — re-exports from split modules
 */

export type { StorageBackend, StorageConfig } from './storage-config'
export {
  getDefaultConfig,
  loadStorageConfig,
  saveStorageConfig,
  getStorageConfig,
} from './storage-config'
export { DBALStorageAdapter } from './storage-dbal'
