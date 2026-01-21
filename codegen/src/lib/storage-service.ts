/**
 * Storage Service - Unified storage interface with IndexedDB and Flask API support
 * 
 * This service provides a unified storage interface that:
 * - Uses IndexedDB by default (browser-native, persistent storage)
 * - Optionally uses Flask API backend when configured
 * - Automatically falls back to IndexedDB if Flask API fails
 */

const DB_NAME = 'codeforge-storage'
const DB_VERSION = 1
const STORE_NAME = 'kv-store'

interface StorageBackend {
  get<T>(key: string): Promise<T | undefined>
  set(key: string, value: any): Promise<void>
  delete(key: string): Promise<void>
  keys(): Promise<string[]>
  clear(): Promise<void>
}

class IndexedDBStorage implements StorageBackend {
  private dbPromise: Promise<IDBDatabase>

  constructor() {
    this.dbPromise = this.initDB()
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }
    })
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const db = await this.dbPromise
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      
      return new Promise((resolve, reject) => {
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result as T)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('IndexedDB get error:', error)
      return undefined
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const db = await this.dbPromise
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      return new Promise((resolve, reject) => {
        const request = store.put(value, key)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('IndexedDB set error:', error)
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.dbPromise
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      return new Promise((resolve, reject) => {
        const request = store.delete(key)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('IndexedDB delete error:', error)
      throw error
    }
  }

  async keys(): Promise<string[]> {
    try {
      const db = await this.dbPromise
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      
      return new Promise((resolve, reject) => {
        const request = store.getAllKeys()
        request.onsuccess = () => resolve(request.result as string[])
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('IndexedDB keys error:', error)
      return []
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.dbPromise
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      return new Promise((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('IndexedDB clear error:', error)
      throw error
    }
  }
}

class FlaskAPIStorage implements StorageBackend {
  private baseURL: string
  private fallbackStorage: IndexedDBStorage

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, '')
    this.fallbackStorage = new IndexedDBStorage()
  }

  private async fetchWithFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      console.warn('Flask API failed, falling back to IndexedDB:', error)
      storageConfig.useFlaskAPI = false
      return fallbackOperation()
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.fetchWithFallback(
      async () => {
        const response = await fetch(`${this.baseURL}/api/storage/${encodeURIComponent(key)}`)
        if (!response.ok) {
          if (response.status === 404) return undefined
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        return data.value as T
      },
      () => this.fallbackStorage.get<T>(key)
    )
  }

  async set(key: string, value: any): Promise<void> {
    return this.fetchWithFallback(
      async () => {
        const response = await fetch(`${this.baseURL}/api/storage/${encodeURIComponent(key)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value })
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
      },
      () => this.fallbackStorage.set(key, value)
    )
  }

  async delete(key: string): Promise<void> {
    return this.fetchWithFallback(
      async () => {
        const response = await fetch(`${this.baseURL}/api/storage/${encodeURIComponent(key)}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
      },
      () => this.fallbackStorage.delete(key)
    )
  }

  async keys(): Promise<string[]> {
    return this.fetchWithFallback(
      async () => {
        const response = await fetch(`${this.baseURL}/api/storage/keys`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        return data.keys
      },
      () => this.fallbackStorage.keys()
    )
  }

  async clear(): Promise<void> {
    return this.fetchWithFallback(
      async () => {
        const response = await fetch(`${this.baseURL}/api/storage`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
      },
      () => this.fallbackStorage.clear()
    )
  }
}

export interface StorageConfig {
  useFlaskAPI: boolean
  flaskAPIURL: string
}

export const storageConfig: StorageConfig = {
  useFlaskAPI: false,
  flaskAPIURL: ''
}

if (typeof window !== 'undefined') {
  const envFlaskURL = import.meta.env.VITE_FLASK_API_URL
  if (envFlaskURL) {
    storageConfig.useFlaskAPI = true
    storageConfig.flaskAPIURL = envFlaskURL
  }
}

let storageInstance: StorageBackend | null = null

export function getStorage(): StorageBackend {
  if (!storageInstance || 
      (storageConfig.useFlaskAPI && !(storageInstance instanceof FlaskAPIStorage)) ||
      (!storageConfig.useFlaskAPI && !(storageInstance instanceof IndexedDBStorage))) {
    storageInstance = storageConfig.useFlaskAPI && storageConfig.flaskAPIURL
      ? new FlaskAPIStorage(storageConfig.flaskAPIURL)
      : new IndexedDBStorage()
  }
  return storageInstance
}

export function setFlaskAPI(url: string) {
  storageConfig.useFlaskAPI = true
  storageConfig.flaskAPIURL = url
  storageInstance = null
}

export function disableFlaskAPI() {
  storageConfig.useFlaskAPI = false
  storageInstance = null
}
