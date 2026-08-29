/**
 * Just enough IndexedDB for the key/value store to run against.
 *
 * jsdom ships none, so without this every test of `idb-kv` exercises the
 * localStorage fallback and the IndexedDB half is never executed. A real
 * polyfill is a large dependency for one small module; this covers the
 * six calls that module makes, and can be told to fail on demand so the
 * error paths are reachable too.
 */

type Listener = (() => void) | null

interface FakeRequest<T> {
  result: T
  onsuccess: Listener
  onerror: Listener
  onupgradeneeded: Listener
}

export interface FakeIdbOptions {
  /** Reject the open request, as a private-mode browser would. */
  failOpen?: boolean
  /** Fail every read. */
  failReads?: boolean
  /** Fail every write transaction. */
  failWrites?: boolean
}

/** Fires the handler the caller attaches after the call returns. */
function settle(
  request: { onsuccess: Listener; onerror: Listener },
  ok: boolean
): void {
  queueMicrotask(() => {
    const handler = ok ? request.onsuccess : request.onerror
    handler?.()
  })
}

export interface FakeIndexedDb {
  /** The rows the store currently holds, for assertions. */
  data: Map<IDBValidKey, unknown>
  indexedDB: { open: (name: string, version: number) => unknown }
  /** True once an upgrade created the object store. */
  createdStore: boolean
}

export function createFakeIndexedDb(
  options: FakeIdbOptions = {},
  seed: Array<[IDBValidKey, unknown]> = []
): FakeIndexedDb {
  const data = new Map<IDBValidKey, unknown>(seed)
  const state = { createdStore: false }

  const objectStore = {
    get(key: IDBValidKey) {
      const request: FakeRequest<unknown> = {
        result: data.get(key),
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      }
      settle(request, options.failReads !== true)
      return request
    },
    put(value: unknown, key: IDBValidKey) {
      if (options.failWrites !== true) data.set(key, value)
      return { onsuccess: null, onerror: null }
    },
    getAllKeys() {
      const request: FakeRequest<IDBValidKey[]> = {
        result: [...data.keys()],
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      }
      settle(request, options.failReads !== true)
      return request
    },
    getAll() {
      const request: FakeRequest<unknown[]> = {
        result: [...data.values()],
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      }
      settle(request, options.failReads !== true)
      return request
    },
  }

  const db = {
    objectStoreNames: { contains: () => state.createdStore },
    createObjectStore: () => {
      state.createdStore = true
      return objectStore
    },
    transaction: () => {
      const tx = {
        objectStore: () => objectStore,
        oncomplete: null as Listener,
        onerror: null as Listener,
      }
      queueMicrotask(() => {
        const handler = options.failWrites === true ? tx.onerror : tx.oncomplete
        handler?.()
      })
      return tx
    },
  }

  return {
    data,
    createdStore: state.createdStore,
    indexedDB: {
      open: () => {
        const request: FakeRequest<typeof db> = {
          result: db,
          onsuccess: null,
          onerror: null,
          onupgradeneeded: null,
        }
        queueMicrotask(() => {
          if (options.failOpen === true) {
            request.onerror?.()
            return
          }
          request.onupgradeneeded?.()
          request.onsuccess?.()
        })
        return request
      },
    },
  }
}
