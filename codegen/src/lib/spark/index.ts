/**
 * Spark Library Exports
 * 
 * Central export point for all Spark functionality
 */

export { sparkRuntime } from '../spark-runtime'
export { getStorage, setFlaskAPI, disableFlaskAPI, storageConfig } from '../storage-service'
export { default as sparkPlugin } from '../spark-vite-plugin'
export { default as createIconImportProxy } from '../vite-phosphor-icon-proxy-plugin'

export type { StorageConfig } from '../storage-service'
