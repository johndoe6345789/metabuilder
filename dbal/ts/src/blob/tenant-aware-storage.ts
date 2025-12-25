/**
 * Tenant-Aware Blob Storage
 * 
 * Wraps BlobStorage with multi-tenant support including:
 * - Namespace isolation
 * - Access control
 * - Quota management
 * - Virtual root directories
 */

import { BlobStorage, BlobMetadata, UploadOptions, ListOptions, ListResult } from './blob-storage'
import { TenantContext, TenantManager } from '../core/tenant-context'
import { DBALError } from '../core/errors'
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
      throw new DBALError('Permission denied: cannot upload blobs', 403)
    }
    
    // Check quota
    const size = data.length
    if (!context.canUploadBlob(size)) {
      throw new DBALError('Quota exceeded: cannot upload blob', 429)
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
      throw new DBALError('Permission denied: cannot upload blobs', 403)
    }
    
    // Check quota
    if (!context.canUploadBlob(size)) {
      throw new DBALError('Quota exceeded: cannot upload blob', 429)
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
      throw new DBALError('Permission denied: cannot download blobs', 403)
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    return this.baseStorage.download(scopedKey)
  }
  
  async downloadStream(key: string, start?: number, end?: number): Promise<Readable> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob')) {
      throw new DBALError('Permission denied: cannot download blobs', 403)
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    return this.baseStorage.downloadStream(scopedKey, start, end)
  }
  
  async delete(key: string): Promise<boolean> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canDelete('blob')) {
      throw new DBALError('Permission denied: cannot delete blobs', 403)
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
      throw new DBALError('Permission denied: cannot check blob existence', 403)
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    return this.baseStorage.exists(scopedKey)
  }
  
  async copy(sourceKey: string, destKey: string): Promise<BlobMetadata> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob') || !context.canWrite('blob')) {
      throw new DBALError('Permission denied: cannot copy blobs', 403)
    }
    
    // Get source metadata to check quota
    const sourceScoped = this.getScopedKey(sourceKey, context.namespace)
    const sourceMetadata = await this.baseStorage.getMetadata(sourceScoped)
    
    // Check quota for destination
    if (!context.canUploadBlob(sourceMetadata.size)) {
      throw new DBALError('Quota exceeded: cannot copy blob', 429)
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
  
  async list(options?: ListOptions): Promise<ListResult> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob')) {
      throw new DBALError('Permission denied: cannot list blobs', 403)
    }
    
    // Add namespace prefix to options
    const scopedOptions: ListOptions = {
      ...options,
      prefix: options?.prefix 
        ? this.getScopedKey(options.prefix, context.namespace)
        : context.namespace
    }
    
    const result = await this.baseStorage.list(scopedOptions)
    
    // Unscope keys in results
    return {
      ...result,
      keys: result.keys.map(key => this.unscopeKey(key, context.namespace)),
      metadata: result.metadata?.map(meta => ({
        ...meta,
        key: this.unscopeKey(meta.key, context.namespace)
      }))
    }
  }
  
  async getMetadata(key: string): Promise<BlobMetadata> {
    const context = await this.getContext()
    
    // Check permissions
    if (!context.canRead('blob')) {
      throw new DBALError('Permission denied: cannot get blob metadata', 403)
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
      throw new DBALError('Permission denied: cannot generate presigned URL', 403)
    }
    
    const scopedKey = this.getScopedKey(key, context.namespace)
    return this.baseStorage.generatePresignedUrl(scopedKey, expiresIn)
  }
}
