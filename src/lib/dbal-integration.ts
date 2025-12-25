/**
 * DBAL Integration Layer
 * 
 * This module integrates the TypeScript DBAL client with the existing MetaBuilder
 * database layer, providing a bridge between the legacy Database class and the
 * new DBAL system.
 */

import { DBALClient, DBALError, DBALErrorCode } from '@/dbal/ts/src'
import type { DBALConfig } from '@/dbal/ts/src'
import { InMemoryTenantManager } from '@/dbal/ts/src/core/tenant-context'
import { InMemoryKVStore } from '@/dbal/ts/src/core/kv-store'
import { createBlobStorage } from '@/dbal/ts/src/blob'
import { TenantAwareBlobStorage } from '@/dbal/ts/src/blob/tenant-aware-storage'

/**
 * DBAL Integration Manager
 * 
 * Manages the DBAL client instance and provides helper methods for
 * integrating with the existing MetaBuilder system.
 */
export class DBALIntegration {
  private static instance: DBALIntegration | null = null
  private client: DBALClient | null = null
  private tenantManager: InMemoryTenantManager | null = null
  private kvStore: InMemoryKVStore | null = null
  private blobStorage: TenantAwareBlobStorage | null = null
  private initialized = false

  private constructor() {}

  static getInstance(): DBALIntegration {
    if (!DBALIntegration.instance) {
      DBALIntegration.instance = new DBALIntegration()
    }
    return DBALIntegration.instance
  }

  /**
   * Initialize the DBAL client with configuration
   */
  async initialize(config?: Partial<DBALConfig>): Promise<void> {
    if (this.initialized) {
      console.warn('DBAL already initialized')
      return
    }

    try {
      // Initialize tenant manager
      this.tenantManager = new InMemoryTenantManager()

      // Create default tenant for the application
      await this.tenantManager.createTenant('default', {
        maxBlobStorageBytes: 1024 * 1024 * 1024, // 1GB
        maxBlobCount: 10000,
        maxBlobSizeBytes: 100 * 1024 * 1024, // 100MB per file
        maxRecords: 100000,
        maxDataSizeBytes: 500 * 1024 * 1024, // 500MB
        maxListLength: 10000,
      })

      // Initialize KV store
      this.kvStore = new InMemoryKVStore()

      // Initialize blob storage (in-memory for browser)
      const baseStorage = createBlobStorage({
        type: 'memory',
      })

      // Wrap with tenant-aware storage
      this.blobStorage = new TenantAwareBlobStorage(
        baseStorage,
        this.tenantManager,
        'default',
        'system'
      )

      // Initialize DBAL client
      const dbalConfig: DBALConfig = {
        mode: 'development',
        adapter: 'prisma', // Use Prisma adapter
        ...config,
      }

      this.client = new DBALClient(dbalConfig)

      this.initialized = true
      console.log('DBAL Integration initialized successfully')
    } catch (error) {
      console.error('Failed to initialize DBAL:', error)
      throw error
    }
  }

  /**
   * Get the DBAL client instance
   */
  getClient(): DBALClient {
    if (!this.client) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.client
  }

  /**
   * Get the tenant manager
   */
  getTenantManager(): InMemoryTenantManager {
    if (!this.tenantManager) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.tenantManager
  }

  /**
   * Get the KV store
   */
  getKVStore(): InMemoryKVStore {
    if (!this.kvStore) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.kvStore
  }

  /**
   * Get the blob storage
   */
  getBlobStorage(): TenantAwareBlobStorage {
    if (!this.blobStorage) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.blobStorage
  }

  /**
   * Check if DBAL is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Reset the DBAL integration (useful for testing)
   */
  reset(): void {
    this.client = null
    this.tenantManager = null
    this.kvStore = null
    this.blobStorage = null
    this.initialized = false
  }

