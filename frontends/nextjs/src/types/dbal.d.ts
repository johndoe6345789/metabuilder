/**
 * DBAL type stubs
 * These types are used when the full DBAL module is not available
 * The actual implementation lives in ../../dbal/development/src
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '@/dbal/development/src' {
  export interface DBALConfig {
    mode?: 'development' | 'production'
    adapter?: string
    auth?: any
    database?: {
      url?: string
    }
    security?: {
      sandbox?: 'strict' | 'permissive' | 'disabled'
      enableAuditLog?: boolean
    }
    [key: string]: any
  }

  export interface DBALUser {
    id: string
    email: string
    name?: string
    username?: string
    level?: number
    role?: string
    tenantId?: string
    createdAt?: number | string | Date
    [key: string]: any
  }

  export interface ListResult<T> {
    data: T[]
    total?: number
  }

  export interface UsersAPI {
    list(): Promise<ListResult<DBALUser>>
    create(data: Partial<DBALUser>): Promise<DBALUser>
    update(id: string, data: Partial<DBALUser>): Promise<DBALUser>
    delete(id: string): Promise<boolean>
  }

  export class DBALClient {
    users: UsersAPI
    constructor(config: DBALConfig)
    query<T>(sql: string, params?: unknown[]): Promise<T[]>
    execute(sql: string, params?: unknown[]): Promise<void>
    capabilities(): Promise<Record<string, boolean>>
  }

  export class DBALError extends Error {
    code: DBALErrorCode
    message: string
    constructor(message: string, code: DBALErrorCode)
  }

  export enum DBALErrorCode {
    UNKNOWN = 'UNKNOWN',
    CONNECTION_ERROR = 'CONNECTION_ERROR',
    QUERY_ERROR = 'QUERY_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
  }
}

declare module '@/dbal/development/src/core/types' {
  export interface User {
    id: string
    email: string
    name?: string
    level: number
    tenantId: string
  }
}

declare module '@/dbal/development/src/core/tenant-context' {
  export interface TenantContext {
    tenantId: string
    userId?: string
  }

  export class InMemoryTenantManager {
    setCurrentTenant(tenantId: string): void
    getCurrentTenant(): string | null
    createTenant(id: string, metadata: Record<string, any>, ...args: any[]): Promise<void>
    getTenantContext(tenantId: string, userId?: string): Promise<TenantContext>
  }
}

declare module '@/dbal/development/src/core/kv-store' {
  import type { TenantContext } from '@/dbal/development/src/core/tenant-context'

  export class InMemoryKVStore {
    get<T>(key: string, context?: TenantContext): Promise<T | null>
    set<T>(key: string, value: T, context?: TenantContext, ttl?: number): Promise<void>
    delete(key: string, context?: TenantContext): Promise<boolean>
    listAdd(key: string, items: any[], context?: TenantContext): Promise<void>
    listGet(key: string, context?: TenantContext, start?: number, end?: number): Promise<any[]>
  }
}

declare module '@/dbal/development/src/blob' {
  export interface BlobStorageConfig {
    type: 'filesystem' | 'memory' | 's3'
    basePath?: string
  }

  export interface BlobMetadata {
    contentType?: string
    size?: number
    lastModified?: Date
    [key: string]: any
  }

  export interface BlobListItem {
    key: string
    [key: string]: any
  }

  export interface BlobListResult {
    items: BlobListItem[]
    [key: string]: any
  }

  export interface BlobStorage {
    upload(key: string, data: Buffer | string, metadata?: BlobMetadata): Promise<string>
    download(key: string): Promise<Buffer>
    delete(key: string): Promise<void>
    exists(key: string): Promise<boolean>
    list(options?: { prefix?: string }): Promise<BlobListResult>
    getMetadata(key: string): Promise<BlobMetadata | null>
  }

  export function createBlobStorage(config: BlobStorageConfig): BlobStorage
}

declare module '@/dbal/development/src/blob/tenant-aware-storage' {
  import type { BlobStorage, BlobMetadata, BlobListResult } from '@/dbal/development/src/blob'
  import type { InMemoryTenantManager } from '@/dbal/development/src/core/tenant-context'
  
  export class TenantAwareBlobStorage implements BlobStorage {
    constructor(storage: BlobStorage, tenantManager: InMemoryTenantManager, ...args: any[])
    upload(key: string, data: Buffer | string, metadata?: BlobMetadata): Promise<string>
    download(key: string): Promise<Buffer>
    delete(key: string): Promise<void>
    exists(key: string): Promise<boolean>
    list(options?: { prefix?: string }): Promise<BlobListResult>
    getMetadata(key: string): Promise<BlobMetadata | null>
  }
}
