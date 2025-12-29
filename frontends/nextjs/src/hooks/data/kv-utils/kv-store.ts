/**
 * @file kv-store.ts
 * @description In-memory KV store and subscription management
 */

type Subscriber = (value: unknown) => void

export const kvStore = new Map<string, unknown>()
export const kvSubscribers = new Map<string, Set<Subscriber>>()

/**
 * Subscribe to key changes
 */
export function subscribe(key: string, subscriber: Subscriber): () => void {
  if (!kvSubscribers.has(key)) {
    kvSubscribers.set(key, new Set())
  }
  kvSubscribers.get(key)!.add(subscriber)

  return () => {
    const subs = kvSubscribers.get(key)
    if (subs) {
      subs.delete(subscriber)
      if (subs.size === 0) {
        kvSubscribers.delete(key)
      }
    }
  }
}

/**
 * Notify subscribers of key change
 */
export function notifySubscribers(key: string, value: unknown): void {
  const subs = kvSubscribers.get(key)
  if (subs) {
    subs.forEach(fn => fn(value))
  }
}
