import type { KVStoreEntry, KVStoreState, StorableValue } from './types'
import type { TenantContext } from '../foundation/tenant-context'

export function scopedKey(key: string, context: TenantContext): string {
  return `${context.namespace}${key}`
}

export function calculateSize(value: StorableValue): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'string') return value.length * 2
  if (typeof value === 'number') return 8
  if (typeof value === 'boolean') return 1
  return JSON.stringify(value).length * 2
}

export function valueType(value: StorableValue): KVStoreEntry['type'] {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value as 'string' | 'number' | 'boolean' | 'object'
}

export function isExpired(entry: KVStoreEntry): boolean {
  return Boolean(entry.expiresAt && entry.expiresAt < new Date())
}

export function deepEquals(a: StorableValue, b: StorableValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function getEntry(state: KVStoreState, scoped: string): KVStoreEntry | undefined {
  const entry = state.data.get(scoped)
  if (!entry) return undefined
  if (isExpired(entry)) {
    state.data.delete(scoped)
    return undefined
  }
  return entry
}
