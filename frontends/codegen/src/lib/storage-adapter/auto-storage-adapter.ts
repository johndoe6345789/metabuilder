import { FLASK_BACKEND_URL } from './config'
import { detectStorageBackend } from './detect-storage-backend'
import { FlaskBackendAdapter } from './flask-backend-adapter'
import { IndexedDBAdapter } from './indexeddb-adapter'
import type { StorageAdapter } from './types'

export class AutoStorageAdapter implements StorageAdapter {
  private adapter: StorageAdapter | null = null
  private fallbackAdapter: IndexedDBAdapter | null = null
  private backendType: 'flask' | 'indexeddb' | null = null
  private initPromise: Promise<void> | null = null
  private hasWarnedAboutFallback = false
  private failureCount = 0
  private readonly MAX_FAILURES_BEFORE_SWITCH = 3

  private async initialize(): Promise<void> {
    if (this.adapter) {
      return
    }

    if (!this.initPromise) {
      this.initPromise = (async () => {
        this.backendType = await detectStorageBackend()

        if (this.backendType === 'flask' && FLASK_BACKEND_URL) {
          this.adapter = new FlaskBackendAdapter(FLASK_BACKEND_URL)
          this.fallbackAdapter = new IndexedDBAdapter()
          console.log(`[StorageAdapter] Initialized with Flask backend: ${FLASK_BACKEND_URL} (with IndexedDB fallback)`)
        } else {
          this.adapter = new IndexedDBAdapter()
          console.log('[StorageAdapter] Initialized with IndexedDB')
        }
      })()
    }

    await this.initPromise
  }

  private switchToFallback(): void {
    if (this.backendType === 'flask' && this.fallbackAdapter) {
      console.warn('[StorageAdapter] Too many Flask failures detected, permanently switching to IndexedDB for this session')
      this.adapter = this.fallbackAdapter
      this.backendType = 'indexeddb'
      this.fallbackAdapter = null
      this.failureCount = 0
    }
  }

  private async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation?: () => Promise<T>
  ): Promise<T> {
    try {
      const result = await operation()
      if (this.backendType === 'flask') {
        this.failureCount = 0
      }
      return result
    } catch (error) {
      if (this.backendType === 'flask' && this.fallbackAdapter && fallbackOperation) {
        this.failureCount++

        if (!this.hasWarnedAboutFallback) {
          console.warn('[StorageAdapter] Flask backend operation failed, falling back to IndexedDB:', error)
          this.hasWarnedAboutFallback = true
        }

        if (this.failureCount >= this.MAX_FAILURES_BEFORE_SWITCH) {
          this.switchToFallback()
        }

        try {
          return await fallbackOperation()
        } catch (fallbackError) {
          console.error('[StorageAdapter] Fallback to IndexedDB also failed:', fallbackError)
          throw fallbackError
        }
      }
      throw error
    }
  }

  getBackendType(): 'flask' | 'indexeddb' | null {
    return this.backendType
  }

  async get<T>(key: string): Promise<T | undefined> {
    await this.initialize()
    return this.executeWithFallback(
      () => this.adapter!.get<T>(key),
      this.fallbackAdapter ? () => this.fallbackAdapter!.get<T>(key) : undefined
    )
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.initialize()
    return this.executeWithFallback(
      () => this.adapter!.set(key, value),
      this.fallbackAdapter ? () => this.fallbackAdapter!.set(key, value) : undefined
    )
  }

  async delete(key: string): Promise<void> {
    await this.initialize()
    return this.executeWithFallback(
      () => this.adapter!.delete(key),
      this.fallbackAdapter ? () => this.fallbackAdapter!.delete(key) : undefined
    )
  }

  async keys(): Promise<string[]> {
    await this.initialize()
    return this.executeWithFallback(
      () => this.adapter!.keys(),
      this.fallbackAdapter ? () => this.fallbackAdapter!.keys() : undefined
    )
  }

  async clear(): Promise<void> {
    await this.initialize()
    return this.executeWithFallback(
      () => this.adapter!.clear(),
      this.fallbackAdapter ? () => this.fallbackAdapter!.clear() : undefined
    )
  }

  async migrateToFlask(flaskUrl: string): Promise<number> {
    await this.initialize()

    if (this.backendType === 'flask') {
      throw new Error('Already using Flask backend')
    }

    const indexedDBAdapter = this.adapter as IndexedDBAdapter
    const flaskAdapter = new FlaskBackendAdapter(flaskUrl)

    const keys = await indexedDBAdapter.keys()
    let migrated = 0

    for (const key of keys) {
      try {
        const value = await indexedDBAdapter.get(key)
        if (value !== undefined) {
          await flaskAdapter.set(key, value)
          migrated++
        }
      } catch (error) {
        console.error(`[StorageAdapter] Failed to migrate key ${key}:`, error)
      }
    }

    console.log(`[StorageAdapter] Migrated ${migrated}/${keys.length} keys to Flask backend`)
    return migrated
  }

  async migrateToIndexedDB(): Promise<number> {
    await this.initialize()

    if (this.backendType === 'indexeddb') {
      throw new Error('Already using IndexedDB')
    }

    const flaskAdapter = this.adapter as FlaskBackendAdapter
    const indexedDBAdapter = new IndexedDBAdapter()

    const data = await flaskAdapter.export()
    const keys = Object.keys(data)
    let migrated = 0

    for (const key of keys) {
      try {
        await indexedDBAdapter.set(key, data[key])
        migrated++
      } catch (error) {
        console.error(`[StorageAdapter] Failed to migrate key ${key}:`, error)
      }
    }

    console.log(`[StorageAdapter] Migrated ${migrated}/${keys.length} keys to IndexedDB`)
    return migrated
  }
}
