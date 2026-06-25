/**
 * @file useIndexedDB.ts
 * @description IndexedDB storage engine for offline DBAL entity caching.
 *
 * NOT a React hook — this is an imperative singleton class that manages
 * a local IndexedDB database ('metabuilder-offline') for offline-first
 * reads and writes. Object stores are created dynamically per entity.
 *
 * SSR-safe: returns empty results when IndexedDB is unavailable.
 */

import type { SyncStatus } from './types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A record stored in the offline IndexedDB with sync metadata */
export interface OfflineRecord {
  /** Entity record ID */
  id: string
  /** Entity type name (e.g. 'user', 'workflow') */
  _entity: string
  /** Current sync status relative to the REST API */
  _syncStatus: SyncStatus
  /** Timestamp when the record was last modified locally */
  _localUpdatedAt: number
  /** The actual entity data */
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DB_NAME = 'metabuilder-offline'
const DB_VERSION = 1

/**
 * Reserved store for internal bookkeeping (e.g. the sync queue).
 * Entity stores are created dynamically on first access.
 */
const RESERVED_STORE = '_sync_queue'

// ---------------------------------------------------------------------------
// OfflineStore
// ---------------------------------------------------------------------------

/**
 * Singleton IndexedDB storage engine for offline entity caching.
 *
 * Each entity type gets its own object store, created on-demand by
 * bumping the database version. Records are augmented with `_syncStatus`
 * and `_entity` metadata fields.
 *
 * @example
 * const store = OfflineStore.getInstance()
 * await store.put('user', { id: 'u1', name: 'Alice', _syncStatus: 'synced' })
 * const users = await store.getAll('user')
 */
export class OfflineStore {
  private static instance: OfflineStore | null = null

  private db: IDBDatabase | null = null
  private dbPromise: Promise<IDBDatabase | null> | null = null
  private knownStores: Set<string> = new Set()

  private constructor() {}

  /** Get the singleton OfflineStore instance */
  static getInstance(): OfflineStore {
    if (!OfflineStore.instance) {
      OfflineStore.instance = new OfflineStore()
    }
    return OfflineStore.instance
  }

  /**
   * Reset the singleton (for testing purposes only).
   * Closes the database connection and clears the instance.
   */
  static resetInstance(): void {
    if (OfflineStore.instance) {
      OfflineStore.instance.close()
      OfflineStore.instance = null
    }
  }

  // -------------------------------------------------------------------------
  // Connection management
  // -------------------------------------------------------------------------

  /** Check if IndexedDB is available in the current environment */
  private isAvailable(): boolean {
    return typeof indexedDB !== 'undefined'
  }

  /**
   * Open (or reopen) the IndexedDB database, ensuring the given store exists.
   * If the store does not exist yet, the database version is bumped and the
   * store is created in the `onupgradeneeded` callback.
   */
  private async open(storeName?: string): Promise<IDBDatabase | null> {
    if (!this.isAvailable()) return null

    // If we already have a connection and the store exists, reuse it
    if (this.db && (!storeName || this.knownStores.has(storeName))) {
      return this.db
    }

    // If another open is in flight, wait for it then re-check
    if (this.dbPromise) {
      await this.dbPromise
      if (this.db && (!storeName || this.knownStores.has(storeName))) {
        return this.db
      }
    }

    this.dbPromise = this.openInternal(storeName)
    const db = await this.dbPromise
    this.dbPromise = null
    return db
  }

