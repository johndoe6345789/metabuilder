// Auto-generated class wrapper
import { createTenant } from './functions/create-tenant'
import { getTenantContext } from './functions/get-tenant-context'
import { hasTenant } from './functions/has-tenant'
import { getKey } from './functions/get-key'
import { set } from './functions/set'
import { get } from './functions/get'
import { delete } from './functions/delete'
import { listAdd } from './functions/list-add'
import { listGet } from './functions/list-get'
import { upload } from './functions/upload'
import { download } from './functions/download'
import { delete } from './functions/delete'
import { list } from './functions/list'
import { getMetadata } from './functions/get-metadata'
import { getInstance } from './functions/get-instance'
import { initialize } from './functions/initialize'
import { getClient } from './functions/get-client'
import { getTenantManager } from './functions/get-tenant-manager'
import { getKVStore } from './functions/get-k-v-store'
import { getBlobStorage } from './functions/get-blob-storage'
import { isInitialized } from './functions/is-initialized'
import { reset } from './functions/reset'
import { kvSet } from './functions/kv-set'
import { kvGet } from './functions/kv-get'
import { kvDelete } from './functions/kv-delete'
import { kvListAdd } from './functions/kv-list-add'
import { kvListGet } from './functions/kv-list-get'
import { blobUpload } from './functions/blob-upload'
import { blobDownload } from './functions/blob-download'
import { blobDelete } from './functions/blob-delete'
import { blobList } from './functions/blob-list'
import { blobGetMetadata } from './functions/blob-get-metadata'
import { handleError } from './functions/handle-error'

/**
 * DbalIntegrationUtils - Class wrapper for 33 functions
 * 
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class DbalIntegrationUtils {
  static async createTenant(...args: any[]) {
    return await createTenant(...args as any)
  }

  static async getTenantContext(...args: any[]) {
    return await getTenantContext(...args as any)
  }

  static hasTenant(...args: any[]) {
    return hasTenant(...args as any)
  }

  static getKey(...args: any[]) {
    return getKey(...args as any)
  }

  static async set(...args: any[]) {
    return await set(...args as any)
  }

  static async get(...args: any[]) {
    return await get(...args as any)
  }

  static async delete(...args: any[]) {
    return await delete(...args as any)
  }

  static async listAdd(...args: any[]) {
    return await listAdd(...args as any)
  }

  static async listGet(...args: any[]) {
    return await listGet(...args as any)
  }

  static async upload(...args: any[]) {
    return await upload(...args as any)
  }

  static async download(...args: any[]) {
    return await download(...args as any)
  }

  static async delete(...args: any[]) {
    return await delete(...args as any)
  }

  static async list(...args: any[]) {
    return await list(...args as any)
  }

  static async getMetadata(...args: any[]) {
    return await getMetadata(...args as any)
  }

  static getInstance(...args: any[]) {
    return getInstance(...args as any)
  }

  static async initialize(...args: any[]) {
    return await initialize(...args as any)
  }

  static getClient(...args: any[]) {
    return getClient(...args as any)
  }

  static getTenantManager(...args: any[]) {
    return getTenantManager(...args as any)
  }

  static getKVStore(...args: any[]) {
    return getKVStore(...args as any)
  }

  static getBlobStorage(...args: any[]) {
    return getBlobStorage(...args as any)
  }

  static isInitialized(...args: any[]) {
    return isInitialized(...args as any)
  }

  static reset(...args: any[]) {
    return reset(...args as any)
  }

  static async kvSet(...args: any[]) {
    return await kvSet(...args as any)
  }

  static async kvGet(...args: any[]) {
    return await kvGet(...args as any)
  }

  static async kvDelete(...args: any[]) {
    return await kvDelete(...args as any)
  }

  static async kvListAdd(...args: any[]) {
    return await kvListAdd(...args as any)
  }

  static async kvListGet(...args: any[]) {
    return await kvListGet(...args as any)
  }

  static async blobUpload(...args: any[]) {
    return await blobUpload(...args as any)
  }

  static async blobDownload(...args: any[]) {
    return await blobDownload(...args as any)
  }

  static async blobDelete(...args: any[]) {
    return await blobDelete(...args as any)
  }

  static async blobList(...args: any[]) {
    return await blobList(...args as any)
  }

  static async blobGetMetadata(...args: any[]) {
    return await blobGetMetadata(...args as any)
  }

  static handleError(...args: any[]) {
    return handleError(...args as any)
  }

}
