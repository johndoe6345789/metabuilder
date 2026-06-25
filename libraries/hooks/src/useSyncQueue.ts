/**
 * @file useSyncQueue.ts
 * @description Mutation sync queue backed by IndexedDB.
 *
 * NOT a React hook — this is a singleton class that stores pending mutations
 * (create / update / delete) in the IndexedDB '_sync_queue' object store.
 * When connectivity returns, the queue is flushed in FIFO order against
 * the REST API.
 *
 * SSR-safe: all operations resolve gracefully when IndexedDB is unavailable.
 */

import type { SyncQueueEntry } from './types'
import { OfflineStore } from './useIndexedDB'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORE_NAME = '_sync_queue'
const MAX_RETRIES = 5

// ---------------------------------------------------------------------------
// SyncQueue
// ---------------------------------------------------------------------------

/**
 * Singleton queue for pending offline mutations.
 *
 * Each entry records the entity, operation, data payload, and a retry counter.
 * Flushing replays mutations in timestamp order against the live REST API.
 *
 * @example
 * const queue = SyncQueue.getInstance()
 * await queue.enqueue({ entity: 'user', operation: 'create', data: { name: 'Alice' } })
 * console.log(await queue.count()) // 1
 * await queue.flush(async (method, url, body) => fetch(url, { method, body }))
 */
export class SyncQueue {
  private static instance: SyncQueue | null = null

  private constructor() {}

  /** Get the singleton SyncQueue instance */
  static getInstance(): SyncQueue {
    if (!SyncQueue.instance) {
      SyncQueue.instance = new SyncQueue()
    }
    return SyncQueue.instance
  }

  /**
   * Reset the singleton (for testing purposes only).
   */
  static resetInstance(): void {
    SyncQueue.instance = null
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private get store(): OfflineStore {
    return OfflineStore.getInstance()
  }

  /**
   * Check if IndexedDB is available in the current environment.
   */
  private isAvailable(): boolean {
    return typeof indexedDB !== 'undefined'
  }

  /**
   * Generate a unique ID for a queue entry.
   */
  private generateId(): string {
    return `sq_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  /**
   * Low-level access to the _sync_queue store via the OfflineStore's
   * underlying IndexedDB. We go through OfflineStore to reuse its
   * connection management and store creation logic.
   */
  private async getAllEntries(): Promise<SyncQueueEntry[]> {
    const records = await this.store.getAll(STORE_NAME)
    // Map OfflineRecord back to SyncQueueEntry shape
    return records.map((r) => ({
      id: r.id,
      entity: r.entity as string,
      operation: r.operation as SyncQueueEntry['operation'],
      data: r.data as Record<string, unknown>,
      timestamp: r.timestamp as number,
      retries: r.retries as number,
    }))
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Add a mutation to the sync queue.
   *
   * @param mutation - The mutation to enqueue (entity, operation, data).
   * @returns The created queue entry, or undefined if IndexedDB is unavailable.
   */
  async enqueue(
    mutation: Pick<SyncQueueEntry, 'entity' | 'operation' | 'data'>
  ): Promise<SyncQueueEntry | undefined> {
    if (!this.isAvailable()) return undefined

    const entry: SyncQueueEntry = {
      id: this.generateId(),
      entity: mutation.entity,
      operation: mutation.operation,
      data: mutation.data,
      timestamp: Date.now(),
      retries: 0,
    }

    // Store as an OfflineRecord in the _sync_queue store
    await this.store.put(STORE_NAME, {
      id: entry.id,
      entity: entry.entity,
      operation: entry.operation,
      data: entry.data,
      timestamp: entry.timestamp,
      retries: entry.retries,
      _syncStatus: 'synced', // Not used for queue entries, but required by OfflineStore
    })

    return entry
  }

  /**
   * Remove and return the oldest pending mutation from the queue.
   */
  async dequeue(): Promise<SyncQueueEntry | undefined> {
    if (!this.isAvailable()) return undefined

    const entries = await this.getAllEntries()
    if (entries.length === 0) return undefined

    // Sort by timestamp ascending (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp)
    const oldest = entries[0]

    await this.store.delete(STORE_NAME, oldest.id)
    return oldest
  }

  /**
   * Peek at the oldest pending mutation without removing it.
   */
  async peek(): Promise<SyncQueueEntry | undefined> {
    if (!this.isAvailable()) return undefined

    const entries = await this.getAllEntries()
    if (entries.length === 0) return undefined

    entries.sort((a, b) => a.timestamp - b.timestamp)
    return entries[0]
  }

  /**
   * Replay all queued mutations against the REST API in FIFO order.
   *
   * @param requestFn - Function that sends a single mutation to the REST API.
   *   Receives (entity, operation, data) and should throw on failure.
   * @returns Number of successfully flushed mutations.
   */
  async flush(
    requestFn: (
      entity: string,
      operation: SyncQueueEntry['operation'],
      data: Record<string, unknown>
    ) => Promise<unknown>
  ): Promise<number> {
    if (!this.isAvailable()) return 0

    const entries = await this.getAllEntries()
    if (entries.length === 0) return 0

    // Sort by timestamp ascending
    entries.sort((a, b) => a.timestamp - b.timestamp)

    let flushed = 0

    for (const entry of entries) {
      try {
        await requestFn(entry.entity, entry.operation, entry.data)

        // Success: remove from queue
        await this.store.delete(STORE_NAME, entry.id)
        flushed++
      } catch {
        // Failure: increment retry count
        const newRetries = entry.retries + 1

        if (newRetries >= MAX_RETRIES) {
          // Exceeded max retries: discard the entry
          await this.store.delete(STORE_NAME, entry.id)
        } else {
          // Update retry count
          await this.store.put(STORE_NAME, {
            id: entry.id,
            entity: entry.entity,
            operation: entry.operation,
            data: entry.data,
            timestamp: entry.timestamp,
            retries: newRetries,
            _syncStatus: 'synced',
          })
        }

        // Stop flushing on first failure to maintain order
        break
      }
    }

    return flushed
  }

  /**
   * Get the number of pending mutations in the queue.
   */
  async count(): Promise<number> {
    if (!this.isAvailable()) return 0
    return this.store.count(STORE_NAME)
  }

  /**
   * Clear all pending mutations from the queue.
   */
  async clear(): Promise<void> {
    if (!this.isAvailable()) return
    await this.store.clear(STORE_NAME)
  }
}
