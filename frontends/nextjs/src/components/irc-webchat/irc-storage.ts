/**
 * irc-storage — localStorage helpers for offline IRC fallback
 */

export function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw != null ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

export function lsSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}
