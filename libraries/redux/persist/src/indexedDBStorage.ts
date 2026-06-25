const DEFAULT_DB_NAME = 'metabuilder-persist'
const DEFAULT_STORE_NAME = 'redux-state'
const DB_VERSION = 1

const isSSR = typeof indexedDB === 'undefined'

class IndexedDBPersistStorage {
  private dbName: string
  private storeName: string
  private dbPromise: Promise<IDBDatabase> | null = null

  constructor(dbName = DEFAULT_DB_NAME, storeName = DEFAULT_STORE_NAME) {
    this.dbName = dbName
    this.storeName = storeName
  }

  private getDB(): Promise<IDBDatabase> {
    if (isSSR) return Promise.reject(new Error('IndexedDB not available during SSR'))
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })

    return this.dbPromise
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result ?? null)
        request.onerror = () => reject(request.error)
      })
    } catch {
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (isSSR) return
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async removeItem(key: string): Promise<void> {
    if (isSSR) return
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export function createIndexedDBStorage(dbName?: string) {
  return new IndexedDBPersistStorage(dbName)
}
