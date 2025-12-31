/**
 * Key-Value Store with Multi-Tenant Support
 * 
 * Stores primitive types (string, number, boolean) and complex types (objects, arrays)
 * with tenant isolation, access control, and quota management.
 */

import { TenantContext } from './tenant-context'
import { DBALError } from './errors'

export type StorableValue = string | number | boolean | null | object | Array<any>

export interface KVStoreEntry {
  key: string
  value: StorableValue
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
  sizeBytes: number
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface KVListOptions {
  prefix?: string
  limit?: number
  cursor?: string
}

export interface KVListResult {
  entries: KVStoreEntry[]
  nextCursor?: string
  hasMore: boolean
}

export interface KVStore {
  // Basic operations
  get(key: string, context: TenantContext): Promise<StorableValue | null>
  set(key: string, value: StorableValue, context: TenantContext, ttl?: number): Promise<void>
  delete(key: string, context: TenantContext): Promise<boolean>
  exists(key: string, context: TenantContext): Promise<boolean>
  
  // List operations
  listAdd(key: string, items: any[], context: TenantContext): Promise<number>
  listGet(key: string, context: TenantContext, start?: number, end?: number): Promise<any[]>
  listRemove(key: string, value: any, context: TenantContext): Promise<number>
  listLength(key: string, context: TenantContext): Promise<number>
  listClear(key: string, context: TenantContext): Promise<void>
  
  // Batch operations
  mget(keys: string[], context: TenantContext): Promise<Map<string, StorableValue | null>>
  mset(entries: Map<string, StorableValue>, context: TenantContext): Promise<void>
  
  // Query operations
  list(options: KVListOptions, context: TenantContext): Promise<KVListResult>
  count(prefix: string, context: TenantContext): Promise<number>
  
  // Utility
  clear(context: TenantContext): Promise<number>
}

export class InMemoryKVStore implements KVStore {
  private data = new Map<string, KVStoreEntry>()
  
  private getScopedKey(key: string, context: TenantContext): string {
    return `${context.namespace}${key}`
  }
  
  private calculateSize(value: StorableValue): number {
    if (value === null || value === undefined) return 0
    if (typeof value === 'string') return value.length * 2 // UTF-16
    if (typeof value === 'number') return 8
    if (typeof value === 'boolean') return 1
    return JSON.stringify(value).length * 2
  }
  
  private getValueType(value: StorableValue): KVStoreEntry['type'] {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value as 'string' | 'number' | 'boolean' | 'object'
  }
  
  async get(key: string, context: TenantContext): Promise<StorableValue | null> {
    if (!context.canRead('kv')) {
      throw DBALError.forbidden('Permission denied: cannot read key-value data')
    }
    
    const scopedKey = this.getScopedKey(key, context)
    const entry = this.data.get(scopedKey)
    
    if (!entry) return null
    
    // Check expiration
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.data.delete(scopedKey)
      return null
    }
    
    return entry.value
  }
  
  async set(key: string, value: StorableValue, context: TenantContext, ttl?: number): Promise<void> {
    if (!context.canWrite('kv')) {
      throw DBALError.forbidden('Permission denied: cannot write key-value data')
    }
    
    const scopedKey = this.getScopedKey(key, context)
    const sizeBytes = this.calculateSize(value)
    
    // Check quota
    const existing = this.data.get(scopedKey)
    const sizeDelta = existing ? sizeBytes - existing.sizeBytes : sizeBytes
    
    if (sizeDelta > 0 && context.quota.maxDataSizeBytes) {
      if (context.quota.currentDataSizeBytes + sizeDelta > context.quota.maxDataSizeBytes) {
        throw DBALError.forbidden('Quota exceeded: maximum data size reached')
      }
    }
    
    if (!existing && !context.canCreateRecord()) {
      throw DBALError.forbidden('Quota exceeded: maximum record count reached')
    }
    
    const now = new Date()
    const entry: KVStoreEntry = {
      key,
      value,
      type: this.getValueType(value),
      sizeBytes,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      expiresAt: ttl ? new Date(now.getTime() + ttl * 1000) : undefined
    }
    
    this.data.set(scopedKey, entry)
    
    // Update quota (would normally be done by TenantManager)
    if (sizeDelta > 0) {
      context.quota.currentDataSizeBytes += sizeDelta
    }
    if (!existing) {
      context.quota.currentRecords++
    }
  }
  
