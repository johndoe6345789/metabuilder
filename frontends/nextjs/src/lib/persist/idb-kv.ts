'use client'

/**
 * Tiny promise-based key/value store over IndexedDB, with a localStorage
 * fallback when IndexedDB is unavailable (SSR, private mode, old browsers).
 * This is the offline/local tier of the god-panel persistence stack:
 *   DBAL (server rows)  ->  IndexedDB (this)  ->  localStorage (fallback)
 */

const DB_NAME = 'metabuilder'
const STORE = 'kv'
const VERSION = 1

let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
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
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
  return dbPromise
}

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDb()
  if (!db) return lsGet<T>(key)
  return new Promise(resolve => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () =>
      resolve((req.result as T | undefined) ?? lsGet<T>(key))
    req.onerror = () => resolve(lsGet<T>(key))
  })
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  lsSet(key, value) // mirror to localStorage as a belt-and-braces fallback
  const db = await openDb()
  if (!db) return
  await new Promise<void>(resolve => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}

/** Dump every key/value (for project export). */
export async function idbDump(): Promise<Record<string, unknown>> {
  const db = await openDb()
  if (!db) return {}
  return new Promise(resolve => {
    const out: Record<string, unknown> = {}
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const keysReq = store.getAllKeys()
    keysReq.onsuccess = () => {
      const valsReq = store.getAll()
      valsReq.onsuccess = () => {
        const keys = keysReq.result as IDBValidKey[]
        const vals = valsReq.result as unknown[]
        keys.forEach((k, i) => {
          const key =
            typeof k === 'string' || typeof k === 'number'
              ? String(k)
              : k instanceof Date
                ? k.toISOString()
                : JSON.stringify(k)
          out[key] = vals[i]
        })
        resolve(out)
      }
      valsReq.onerror = () => resolve(out)
    }
    keysReq.onerror = () => resolve(out)
  })
}

/** Restore a dumped project (import). */
export async function idbRestore(data: Record<string, unknown>): Promise<void> {
  for (const [k, v] of Object.entries(data)) await idbSet(k, v)
}
