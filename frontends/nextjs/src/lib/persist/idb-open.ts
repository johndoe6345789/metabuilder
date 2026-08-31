export const STORE = 'kv'

const DB_NAME = 'metabuilder'
const VERSION = 1

let dbPromise: Promise<IDBDatabase | null> | null = null

/** Opens (and caches) the shared IndexedDB database, resolving to null
 *  when IndexedDB isn't available at all rather than rejecting -- callers
 *  fall back to localStorage on null instead of handling a thrown error. */
export function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise !== null) return dbPromise
  dbPromise = new Promise(resolve => {
    if (typeof indexedDB === 'undefined') {
      resolve(null)
      return
    }
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => {
      resolve(req.result)
    }
    req.onerror = () => {
      resolve(null)
    }
  })
  return dbPromise
}
