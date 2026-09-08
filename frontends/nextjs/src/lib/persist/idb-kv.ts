'use client'

/**
 * Tiny promise-based key/value store over IndexedDB, with a localStorage
 * fallback when IndexedDB is unavailable (SSR, private mode, old browsers).
 * This is the offline/local tier of the god-panel persistence stack:
 *   DBAL (server rows)  ->  IndexedDB (this)  ->  localStorage (fallback)
 */

import { openDb, STORE } from './idb-open'
import { lsGet, lsSet } from './ls-fallback'
import { decodeIdbKey } from './decode-idb-key'

export async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDb()
  if (db === null) return lsGet<T>(key)
  return new Promise(resolve => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => {
      resolve((req.result as T | undefined) ?? lsGet<T>(key))
    }
    req.onerror = () => {
      resolve(lsGet<T>(key))
    }
  })
}

/**
 * Store a value. True if at least one tier accepted it.
 *
 * tx.onerror resolved exactly as tx.oncomplete did, and lsSet swallowed
 * its own failures, so a write nowhere accepted was indistinguishable from
 * one that landed. The only reader of this tier is version history, whose
 * empty state then told the founder to "publish to snapshot" after they
 * had already published.
 */
export async function idbSet<T>(key: string, value: T): Promise<boolean> {
  const mirrored = lsSet(key, value) // belt-and-braces fallback
  const db = await openDb()
  if (db === null) return mirrored
  const stored = await new Promise<boolean>(resolve => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => {
      resolve(true)
    }
    tx.onerror = () => {
      resolve(false)
    }
  })
  return stored || mirrored
}

/** Dump every key/value (for project export). */
export async function idbDump(): Promise<Record<string, unknown>> {
  const db = await openDb()
  if (db === null) return {}
  return new Promise(resolve => {
    const out: Record<string, unknown> = {}
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const keysReq = store.getAllKeys()
    keysReq.onsuccess = () => {
      const valsReq = store.getAll()
      valsReq.onsuccess = () => {
        const keys = keysReq.result
        const vals = valsReq.result as unknown[]
        keys.forEach((k, i) => {
          out[decodeIdbKey(k)] = vals[i]
        })
        resolve(out)
      }
      valsReq.onerror = () => {
        resolve(out)
      }
    }
    keysReq.onerror = () => {
      resolve(out)
    }
  })
}

/** Restore a dumped project (import). */
export async function idbRestore(data: Record<string, unknown>): Promise<void> {
  for (const [k, v] of Object.entries(data)) await idbSet(k, v)
}
