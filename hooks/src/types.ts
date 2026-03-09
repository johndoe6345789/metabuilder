/**
 * @file types.ts
 * @description Shared types for DBAL REST API hooks
 *
 * All database operations go through fetch() to the C++ DBAL REST API:
 * /api/v1/{tenant}/{package}/{entity}
 */

// ---------------------------------------------------------------------------
// Entity types
// ---------------------------------------------------------------------------

export type EntityId = string

export interface BaseEntity {
  id: EntityId
  createdAt: string
  updatedAt: string
}

export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: string
}

export interface TenantScopedEntity extends BaseEntity {
  tenantId?: string | null
}

// ---------------------------------------------------------------------------
// List / query types
// ---------------------------------------------------------------------------

export interface ListOptions {
  filter?: Record<string, unknown>
  sort?: Record<string, 'asc' | 'desc'>
  page?: number
  limit?: number
}

export interface ListResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ---------------------------------------------------------------------------
// Bulk operation types
// ---------------------------------------------------------------------------

export interface BulkCreateResult {
  created: number
}

export interface BulkUpdateResult {
  updated: number
}

export interface BulkDeleteResult {
  deleted: number
}

// ---------------------------------------------------------------------------
// REST API response envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export enum DBALErrorCode {
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  VALIDATION_ERROR = 422,
  RATE_LIMIT_EXCEEDED = 429,
  INTERNAL_ERROR = 500,
  TIMEOUT = 504,
  DATABASE_ERROR = 503,
  CAPABILITY_NOT_SUPPORTED = 501,
}

export class DBALError extends Error {
  constructor(
    public code: DBALErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'DBALError'
  }

  static fromResponse(status: number, message: string, details?: Record<string, unknown>): DBALError {
    const code = Object.values(DBALErrorCode).includes(status)
      ? (status as DBALErrorCode)
      : DBALErrorCode.INTERNAL_ERROR
    return new DBALError(code, message, details)
  }

  static notFound(message = 'Resource not found'): DBALError {
    return new DBALError(DBALErrorCode.NOT_FOUND, message)
  }

  static validationError(message: string, fields?: Array<{ field: string; error: string }>): DBALError {
    return new DBALError(DBALErrorCode.VALIDATION_ERROR, message, { fields })
  }
}

// ---------------------------------------------------------------------------
// Blob storage types
// ---------------------------------------------------------------------------

export interface BlobMetadata {
  key: string
  size: number
  contentType: string
  etag: string
  lastModified: string
  customMetadata?: Record<string, string>
}

export interface BlobListResult {
  items: BlobMetadata[]
  nextToken?: string
  isTruncated: boolean
}

export interface BlobListOptions {
  prefix?: string
  continuationToken?: string
  maxKeys?: number
}

export interface BlobUploadOptions {
  contentType?: string
  metadata?: Record<string, string>
  overwrite?: boolean
}

// ---------------------------------------------------------------------------
// KV store types
// ---------------------------------------------------------------------------

export type StorableValue = string | number | boolean | null | object | StorableValue[]

export interface KVEntry {
  key: string
  value: StorableValue
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
  sizeBytes: number
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface KVListOptions {
  prefix?: string
  limit?: number
  cursor?: string
}

export interface KVListResult {
  entries: KVEntry[]
  nextCursor?: string
  hasMore: boolean
}

// ---------------------------------------------------------------------------
// Hook state types
// ---------------------------------------------------------------------------

export interface AsyncState<T> {
  data: T | undefined
  loading: boolean
  error: Error | undefined
}

// ---------------------------------------------------------------------------
// Offline sync types
// ---------------------------------------------------------------------------

/** Sync status for records stored in IndexedDB */
export type SyncStatus = 'synced' | 'pending-create' | 'pending-update' | 'pending-delete'

/** A queued mutation waiting to be synced to the REST API */
export interface SyncQueueEntry {
  /** Unique queue entry ID */
  id: string
  /** Entity name (e.g. 'user', 'workflow') */
  entity: string
  /** Type of mutation */
  operation: 'create' | 'update' | 'delete'
  /** Payload data for the mutation (record data for create/update, record ID for delete) */
  data: Record<string, unknown>
  /** Timestamp when the mutation was queued */
  timestamp: number
  /** Number of sync retry attempts */
  retries: number
}

/** State returned by the useOfflineSync hook */
export interface OfflineSyncState {
  /** Whether the REST API is reachable */
  isOnline: boolean
  /** Number of mutations waiting to sync */
  pendingCount: number
  /** Timestamp of last successful sync flush */
  lastSyncAt: Date | null
}

// ---------------------------------------------------------------------------
// DBAL client config
// ---------------------------------------------------------------------------

export interface DBALClientConfig {
  /** Base URL for the C++ DBAL REST API (default: '' for same-origin) */
  baseUrl?: string
  /** Default tenant ID */
  tenant?: string
  /** Default package ID */
  packageId?: string
  /** Default headers to include in all requests */
  headers?: Record<string, string>
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number
  /** Called when a request fails due to a network error */
  onRequestError?: (reason: 'offline' | 'timeout' | 'unknown') => void
}