  /**
   * Store data in the KV store with automatic tenant scoping
   */
  async kvSet(
    key: string,
    value: any,
    ttl?: number,
    tenantId: string = 'default',
    userId: string = 'system'
  ): Promise<void> {
    if (!this.kvStore || !this.tenantManager) {
      throw new Error('DBAL not initialized')
    }

    const context = await this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) {
      throw new Error(`Tenant context not found: ${tenantId}`)
    }

    await this.kvStore.set(key, value, context, ttl)
  }

  /**
   * Get data from the KV store
   */
  async kvGet<T = any>(
    key: string,
    tenantId: string = 'default',
    userId: string = 'system'
  ): Promise<T | null> {
    if (!this.kvStore || !this.tenantManager) {
      throw new Error('DBAL not initialized')
    }

    const context = this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) {
      throw new Error(`Tenant context not found: ${tenantId}`)
    }

    return this.kvStore.get(key, context) as T | null
  }

  /**
   * Delete data from the KV store
   */
  async kvDelete(
    key: string,
    tenantId: string = 'default',
    userId: string = 'system'
  ): Promise<boolean> {
    if (!this.kvStore || !this.tenantManager) {
      throw new Error('DBAL not initialized')
    }

    const context = this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) {
      throw new Error(`Tenant context not found: ${tenantId}`)
    }

    return this.kvStore.delete(key, context)
  }

  /**
   * List operations for the KV store
   */
  async kvListAdd(
    key: string,
    items: any[],
    tenantId: string = 'default',
    userId: string = 'system'
  ): Promise<void> {
    if (!this.kvStore || !this.tenantManager) {
      throw new Error('DBAL not initialized')
    }

    const context = this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) {
      throw new Error(`Tenant context not found: ${tenantId}`)
    }

    await this.kvStore.listAdd(key, items, context)
  }

  async kvListGet(
    key: string,
    tenantId: string = 'default',
    userId: string = 'system',
    start?: number,
    end?: number
  ): Promise<any[]> {
    if (!this.kvStore || !this.tenantManager) {
      throw new Error('DBAL not initialized')
    }

    const context = this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) {
      throw new Error(`Tenant context not found: ${tenantId}`)
    }

    return this.kvStore.listGet(key, context, start, end)
  }

  /**
   * Upload blob data
   */
  async blobUpload(
    key: string,
    data: Buffer | Uint8Array,
    metadata?: Record<string, string>
  ): Promise<void> {
    if (!this.blobStorage) {
      throw new Error('DBAL not initialized')
    }

    await this.blobStorage.upload(key, data, metadata)
  }

  /**
   * Download blob data
   */
  async blobDownload(key: string): Promise<Buffer> {
    if (!this.blobStorage) {
      throw new Error('DBAL not initialized')
    }

    return this.blobStorage.download(key)
  }

  /**
   * Delete blob data
   */
  async blobDelete(key: string): Promise<void> {
    if (!this.blobStorage) {
      throw new Error('DBAL not initialized')
    }

    await this.blobStorage.delete(key)
  }

  /**
   * List blobs with optional prefix filter
   */
  async blobList(prefix?: string): Promise<string[]> {
    if (!this.blobStorage) {
      throw new Error('DBAL not initialized')
    }

    return this.blobStorage.list(prefix)
  }

  /**
   * Get blob metadata
   */
  async blobGetMetadata(key: string): Promise<Record<string, string>> {
    if (!this.blobStorage) {
      throw new Error('DBAL not initialized')
    }

    return this.blobStorage.getMetadata(key)
  }

  /**
   * Handle DBAL errors gracefully
   */
  handleError(error: unknown): { message: string; code?: DBALErrorCode } {
    if (error instanceof DBALError) {
      return {
        message: error.message,
        code: error.code,
      }
    }

    if (error instanceof Error) {
      return {
        message: error.message,
      }
    }

    return {
      message: 'An unknown error occurred',
    }
  }
}

// Export singleton instance
export const dbal = DBALIntegration.getInstance()

// Export for convenience
export { DBALError, DBALErrorCode }
