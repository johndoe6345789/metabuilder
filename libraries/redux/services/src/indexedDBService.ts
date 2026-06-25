/**
 * IndexedDB Service
 * Generic IndexedDB storage service for client-side data persistence
 *
 * Usage:
 * ```typescript
 * const db = createIndexedDBService<MyEntity>({
 *   dbName: 'my-app-db',
 *   dbVersion: 1,
 *   storeName: 'entities',
 *   keyPath: 'id',
 *   indexes: [
 *     { name: 'createdAt', keyPath: 'createdAt', unique: false }
 *   ]
 * });
 *
 * await db.open();
 * await db.create({ id: '1', name: 'Test', createdAt: Date.now() });
 * const item = await db.getById('1');
 * ```
 */

export interface IndexedDBIndex {
  name: string
  keyPath: string | string[]
  unique?: boolean
}

export interface IndexedDBConfig {
  dbName: string
  dbVersion: number
  storeName: string
  keyPath: string
  indexes?: IndexedDBIndex[]
}

export interface IndexedDBService<T extends Record<string, unknown>> {
  open(): Promise<IDBDatabase>
  close(): void
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  getByIndex(indexName: string, value: IDBValidKey): Promise<T[]>
  create(item: T): Promise<void>
  update(item: T): Promise<void>
  delete(id: string): Promise<void>
  clear(): Promise<void>
  count(): Promise<number>
  exportData(): Promise<T[]>
  importData(items: T[], clearFirst?: boolean): Promise<void>
}

/**
 * Create an IndexedDB service for a specific entity type
 */
export function createIndexedDBService<T extends Record<string, unknown>>(
  config: IndexedDBConfig
): IndexedDBService<T> {
  const { dbName, dbVersion, storeName, keyPath, indexes = [] } = config
  let dbInstance: IDBDatabase | null = null

  async function open(): Promise<IDBDatabase> {
    if (dbInstance) return dbInstance

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion)

      request.onerror = () => reject(request.error)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create store if it doesn't exist
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath })

          // Create indexes
          for (const index of indexes) {
            store.createIndex(index.name, index.keyPath, { unique: index.unique ?? false })
          }
        }
      }

      request.onsuccess = () => {
        dbInstance = request.result
        resolve(dbInstance)
      }
    })
  }

  function close(): void {
    if (dbInstance) {
      dbInstance.close()
      dbInstance = null
    }
  }

  async function getAll(): Promise<T[]> {
    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async function getById(id: string): Promise<T | null> {
    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async function getByIndex(indexName: string, value: IDBValidKey): Promise<T[]> {
    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async function create(item: T): Promise<void> {
    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(item)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async function update(item: T): Promise<void> {
    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(item)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async function deleteItem(id: string): Promise<void> {
    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async function clear(): Promise<void> {
    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async function count(): Promise<number> {
    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async function exportData(): Promise<T[]> {
    return getAll()
  }

  async function importData(items: T[], clearFirst = true): Promise<void> {
    if (clearFirst) {
      await clear()
    }

    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)

      for (const item of items) {
        store.add(item)
      }

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  }

  return {
    open,
    close,
    getAll,
    getById,
    getByIndex,
    create,
    update,
    delete: deleteItem,
    clear,
    count,
    exportData,
    importData
  }
}

/**
 * Multi-store IndexedDB service for applications with multiple entity types
 */
export interface MultiStoreConfig {
  dbName: string
  dbVersion: number
  stores: Array<{
    name: string
    keyPath: string
    indexes?: IndexedDBIndex[]
  }>
}

export interface MultiStoreService {
  open(): Promise<IDBDatabase>
  close(): void
  getStore<T extends Record<string, unknown>>(storeName: string): IndexedDBService<T>
  clearAll(): Promise<void>
  exportAll(): Promise<Record<string, unknown[]>>
  importAll(data: Record<string, unknown[]>): Promise<void>
}

export function createMultiStoreService(config: MultiStoreConfig): MultiStoreService {
  const { dbName, dbVersion, stores } = config
  let dbInstance: IDBDatabase | null = null
  const storeServices = new Map<string, IndexedDBService<Record<string, unknown>>>()

  async function open(): Promise<IDBDatabase> {
    if (dbInstance) return dbInstance

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion)

      request.onerror = () => reject(request.error)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        for (const store of stores) {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath })

            for (const index of store.indexes ?? []) {
              objectStore.createIndex(index.name, index.keyPath, { unique: index.unique ?? false })
            }
          }
        }
      }

      request.onsuccess = () => {
        dbInstance = request.result
        resolve(dbInstance)
      }
    })
  }

  function close(): void {
    if (dbInstance) {
      dbInstance.close()
      dbInstance = null
    }
    storeServices.clear()
  }

  function getStore<T extends Record<string, unknown>>(storeName: string): IndexedDBService<T> {
    const storeConfig = stores.find(s => s.name === storeName)
    if (!storeConfig) {
      throw new Error(`Store "${storeName}" not found in configuration`)
    }

    if (!storeServices.has(storeName)) {
      const service = createIndexedDBService<Record<string, unknown>>({
        dbName,
        dbVersion,
        storeName,
        keyPath: storeConfig.keyPath,
        indexes: storeConfig.indexes
      })
      storeServices.set(storeName, service)
    }

    return storeServices.get(storeName) as IndexedDBService<T>
  }

  async function clearAll(): Promise<void> {
    const db = await open()
    return new Promise((resolve, reject) => {
      const storeNames = stores.map(s => s.name)
      const transaction = db.transaction(storeNames, 'readwrite')

      for (const storeName of storeNames) {
        transaction.objectStore(storeName).clear()
      }

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  }

  async function exportAll(): Promise<Record<string, unknown[]>> {
    const result: Record<string, unknown[]> = {}

    for (const store of stores) {
      const service = getStore(store.name)
      result[store.name] = await service.getAll()
    }

    return result
  }

  async function importAll(data: Record<string, unknown[]>): Promise<void> {
    await clearAll()

    for (const [storeName, items] of Object.entries(data)) {
      const storeConfig = stores.find(s => s.name === storeName)
      if (storeConfig && items.length > 0) {
        const service = getStore(storeName)
        await service.importData(items as Record<string, unknown>[], false)
      }
    }
  }

  return {
    open,
    close,
    getStore,
    clearAll,
    exportAll,
    importAll
  }
}
