/**
 * DBAL Integration Layer
 * 
 * This module provides DBAL integration using the real DBAL client
 * from dbal/development for development mode and WebSocket connection
 * for production mode.
 */

import { DBALClient, type DBALConfig } from '@/dbal'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Simple in-memory tenant context
interface TenantContext {
  tenantId: string
  userId: string
}

// In-memory tenant manager
class InMemoryTenantManager {
  private tenants = new Map<string, { limits: any }>()

  async createTenant(id: string, limits?: any): Promise<void> {
    this.tenants.set(id, { limits: limits || {} })
  }

  async getTenantContext(tenantId: string, userId: string): Promise<TenantContext | null> {
    if (!this.tenants.has(tenantId)) {
      return null
    }
    return { tenantId, userId }
  }

  hasTenant(id: string): boolean {
    return this.tenants.has(id)
  }
}

// In-memory KV store
class InMemoryKVStore {
  private store = new Map<string, { value: any; expiry?: number }>()

  private getKey(key: string, context: TenantContext): string {
    return `${context.tenantId}:${key}`
  }

  async set(key: string, value: any, context: TenantContext, ttl?: number): Promise<void> {
    const fullKey = this.getKey(key, context)
    const expiry = ttl ? Date.now() + ttl * 1000 : undefined
    this.store.set(fullKey, { value, expiry })
  }

  async get(key: string, context: TenantContext): Promise<any | null> {
    const fullKey = this.getKey(key, context)
    const item = this.store.get(fullKey)
    if (!item) return null
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(fullKey)
      return null
    }
    return item.value
  }

  async delete(key: string, context: TenantContext): Promise<boolean> {
    const fullKey = this.getKey(key, context)
    return this.store.delete(fullKey)
  }

  async listAdd(key: string, items: any[], context: TenantContext): Promise<void> {
    const fullKey = this.getKey(key, context)
    const existing = this.store.get(fullKey)?.value || []
    this.store.set(fullKey, { value: [...existing, ...items] })
  }

  async listGet(key: string, context: TenantContext, start?: number, end?: number): Promise<any[]> {
    const fullKey = this.getKey(key, context)
    const list = this.store.get(fullKey)?.value || []
    if (start !== undefined && end !== undefined) {
      return list.slice(start, end)
    }
    return list
  }
}

// In-memory blob storage
class InMemoryBlobStorage {
  private blobs = new Map<string, { data: Buffer; metadata: Record<string, string> }>()

  async upload(key: string, data: Buffer, metadata?: Record<string, string>): Promise<void> {
    this.blobs.set(key, { data, metadata: metadata || {} })
  }

  async download(key: string): Promise<Buffer> {
    const blob = this.blobs.get(key)
    if (!blob) throw new Error(`Blob not found: ${key}`)
    return blob.data
  }

  async delete(key: string): Promise<void> {
    this.blobs.delete(key)
  }

  async list(options?: { prefix?: string }): Promise<{ items: { key: string }[] }> {
    const items: { key: string }[] = []
    for (const key of this.blobs.keys()) {
      if (!options?.prefix || key.startsWith(options.prefix)) {
        items.push({ key })
      }
    }
    return { items }
  }

  async getMetadata(key: string): Promise<{ customMetadata?: Record<string, string> }> {
    const blob = this.blobs.get(key)
    return { customMetadata: blob?.metadata }
  }
}

// DBAL Error types
export enum DBALErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class DBALError extends Error {
  code: DBALErrorCode

  constructor(message: string, code: DBALErrorCode) {
    super(message)
    this.code = code
    this.name = 'DBALError'
  }
}

/**
 * DBAL Integration Manager
 */
export class DBALIntegration {
  private static instance: DBALIntegration | null = null
  private client: DBALClient | null = null
  private tenantManager: InMemoryTenantManager | null = null
  private kvStore: InMemoryKVStore | null = null
  private blobStorage: InMemoryBlobStorage | null = null
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
      await this.tenantManager.createTenant('default', {
        maxBlobStorageBytes: 1024 * 1024 * 1024,
        maxRecords: 100000,
      })