  private openInternal(storeName?: string): Promise<IDBDatabase | null> {
    return new Promise((resolve) => {
      // Close existing connection before version bump
      const prevDbVersion = this.db?.version
      if (this.db) {
        this.db.close()
        this.db = null
      }

      // Determine version: bump if we need a new store
      const nextVersion = prevDbVersion != null
        ? prevDbVersion + 1
        : storeName && !this.knownStores.has(storeName)
          ? (this.knownStores.size + 2) // +1 base, +1 for new store
          : DB_VERSION + this.knownStores.size

      let request: IDBOpenDBRequest
      try {
        request = indexedDB.open(DB_NAME, nextVersion)
      } catch {
        resolve(null)
        return
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create the reserved sync queue store if missing
        if (!db.objectStoreNames.contains(RESERVED_STORE)) {
          const syncStore = db.createObjectStore(RESERVED_STORE, { keyPath: 'id' })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Create the requested entity store if missing
        if (storeName && !db.objectStoreNames.contains(storeName)) {
          const entityStore = db.createObjectStore(storeName, { keyPath: 'id' })
          entityStore.createIndex('_syncStatus', '_syncStatus', { unique: false })
          entityStore.createIndex('_localUpdatedAt', '_localUpdatedAt', { unique: false })
        }
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result

        // Track all known stores
        const storeNames = this.db.objectStoreNames
        for (let i = 0; i < storeNames.length; i++) {
          this.knownStores.add(storeNames[i])
        }

        this.db.onversionchange = () => {
          this.db?.close()
          this.db = null
        }

        resolve(this.db)
      }

      request.onerror = () => {
        resolve(null)
      }

      request.onblocked = () => {
        resolve(null)
      }
    })
  }

  /** Close the database connection */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Ensure the database is open and the requested store exists.
   * Returns the database or null if unavailable.
   */
  private async ensureStore(storeName: string): Promise<IDBDatabase | null> {
    return this.open(storeName)
  }

  /**
   * Execute a transaction-based operation and return a promise for the result.
   */
  private transact<R>(
    storeName: string,
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => IDBRequest<R>
  ): Promise<R | undefined> {
    return new Promise(async (resolve) => {
      const db = await this.ensureStore(storeName)
      if (!db) {
        resolve(undefined)
        return
      }

      try {
        const tx = db.transaction(storeName, mode)
        const store = tx.objectStore(storeName)
        const req = fn(store)

        req.onsuccess = () => resolve(req.result)
        req.onerror = () => resolve(undefined)
      } catch {
        resolve(undefined)
      }
    })
  }

  // -------------------------------------------------------------------------
  // CRUD operations
  // -------------------------------------------------------------------------

  /**
   * Get all records for an entity, optionally filtered by sync status.
   */
  async getAll(entity: string, syncStatus?: SyncStatus): Promise<OfflineRecord[]> {
    const db = await this.ensureStore(entity)
    if (!db) return []

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(entity, 'readonly')
        const store = tx.objectStore(entity)

        let req: IDBRequest

        if (syncStatus) {
          const index = store.index('_syncStatus')
          req = index.getAll(syncStatus)
        } else {
          req = store.getAll()
        }

        req.onsuccess = () => resolve((req.result as OfflineRecord[]) ?? [])
        req.onerror = () => resolve([])
      } catch {
        resolve([])
      }
    })
  }

  /**
   * Get a single record by entity type and ID.
   */
  async get(entity: string, id: string): Promise<OfflineRecord | undefined> {
    const result = await this.transact(entity, 'readonly', (store) => store.get(id))
    return result as OfflineRecord | undefined
  }

  /**
   * Put (create or update) a record in the entity store.
   * Automatically sets `_entity` and `_localUpdatedAt`.
   */
  async put(entity: string, record: Partial<OfflineRecord> & { id: string; _syncStatus: SyncStatus }): Promise<OfflineRecord | undefined> {
    const fullRecord: OfflineRecord = {
      ...record,
      _entity: entity,
      _localUpdatedAt: Date.now(),
    } as OfflineRecord

    await this.transact(entity, 'readwrite', (store) => store.put(fullRecord))
    return fullRecord
  }

  /**
   * Put multiple records in a single transaction.
   */
  async putMany(entity: string, records: Array<Partial<OfflineRecord> & { id: string; _syncStatus: SyncStatus }>): Promise<void> {
    const db = await this.ensureStore(entity)
    if (!db) return

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(entity, 'readwrite')
        const store = tx.objectStore(entity)
        const now = Date.now()

        for (const record of records) {
          const fullRecord: OfflineRecord = {
            ...record,
            _entity: entity,
            _localUpdatedAt: now,
          } as OfflineRecord
          store.put(fullRecord)
        }

        tx.oncomplete = () => resolve()
        tx.onerror = () => resolve()
      } catch {
        resolve()
      }
    })
  }

  /**
   * Delete a record by entity type and ID.
   */
  async delete(entity: string, id: string): Promise<boolean> {
    const result = await this.transact(entity, 'readwrite', (store) => store.delete(id))
    return result !== undefined
  }

  /**
   * Clear all records for an entity.
   */
  async clear(entity: string): Promise<void> {
    await this.transact(entity, 'readwrite', (store) => store.clear())
  }

  /**
   * Count records for an entity, optionally filtered by sync status.
   */
  async count(entity: string, syncStatus?: SyncStatus): Promise<number> {
    const db = await this.ensureStore(entity)
    if (!db) return 0

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(entity, 'readonly')
        const store = tx.objectStore(entity)

        let req: IDBRequest<number>

        if (syncStatus) {
          const index = store.index('_syncStatus')
          req = index.count(syncStatus)
        } else {
          req = store.count()
        }

        req.onsuccess = () => resolve(req.result ?? 0)
        req.onerror = () => resolve(0)
      } catch {
        resolve(0)
      }
    })
  }
}
