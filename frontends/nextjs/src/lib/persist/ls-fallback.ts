/** The localStorage tier of idb-kv's fallback chain -- used both when
 *  IndexedDB is unavailable outright and as a belt-and-braces mirror on
 *  every successful IndexedDB write. */

export function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null && raw.length > 0 ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}