  async delete(key: string, context: TenantContext): Promise<boolean> {
    if (!context.canDelete('kv')) {
      throw DBALError.forbidden('Permission denied: cannot delete key-value data')
    }
    
    const scopedKey = this.getScopedKey(key, context)
    const entry = this.data.get(scopedKey)
    
    if (!entry) return false
    
    this.data.delete(scopedKey)
    
    // Update quota
    context.quota.currentDataSizeBytes -= entry.sizeBytes
    context.quota.currentRecords--
    
    return true
  }
  
  async exists(key: string, context: TenantContext): Promise<boolean> {
    if (!context.canRead('kv')) {
      throw DBALError.forbidden('Permission denied: cannot read key-value data')
    }
    
    const value = await this.get(key, context)
    return value !== null
  }
  
  // List operations
  async listAdd(key: string, items: any[], context: TenantContext): Promise<number> {
    if (!context.canWrite('kv')) {
      throw DBALError.forbidden('Permission denied: cannot write key-value data')
    }
    
    if (!context.canAddToList(items.length)) {
      throw DBALError.forbidden('Quota exceeded: list length limit reached')
    }
    
    const existing = await this.get(key, context)
    const list = Array.isArray(existing) ? existing : []
    list.push(...items)
    
    await this.set(key, list, context)
    return list.length
  }
  
  async listGet(key: string, context: TenantContext, start: number = 0, end?: number): Promise<any[]> {
    const value = await this.get(key, context)
    if (!Array.isArray(value)) return []
    
    if (end === undefined) {
      return value.slice(start)
    }
    return value.slice(start, end)
  }
  
  async listRemove(key: string, valueToRemove: any, context: TenantContext): Promise<number> {
    if (!context.canWrite('kv')) {
      throw DBALError.forbidden('Permission denied: cannot write key-value data')
    }
    
    const existing = await this.get(key, context)
    if (!Array.isArray(existing)) return 0
    
    const filtered = existing.filter(item => !this.deepEquals(item, valueToRemove))
    const removed = existing.length - filtered.length
    
    if (removed > 0) {
      await this.set(key, filtered, context)
    }
    
    return removed
  }
  
  async listLength(key: string, context: TenantContext): Promise<number> {
    const value = await this.get(key, context)
    return Array.isArray(value) ? value.length : 0
  }
  
  async listClear(key: string, context: TenantContext): Promise<void> {
    await this.set(key, [], context)
  }
  
  // Batch operations
  async mget(keys: string[], context: TenantContext): Promise<Map<string, StorableValue | null>> {
    const result = new Map<string, StorableValue | null>()
    
    for (const key of keys) {
      const value = await this.get(key, context)
      result.set(key, value)
    }
    
    return result
  }
  
  async mset(entries: Map<string, StorableValue>, context: TenantContext): Promise<void> {
    for (const [key, value] of entries) {
      await this.set(key, value, context)
    }
  }
  
  // Query operations
  async list(options: KVListOptions, context: TenantContext): Promise<KVListResult> {
    if (!context.canRead('kv')) {
      throw DBALError.forbidden('Permission denied: cannot read key-value data')
    }
    
    const prefix = options.prefix || ''
    const limit = options.limit || 100
    const scopedPrefix = this.getScopedKey(prefix, context)
    
    const entries: KVStoreEntry[] = []
    
    for (const [scopedKey, entry] of this.data) {
      if (scopedKey.startsWith(scopedPrefix)) {
        // Skip expired entries
        if (entry.expiresAt && entry.expiresAt < new Date()) {
          continue
        }
        entries.push(entry)
        
        if (entries.length >= limit) break
      }
    }
    
    return {
      entries,
      hasMore: false, // Simplified for in-memory implementation
      nextCursor: undefined
    }
  }
  
  async count(prefix: string, context: TenantContext): Promise<number> {
    const result = await this.list({ prefix, limit: Number.MAX_SAFE_INTEGER }, context)
    return result.entries.length
  }
  
  async clear(context: TenantContext): Promise<number> {
    if (!context.canDelete('kv')) {
      throw DBALError.forbidden('Permission denied: cannot delete key-value data')
    }
    
    const scopedPrefix = this.getScopedKey('', context)
    let count = 0
    
    for (const [scopedKey] of this.data) {
      if (scopedKey.startsWith(scopedPrefix)) {
        this.data.delete(scopedKey)
        count++
      }
    }
    
    // Reset quota
    context.quota.currentDataSizeBytes = 0
    context.quota.currentRecords = 0
    
    return count
  }
  
  private deepEquals(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b)
  }
}
