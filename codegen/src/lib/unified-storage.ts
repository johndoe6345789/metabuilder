/// <reference path="../global.d.ts" />

import type { StorageAdapter, StorageBackend } from './unified-storage-adapters'
import { FlaskBackendAdapter, IndexedDBAdapter, SparkKVAdapter, SQLiteAdapter } from './unified-storage-adapters'

export type { StorageAdapter, StorageBackend } from './unified-storage-adapters'

class UnifiedStorage {
  private adapter: StorageAdapter | null = null
  private backend: StorageBackend | null = null
  private initPromise: Promise<void> | null = null

  private async detectAndInitialize(): Promise<void> {
    if (this.adapter) return
    if (this.initPromise) return this.initPromise

    this.initPromise = (async () => {
      const preferFlask = localStorage.getItem('codeforge-prefer-flask') === 'true'
      const flaskEnvUrl = import.meta.env.VITE_FLASK_BACKEND_URL
      const preferSQLite = localStorage.getItem('codeforge-prefer-sqlite') === 'true'

      if (preferFlask || flaskEnvUrl) {
        try {
          console.log('[Storage] Flask backend explicitly configured, attempting to initialize...')
          const flaskAdapter = new FlaskBackendAdapter(flaskEnvUrl)
          await Promise.race([
            flaskAdapter.get('_health_check'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Flask connection timeout')), 2000))
          ])
          this.adapter = flaskAdapter
          this.backend = 'flask'
          console.log('[Storage] ✓ Using Flask backend')
          return
        } catch (error) {
          console.warn('[Storage] Flask backend not available, falling back to IndexedDB:', error)
        }
      }

      if (typeof indexedDB !== 'undefined') {
        try {
          console.log('[Storage] Initializing default IndexedDB backend...')
          const idbAdapter = new IndexedDBAdapter()
          await idbAdapter.get('_health_check')
          this.adapter = idbAdapter
          this.backend = 'indexeddb'
          console.log('[Storage] ✓ Using IndexedDB (default)')
          return
        } catch (error) {
          console.warn('[Storage] IndexedDB not available:', error)
        }
      }

      if (preferSQLite) {
        try {
          console.log('[Storage] SQLite fallback, attempting to initialize...')
          const sqliteAdapter = new SQLiteAdapter()
          await sqliteAdapter.get('_health_check')
          this.adapter = sqliteAdapter
          this.backend = 'sqlite'
          console.log('[Storage] ✓ Using SQLite')
          return
        } catch (error) {
          console.warn('[Storage] SQLite not available:', error)
        }
      }

      if (window.spark?.kv) {
        try {
          console.log('[Storage] Spark KV fallback, attempting to initialize...')
          const sparkAdapter = new SparkKVAdapter()
          await sparkAdapter.get('_health_check')
          this.adapter = sparkAdapter
          this.backend = 'sparkkv'
          console.log('[Storage] ✓ Using Spark KV')
          return
        } catch (error) {
          console.warn('[Storage] Spark KV not available:', error)
        }
      }

      throw new Error('No storage backend available')
    })()

    return this.initPromise
  }

  private async executeWithAutoFallback<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (this.backend === 'flask') {
        console.warn('[Storage] Flask operation failed, switching to IndexedDB:', error)
        await this.switchToIndexedDB()
        return await operation()
      }
      throw error
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    await this.detectAndInitialize()
    return this.executeWithAutoFallback(() => this.adapter!.get<T>(key))
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.detectAndInitialize()
    return this.executeWithAutoFallback(() => this.adapter!.set(key, value))
  }

  async delete(key: string): Promise<void> {
    await this.detectAndInitialize()
    return this.executeWithAutoFallback(() => this.adapter!.delete(key))
  }

  async keys(): Promise<string[]> {
    await this.detectAndInitialize()
    return this.executeWithAutoFallback(() => this.adapter!.keys())
  }

  async clear(): Promise<void> {
    await this.detectAndInitialize()
    return this.executeWithAutoFallback(() => this.adapter!.clear())
  }

  async getBackend(): Promise<StorageBackend | null> {
    await this.detectAndInitialize()
    return this.backend
  }

  async switchToSQLite(): Promise<void> {
    if (this.backend === 'sqlite') return

    console.log('[Storage] Switching to SQLite...')
    const oldKeys = await this.keys()
    const data: Record<string, any> = {}

    for (const key of oldKeys) {
      data[key] = await this.get(key)
    }

    if (this.adapter?.close) {
      await this.adapter.close()
    }

    this.adapter = null
    this.backend = null
    this.initPromise = null

    localStorage.setItem('codeforge-prefer-sqlite', 'true')

    await this.detectAndInitialize()

    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value)
    }

    console.log('[Storage] ✓ Migrated to SQLite')
  }

  async switchToIndexedDB(): Promise<void> {
    if (this.backend === 'indexeddb') return

    console.log('[Storage] Switching to IndexedDB...')
    const oldKeys = await this.keys()
    const data: Record<string, any> = {}

    for (const key of oldKeys) {
      data[key] = await this.get(key)
    }

    if (this.adapter?.close) {
      await this.adapter.close()
    }

    this.adapter = null
    this.backend = null
    this.initPromise = null

    localStorage.removeItem('codeforge-prefer-sqlite')
    localStorage.removeItem('codeforge-prefer-flask')

    await this.detectAndInitialize()

    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value)
    }

    console.log('[Storage] ✓ Migrated to IndexedDB')
  }

  async switchToFlask(backendUrl?: string): Promise<void> {
    if (this.backend === 'flask') return

    console.log('[Storage] Switching to Flask backend...')
    const oldKeys = await this.keys()
    const data: Record<string, any> = {}

    for (const key of oldKeys) {
      data[key] = await this.get(key)
    }

    if (this.adapter?.close) {
      await this.adapter.close()
    }

    this.adapter = null
    this.backend = null
    this.initPromise = null

    localStorage.setItem('codeforge-prefer-flask', 'true')
    if (backendUrl) {
      localStorage.setItem('codeforge-flask-url', backendUrl)
    }

    await this.detectAndInitialize()

    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value)
    }

    console.log('[Storage] ✓ Migrated to Flask backend')
  }

  async exportData(): Promise<Record<string, any>> {
    const allKeys = await this.keys()
    const data: Record<string, any> = {}

    for (const key of allKeys) {
      data[key] = await this.get(key)
    }

    return data
  }

  async importData(data: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value)
    }
  }
}

export const unifiedStorage = new UnifiedStorage()
