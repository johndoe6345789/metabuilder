// Auto-generated re-exports for backward compatibility

export { blobDelete } from './functions/blob-delete'
export { blobDownload } from './functions/blob-download'
export { blobGetMetadata } from './functions/blob-get-metadata'
export { blobList } from './functions/blob-list'
export { blobUpload } from './functions/blob-upload'
export { createTenant } from './functions/create-tenant'
export { blobDeleteDuplicate } from './functions/delete'
export { download } from './functions/download'
export { get } from './functions/get'
export { getBlobStorage } from './functions/get-blob-storage'
export { getClient } from './functions/get-client'
export { getInstance } from './functions/get-instance'
export { getKVStore } from './functions/get-k-v-store'
export { getKey } from './functions/get-key'
export { getMetadata } from './functions/get-metadata'
export { getTenantContext } from './functions/get-tenant-context'
export { getTenantManager } from './functions/get-tenant-manager'
export { handleError } from './functions/handle-error'
export { hasTenant } from './functions/has-tenant'
export { initialize } from './functions/initialize'
export { isInitialized } from './functions/is-initialized'
export { kvDelete } from './functions/kv-delete'
export { kvGet } from './functions/kv-get'
export { kvListAdd } from './functions/kv-list-add'
export { kvListGet } from './functions/kv-list-get'
export { kvSet } from './functions/kv-set'
export { list } from './functions/list'
export { listAdd } from './functions/list-add'
export { listGet } from './functions/list-get'
export { reset } from './functions/reset'
export { set } from './functions/set'
export { upload } from './functions/upload'

// Import for use in the namespace object
import { initialize as initializeImpl } from './functions/initialize'
import { get as getImpl } from './functions/get'
import { set as setImpl } from './functions/set'
import { listAdd as listAddImpl } from './functions/list-add'
import { listGet as listGetImpl } from './functions/list-get'
import { getBlobStorage as getBlobStorageImpl } from './functions/get-blob-storage'
import { getKVStore as getKVStoreImpl } from './functions/get-k-v-store'
import { getTenantContext as getTenantContextImpl } from './functions/get-tenant-context'
import { getTenantManager as getTenantManagerImpl } from './functions/get-tenant-manager'

// Create a namespace object for backward compatibility
export const dbal = {
  initialize: initializeImpl,
  get: getImpl,
  set: setImpl,
  listAdd: listAddImpl,
  listGet: listGetImpl,
  getBlobStorage: getBlobStorageImpl,
  getKVStore: getKVStoreImpl,
  getTenantContext: getTenantContextImpl,
  getTenantManager: getTenantManagerImpl,
}

// Type alias for backward compatibility
export type DBALIntegration = typeof dbal
