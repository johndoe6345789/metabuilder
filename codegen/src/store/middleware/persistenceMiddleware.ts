import { Middleware } from '@reduxjs/toolkit'
import { db } from '@/lib/db'
import { syncToFlask } from './flaskSync'
import { RootState } from '../index'
import {
  persistenceBulkActionNames,
  persistenceDeleteActionNames,
  persistenceSingleItemActionNames,
} from '../actionNames'

interface PersistenceConfig {
  storeName: string
  enabled: boolean
  syncToFlask: boolean
  debounceMs: number
  batchSize: number
}

const defaultConfig: PersistenceConfig = {
  storeName: '',
  enabled: true,
  syncToFlask: true,
  debounceMs: 300,
  batchSize: 10,
}

const sliceToPersistenceMap: Record<string, PersistenceConfig> = {
  files: { ...defaultConfig, storeName: 'files' },
  models: { ...defaultConfig, storeName: 'models' },
  components: { ...defaultConfig, storeName: 'components' },
  componentTrees: { ...defaultConfig, storeName: 'componentTrees' },
  workflows: { ...defaultConfig, storeName: 'workflows' },
  lambdas: { ...defaultConfig, storeName: 'lambdas' },
  theme: { ...defaultConfig, storeName: 'theme' },
  settings: { ...defaultConfig, storeName: 'settings', syncToFlask: false },
}

type PendingOperation = {
  type: 'put' | 'delete'
  storeName: string
  key: string
  value?: any
  timestamp: number
}

type FailedSyncOperation = PendingOperation & {
  attempt: number
  lastError: string
  nextRetryAt: number
}

const MAX_SYNC_RETRIES = 5
const BASE_SYNC_RETRY_DELAY_MS = 1000
const MAX_SYNC_RETRY_DELAY_MS = 30000

class PersistenceQueue {
  private queue: Map<string, PendingOperation> = new Map()
  private processing = false
  private pendingFlush = false
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  private failedSyncs: Map<string, FailedSyncOperation> = new Map()
  private retryTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

  enqueue(operation: PendingOperation, debounceMs: number) {
    const opKey = `${operation.storeName}:${operation.key}`
    
    const existingTimer = this.debounceTimers.get(opKey)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    this.queue.set(opKey, operation)

    const timer = setTimeout(() => {
      this.debounceTimers.delete(opKey)
      this.processQueue()
    }, debounceMs)

    this.debounceTimers.set(opKey, timer)
  }

  async processQueue() {
    if (this.processing) {
      this.pendingFlush = true
      return
    }

    if (this.queue.size === 0) return

    this.processing = true

    try {
      const operations = Array.from(this.queue.values())
      this.queue.clear()

      const results = await Promise.allSettled(
        operations.map(async (op) => {
          try {
            if (op.type === 'put') {
              await db.put(op.storeName as any, op.value)
              await this.syncToFlaskWithRetry(op, op.value)
            } else if (op.type === 'delete') {
              await db.delete(op.storeName as any, op.key)
              await this.syncToFlaskWithRetry(op, null)
            }
          } catch (error) {
            console.error(`[PersistenceMiddleware] Failed to persist ${op.type} for ${op.storeName}:${op.key}`, error)
            throw error
          }
        })
      )

      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) {
        console.warn(`[PersistenceMiddleware] ${failed.length} operations failed`)
      }
    } finally {
      this.processing = false
      const needsFlush = this.pendingFlush || this.queue.size > 0
      this.pendingFlush = false
      if (needsFlush) {
        await this.processQueue()
      }
    }
  }

  getFailedSyncs() {
    return Array.from(this.failedSyncs.values()).sort((a, b) => a.nextRetryAt - b.nextRetryAt)
  }

  async retryFailedSyncs() {
    for (const [opKey, failure] of this.failedSyncs.entries()) {
      if (failure.nextRetryAt <= Date.now()) {
        await this.retryFailedSync(opKey)
      }
    }
  }

  async flush() {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }
    this.debounceTimers.clear()
    await this.processQueue()
  }

  private async syncToFlaskWithRetry(op: PendingOperation, value: any) {
    if (!sliceToPersistenceMap[op.storeName]?.syncToFlask) return

    try {
      await syncToFlask(op.storeName, op.key, value, op.type)
      this.clearSyncFailure(op)
    } catch (error) {
      this.recordSyncFailure(op, error)
      console.warn(
        `[PersistenceMiddleware] Flask sync failed for ${op.storeName}:${op.key} (${op.type}); queued for retry.`,
        error
      )
    }
  }

  private recordSyncFailure(op: PendingOperation, error: unknown) {
    const opKey = this.getFailureKey(op)
    const previous = this.failedSyncs.get(opKey)
    const attempt = previous ? previous.attempt + 1 : 1
    const delayMs = this.getRetryDelayMs(attempt)
    const nextRetryAt = Date.now() + delayMs
    const lastError = error instanceof Error ? error.message : String(error)

    this.failedSyncs.set(opKey, {
      ...op,
      attempt,
      lastError,
      nextRetryAt,
    })

    const existingTimer = this.retryTimers.get(opKey)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    if (attempt <= MAX_SYNC_RETRIES) {
      const timer = setTimeout(() => {
        this.retryTimers.delete(opKey)
        void this.retryFailedSync(opKey)
      }, delayMs)
      this.retryTimers.set(opKey, timer)
    }
  }

  private clearSyncFailure(op: PendingOperation) {
    const opKey = this.getFailureKey(op)
    const timer = this.retryTimers.get(opKey)
    if (timer) {
      clearTimeout(timer)
      this.retryTimers.delete(opKey)
    }
    this.failedSyncs.delete(opKey)
  }

  private async retryFailedSync(opKey: string) {
    const failure = this.failedSyncs.get(opKey)
    if (!failure) return

    if (failure.attempt > MAX_SYNC_RETRIES) {
      return
    }

    this.enqueue(
      {
        type: failure.type,
        storeName: failure.storeName,
        key: failure.key,
        value: failure.value,
        timestamp: Date.now(),
      },
      0
    )
  }

  private getRetryDelayMs(attempt: number) {
    const delay = BASE_SYNC_RETRY_DELAY_MS * Math.pow(2, attempt - 1)
    return Math.min(delay, MAX_SYNC_RETRY_DELAY_MS)
  }

  private getFailureKey(op: PendingOperation) {
    return `${op.storeName}:${op.key}:${op.type}`
  }
}