      // Initialize KV store
      this.kvStore = new InMemoryKVStore()

      // Initialize blob storage
      this.blobStorage = new InMemoryBlobStorage()

      // Initialize DBAL client
      const dbalConfig: DBALConfig = {
        mode: 'development',
        adapter: 'stub',
        ...config,
      }

      this.client = new DBALClient(dbalConfig)

      this.initialized = true
      console.log('DBAL Integration initialized successfully (stub mode)')
    } catch (error) {
      console.error('Failed to initialize DBAL:', error)
      throw error
    }
  }

  getClient(): DBALClient {
    if (!this.client) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.client
  }

  getTenantManager(): InMemoryTenantManager {
    if (!this.tenantManager) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.tenantManager
  }

  getKVStore(): InMemoryKVStore {
    if (!this.kvStore) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.kvStore
  }

  getBlobStorage(): InMemoryBlobStorage {
    if (!this.blobStorage) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.blobStorage
  }

  isInitialized(): boolean {
    return this.initialized
  }

  reset(): void {
    this.client = null
    this.tenantManager = null
    this.kvStore = null
    this.blobStorage = null
    this.initialized = false
  }

  // KV Store operations
  async kvSet(key: string, value: any, ttl?: number, tenantId = 'default', userId = 'system'): Promise<void> {
    if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
    const context = await this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) throw new Error(`Tenant not found: ${tenantId}`)
    await this.kvStore.set(key, value, context, ttl)
  }

  async kvGet<T = any>(key: string, tenantId = 'default', userId = 'system'): Promise<T | null> {
    if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
    const context = await this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) throw new Error(`Tenant not found: ${tenantId}`)
    return this.kvStore.get(key, context) as T | null
  }

  async kvDelete(key: string, tenantId = 'default', userId = 'system'): Promise<boolean> {
    if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
    const context = await this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) throw new Error(`Tenant not found: ${tenantId}`)
    return this.kvStore.delete(key, context)
  }

  async kvListAdd(key: string, items: any[], tenantId = 'default', userId = 'system'): Promise<void> {
    if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
    const context = await this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) throw new Error(`Tenant not found: ${tenantId}`)
    await this.kvStore.listAdd(key, items, context)
  }

  async kvListGet(key: string, tenantId = 'default', userId = 'system', start?: number, end?: number): Promise<any[]> {
    if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
    const context = await this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) throw new Error(`Tenant not found: ${tenantId}`)
    return this.kvStore.listGet(key, context, start, end)
  }

  // Blob operations
  async blobUpload(key: string, data: Buffer | Uint8Array, metadata?: Record<string, string>): Promise<void> {
    if (!this.blobStorage) throw new Error('DBAL not initialized')
    await this.blobStorage.upload(key, data as Buffer, metadata)
  }

  async blobDownload(key: string): Promise<Buffer> {
    if (!this.blobStorage) throw new Error('DBAL not initialized')
    return this.blobStorage.download(key)
  }

  async blobDelete(key: string): Promise<void> {
    if (!this.blobStorage) throw new Error('DBAL not initialized')
    await this.blobStorage.delete(key)
  }

  async blobList(prefix?: string): Promise<string[]> {
    if (!this.blobStorage) throw new Error('DBAL not initialized')
    const result = await this.blobStorage.list({ prefix })
    return result.items.map(item => item.key)
  }

  async blobGetMetadata(key: string): Promise<Record<string, string>> {
    if (!this.blobStorage) throw new Error('DBAL not initialized')
    const metadata = await this.blobStorage.getMetadata(key)
    return metadata.customMetadata || {}
  }

  handleError(error: unknown): { message: string; code?: DBALErrorCode } {
    if (error instanceof DBALError) {
      return { message: error.message, code: error.code }
    }
    if (error instanceof Error) {
      return { message: error.message }
    }
    return { message: 'An unknown error occurred' }
  }
}

// Export singleton instance
export const dbal = DBALIntegration.getInstance()
