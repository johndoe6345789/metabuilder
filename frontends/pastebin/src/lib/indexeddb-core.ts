/**
 * IndexedDB core — database open and store names
 */

export const DB_NAME = 'codesnippet-db'
export const DB_VERSION = 3
export const SNIPPETS_STORE = 'snippets'
export const NAMESPACES_STORE = 'namespaces'
export const SNIPPET_COMMENTS_STORE = 'snippetComments'
export const PROFILE_COMMENTS_STORE = 'profileComments'

let dbInstance: IDBDatabase | null = null

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(SNIPPETS_STORE)) {
        const s = db.createObjectStore(SNIPPETS_STORE, { keyPath: 'id' })
        s.createIndex('namespaceId', 'namespaceId', { unique: false })
        s.createIndex('createdAt', 'createdAt', { unique: false })
      }

      if (!db.objectStoreNames.contains(NAMESPACES_STORE)) {
        db.createObjectStore(NAMESPACES_STORE, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(SNIPPET_COMMENTS_STORE)) {
        const sc = db.createObjectStore(SNIPPET_COMMENTS_STORE, {
          keyPath: 'id',
        })
        sc.createIndex('snippetId', 'snippetId', { unique: false })
        sc.createIndex('createdAt', 'createdAt', { unique: false })
      }

      if (!db.objectStoreNames.contains(PROFILE_COMMENTS_STORE)) {
        const pc = db.createObjectStore(PROFILE_COMMENTS_STORE, {
          keyPath: 'id',
        })
        pc.createIndex('profileUserId', 'profileUserId', { unique: false })
        pc.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }
  })
}
