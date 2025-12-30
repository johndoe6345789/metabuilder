import { DBALError } from '../../foundation/errors'
import type { TenantContext } from '../../foundation/tenant-context'
import { getEntry, scopedKey } from '../scoping'
import type { KVStoreState, StorableValue } from '../types'

export async function getValue(
  state: KVStoreState,
  key: string,
  context: TenantContext
): Promise<StorableValue | null> {
  if (!context.canRead('kv')) {
    throw DBALError.forbidden('Permission denied: cannot read key-value data')
  }

  const scoped = scopedKey(key, context)
  const entry = getEntry(state, scoped)

  return entry?.value ?? null
}

export async function exists(
  state: KVStoreState,
  key: string,
  context: TenantContext
): Promise<boolean> {
  const value = await getValue(state, key, context)
  return value !== null
}

export async function listGet(
  state: KVStoreState,
  key: string,
  context: TenantContext,
  start: number = 0,
  end?: number
): Promise<any[]> {
  const value = await getValue(state, key, context)
  if (!Array.isArray(value)) return []

  if (end === undefined) {
    return value.slice(start)
  }
  return value.slice(start, end)
}

export async function listLength(
  state: KVStoreState,
  key: string,
  context: TenantContext
): Promise<number> {
  const value = await getValue(state, key, context)
  return Array.isArray(value) ? value.length : 0
}
