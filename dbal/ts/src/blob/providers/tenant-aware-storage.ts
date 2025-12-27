/**
 * Tenant-Aware Blob Storage
 * 
 * Wraps BlobStorage with multi-tenant support including:
 * - Namespace isolation
 * - Access control
 * - Quota management
 * - Virtual root directories
 */

import { BlobStorage, BlobMetadata, UploadOptions, DownloadOptions, BlobListOptions, BlobListResult } from './blob-storage'
import { TenantContext, TenantManager } from '../core/tenant-context'
import { DBALError } from '../../core/foundation/errors'
import { Readable } from 'stream'

export class TenantAwareBlobStorage implements BlobStorage {
  constructor(
    private readonly baseStorage: BlobStorage,
    private readonly tenantManager: TenantManager,
    private readonly tenantId: string,
    private readonly userId: string
  ) {}
  
  private async getContext(): Promise<TenantContext> {
    return this.tenantManager.getTenantContext(this.tenantId, this.userId)
  }
  
  private getScopedKey(key: string, namespace: string): string {
    // Remove leading slash if present
    const cleanKey = key.startsWith('/') ? key.substring(1) : key
    return `${namespace}${cleanKey}`
  }
  
  private unscopeKey(scopedKey: string, namespace: string): string {
    if (scopedKey.startsWith(namespace)) {
      return scopedKey.substring(namespace.length)
    }
    return scopedKey
  }
  
  async upload(key: string, data: Buffer, options?: UploadOptions): Promise<BlobMetadata> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canWrite('blob')) {
      throw DBALError.forbidden('Permission denied: cannot upload blobs')
    }
    
    // Check quota
    const size = data.length
    if (!context.canUploadBlob(size)) {
      throw DBALError.rateLimitExceeded()
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    const metadata = await this.baseStorage.upload(scopedKey, data, options)
    
    // Update quota
    await this.tenantManager.updateBlobUsage(this.tenantId, size, 1)
    
    // Return metadata with unscoped key
    return {
      ...metadata,
      key
    }
  }
  
  async uploadStream(key: string, stream: Readable, size: number, options?: UploadOptions): Promise<BlobMetadata> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canWrite('blob')) {
      throw DBALError.forbidden('Permission denied: cannot upload blobs')
    }
    
    // Check quota
    if (!context.canUploadBlob(size)) {
      throw DBALError.rateLimitExceeded()
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    const metadata = await this.baseStorage.uploadStream(scopedKey, stream, size, options)
    
    // Update quota
    await this.tenantManager.updateBlobUsage(this.tenantId, size, 1)
    
    // Return metadata with unscoped key
    return {
      ...metadata,
      key
    }
  }
  
  async download(key: string): Promise<Buffer> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob')) {
      throw DBALError.forbidden('Permission denied: cannot download blobs')
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    return this.baseStorage.download(scopedKey)
  }
  
  async downloadStream(key: string, options?: DownloadOptions): Promise<ReadableStream | NodeJS.ReadableStream> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob')) {
      throw DBALError.forbidden('Permission denied: cannot download blobs')
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    return this.baseStorage.downloadStream(scopedKey, options)
  }
  
  async delete(key: string): Promise<boolean> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canDelete('blob')) {
      throw DBALError.forbidden('Permission denied: cannot delete blobs')
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    
    // Get metadata before deletion to update quota
    try {
      const metadata = await this.baseStorage.getMetadata(scopedKey)
      const deleted = await this.baseStorage.delete(scopedKey)
      
      if (deleted) {
        // Update quota
        await this.tenantManager.updateBlobUsage(this.tenantId, -metadata.size, -1)
      }
      
      return deleted
    } catch (error) {
      // If metadata fetch fails, try delete anyway
      return this.baseStorage.delete(scopedKey)
    }
  }
  
  async exists(key: string): Promise<boolean> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob')) {
      throw DBALError.forbidden('Permission denied: cannot check blob existence')
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    return this.baseStorage.exists(scopedKey)
  }
  
  async copy(sourceKey: string, destKey: string): Promise<BlobMetadata> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob') || !context.canWrite('blob')) {
      throw DBALError.forbidden('Permission denied: cannot copy blobs')
    }
    
    // Get source metadata to check quota
    const sourceScoped = this.getScopedKey(sourceKey, context.namespace)
    const sourceMetadata = await this.baseStorage.getMetadata(sourceScoped)
    
    // Check quota for destination
    if (!context.canUploadBlob(sourceMetadata.size)) {
      throw DBALError.rateLimitExceeded()
    }
    
    const destScoped = this.getScopedKey(destKey, context.namespace)
    const metadata = await this.baseStorage.copy(sourceScoped, destScoped)
    
    // Update quota
    await this.tenantManager.updateBlobUsage(this.tenantId, sourceMetadata.size, 1)
    
    return {
      ...metadata,
      key: destKey
    }
  }
  
  async list(options?: BlobListOptions): Promise<BlobListResult> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob')) {
      throw DBALError.forbidden('Permission denied: cannot list blobs')
    }
    
    // Add namespace prefix to options
    const scopedOptions: BlobListOptions = {
      ...options,
      prefix: options?.prefix 
        ? this.getScopedKey(options.prefix, context.namespace)
        : context.namespace
    }
    
    const result = await this.baseStorage.list(scopedOptions)
    
    // Unscope keys in results
    return {
      ...result,
      items: result.items.map(item => ({
        ...item,
        key: this.unscopeKey(item.key, context.namespace)
      }))
    }
  }
  
  async getMetadata(key: string): Promise<BlobMetadata> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob')) {
      throw DBALError.forbidden('Permission denied: cannot get blob metadata')
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    const metadata = await this.baseStorage.getMetadata(scopedKey)
    
    return {
      ...metadata,
      key
    }
  }
  
  async getStats(): Promise<{ count: number; totalSize: number }> {
    const context = await this.getContext()
    
    // Return tenant's current usage from quota
    return {
      count: context.quota.currentBlobCount,
      totalSize: context.quota.currentBlobStorageBytes
    }
  }
  
  async generatePresignedUrl(key: string, expiresIn: number): Promise<string> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob')) {
      throw DBALError.forbidden('Permission denied: cannot generate presigned URL')
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    return this.baseStorage.generatePresignedUrl(scopedKey, expiresIn)
  }
  
  async getTotalSize(): Promise<number> {
    return this.baseStorage.getTotalSize()
  }
  
  async getObjectCount(): Promise<number> {
    return this.baseStorage.getObjectCount()
  }
}
