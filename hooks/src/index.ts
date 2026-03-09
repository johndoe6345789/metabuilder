/**
 * @file index.ts
 * @description Shared hooks — DBAL REST API + generic UI hooks
 *
 * DBAL hooks call the C++ DBAL REST API via fetch().
 * Client-side persistence is handled by redux-persist (IndexedDB).
 * UI hooks are framework-agnostic React utilities for common patterns.
 */

// Generic UI hooks
export {
  useDialogState,
  useMultipleDialogs,
  useFocusState,
  useCopyState,
  useIsMobile,
  usePasswordVisibility,
  usePopoverState,
  useTabNavigation,
  useAccordion,
  useLastSaved,
  useFormatValue,
  useImageState,
  useActiveSelection,
} from './ui'

// Blob storage hook
export { useBlobStorage } from './useBlobStorage'
export type { UseBlobStorageReturn } from './useBlobStorage'

// KV store hook
export { useKVStore } from './useKVStore'
export type { UseKVStoreReturn } from './useKVStore'

// Offline sync hook
export { useOfflineSync } from './useOfflineSync'
export type { UseOfflineSyncReturn } from './useOfflineSync'

// Offline storage and sync queue classes (for advanced usage)
export { OfflineStore } from './useIndexedDB'
export type { OfflineRecord } from './useIndexedDB'
export { SyncQueue } from './useSyncQueue'

// Shared types
export type {
  EntityId,
  BaseEntity,
  SoftDeletableEntity,
  TenantScopedEntity,
  ListOptions,
  ListResult,
  BulkCreateResult,
  BulkUpdateResult,
  BulkDeleteResult,
  ApiResponse,
  BlobMetadata,
  BlobListResult,
  BlobListOptions,
  BlobUploadOptions,
  StorableValue,
  KVEntry,
  KVListOptions,
  KVListResult,
  AsyncState,
  DBALClientConfig,
  SyncStatus,
  SyncQueueEntry,
  OfflineSyncState,
} from './types'

// Error classes and enums (re-exported for consumers that need error handling)
export { DBALError, DBALErrorCode } from './types'

// Server-side DBAL client removed — use Redux useDBAL for client-side,
// plain fetch for API routes (see frontends/nextjs/src/lib/db-client.ts)