const persistenceQueue = new PersistenceQueue()

export const createPersistenceMiddleware = (): Middleware => {
  return (storeAPI) => (next) => (action: any) => {
    const result = next(action)

    if (!action.type) return result

    const [sliceName, actionName] = action.type.split('/')

    const config = sliceToPersistenceMap[sliceName]
    if (!config || !config.enabled) return result

    const state = storeAPI.getState() as RootState

    const sliceState = state[sliceName as keyof RootState]
    if (!sliceState) return result

    try {
      if (persistenceSingleItemActionNames.has(actionName)) {
        const item = action.payload
        if (item && item.id) {
          persistenceQueue.enqueue({
            type: 'put',
            storeName: config.storeName,
            key: item.id,
            value: { ...item, updatedAt: Date.now() },
            timestamp: Date.now(),
          }, config.debounceMs)
        }
      }

      if (persistenceBulkActionNames.has(actionName)) {
        const items = action.payload
        if (Array.isArray(items)) {
          items.forEach((item: any) => {
            if (item && item.id) {
              persistenceQueue.enqueue({
                type: 'put',
                storeName: config.storeName,
                key: item.id,
                value: { ...item, updatedAt: Date.now() },
                timestamp: Date.now(),
              }, config.debounceMs)
            }
          })
        }
      }

      if (persistenceDeleteActionNames.has(actionName)) {
        const itemId = typeof action.payload === 'string' ? action.payload : action.payload?.id
        if (itemId) {
          persistenceQueue.enqueue({
            type: 'delete',
            storeName: config.storeName,
            key: itemId,
            timestamp: Date.now(),
          }, config.debounceMs)
        }
      }

      if (actionName === 'setTheme') {
        persistenceQueue.enqueue({
          type: 'put',
          storeName: 'theme',
          key: 'current',
          value: action.payload,
          timestamp: Date.now(),
        }, config.debounceMs)
      }

      if (actionName === 'updateSettings') {
        persistenceQueue.enqueue({
          type: 'put',
          storeName: 'settings',
          key: 'appSettings',
          value: action.payload,
          timestamp: Date.now(),
        }, config.debounceMs)
      }

    } catch (error) {
      console.error('[PersistenceMiddleware] Error handling action:', action.type, error)
    }

    return result
  }
}

export const flushPersistence = () => persistenceQueue.flush()
export const getFailedSyncOperations = () => persistenceQueue.getFailedSyncs()
export const retryFailedSyncOperations = () => persistenceQueue.retryFailedSyncs()

export const configurePersistence = (sliceName: string, config: Partial<PersistenceConfig>) => {
  if (sliceToPersistenceMap[sliceName]) {
    sliceToPersistenceMap[sliceName] = {
      ...sliceToPersistenceMap[sliceName],
      ...config,
    }
  }
}

export const disablePersistence = (sliceName: string) => {
  if (sliceToPersistenceMap[sliceName]) {
    sliceToPersistenceMap[sliceName].enabled = false
  }
}

export const enablePersistence = (sliceName: string) => {
  if (sliceToPersistenceMap[sliceName]) {
    sliceToPersistenceMap[sliceName].enabled = true
  }
}
