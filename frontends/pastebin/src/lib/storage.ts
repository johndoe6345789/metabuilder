/**
 * Storage barrel — re-exports from split modules
 */

export type { StorageBackend, StorageConfig } from './storage-config.js'
export {
  getDefaultConfig,
  loadStorageConfig,
  saveStorageConfig,
  getStorageConfig,
} from './storage-config.js'
export { DBALStorageAdapter } from './storage-dbal.js'
