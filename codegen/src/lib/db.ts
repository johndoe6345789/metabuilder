const DB_NAME = 'CodeForgeDB'
const DB_VERSION = 1

export interface DBSchema {
  projects: {
    key: string
    value: {
      id: string
      name: string
      files: any[]
      models: any[]
      components: any[]
      componentTrees: any[]
      workflows: any[]
      lambdas: any[]
      theme: any
      playwrightTests: any[]
      storybookStories: any[]
      unitTests: any[]
      flaskConfig: any
      nextjsConfig: any
      npmSettings: any
      featureToggles: any
      createdAt: number
      updatedAt: number
    }
  }
  files: {
    key: string
    value: {
      id: string
      name: string
      content: string
      language: string
      path: string
      updatedAt: number
    }
  }
  models: {
    key: string
    value: {
      id: string
      name: string
      fields: any[]
      updatedAt: number
    }
  }
  components: {
    key: string
    value: {
      id: string
      name: string
      code: string
      updatedAt: number
    }
  }
  workflows: {
    key: string
    value: {
      id: string
      name: string
      nodes: any[]
      edges: any[]
      updatedAt: number
    }
  }
  settings: {
    key: string
    value: any
  }
}

type StoreName = keyof DBSchema

class Database {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
          projectStore.createIndex('name', 'name', { unique: false })
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' })
          fileStore.createIndex('name', 'name', { unique: false })
          fileStore.createIndex('path', 'path', { unique: false })
        }

        if (!db.objectStoreNames.contains('models')) {
          const modelStore = db.createObjectStore('models', { keyPath: 'id' })
          modelStore.createIndex('name', 'name', { unique: false })
        }

        if (!db.objectStoreNames.contains('components')) {
          const componentStore = db.createObjectStore('components', { keyPath: 'id' })
          componentStore.createIndex('name', 'name', { unique: false })
        }

        if (!db.objectStoreNames.contains('workflows')) {
          const workflowStore = db.createObjectStore('workflows', { keyPath: 'id' })
          workflowStore.createIndex('name', 'name', { unique: false })
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      }
    })

    return this.initPromise
  }

  async get<T extends StoreName>(
    storeName: T,
    key: string
  ): Promise<DBSchema[T]['value'] | undefined> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getAll<T extends StoreName>(storeName: T): Promise<DBSchema[T]['value'][]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async put<T extends StoreName>(
    storeName: T,
    value: DBSchema[T]['value']
  ): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(value)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async delete<T extends StoreName>(storeName: T, key: string): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear<T extends StoreName>(storeName: T): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async query<T extends StoreName>(
    storeName: T,
    indexName: string,
    query: IDBValidKey | IDBKeyRange
  ): Promise<DBSchema[T]['value'][]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(query)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async count<T extends StoreName>(storeName: T): Promise<number> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}

export const db = new Database()
