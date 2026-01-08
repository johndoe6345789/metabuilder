import { DBALError } from '../../foundation/errors'
import type { TenantContext } from '../../foundation/tenant-context'
import { scopedKey, getEntry } from '../scoping'
import type { KVListOptions, KVListResult, KVStoreState, StorableValue } from '../types'
import { setValue } from './write'

export async function mget(
  state: KVStoreState,
  keys: string[],
  context: TenantContext
): Promise<Map<string, StorableValue | null>> {
  const result = new Map<string, StorableValue | null>()

  for (const key of keys) {
    const scoped = scopedKey(key, context)
    const entry = getEntry(state, scoped)
    result.set(key, entry?.value ?? null)
  }

  return result
}

export async function mset(
  state: KVStoreState,
  entries: Map<string, StorableValue>,
  context: TenantContext
): Promise<void> {
  for (const [key, value] of entries) {
    await setValue(state, key, value, context)
  }
}

export async function listEntries(
  state: KVStoreState,
  options: KVListOptions,
  context: TenantContext
): Promise<KVListResult> {
  if (!context.canRead('kv')) {
    throw DBALError.forbidden('Permission denied: cannot read key-value data')
  }

  const prefix = options.prefix || ''
  const limit = options.limit || 100
  const scopedPrefix = scopedKey(prefix, context)

  const entries: KVListEntry[] = []

  for (const [scoped, entry] of state.data) {
    if (scoped.startsWith(scopedPrefix)) {
      if (entry.expiresAt && entry.expiresAt < new Date()) {
        continue
      }
      entries.push(entry)

      if (entries.length >= limit) break
    }
  }

  return {
    entries,
    hasMore: false,
    nextCursor: undefined
  }
}

type KVListEntry = KVListResult['entries'][number]

export async function count(prefix: string, state: KVStoreState, context: TenantContext): Promise<number> {
  const result = await listEntries(state, { prefix, limit: Number.MAX_SAFE_INTEGER }, context)
  return result.entries.length
}

export async function clear(
  state: KVStoreState,
  context: TenantContext
): Promise<number> {
  if (!context.canDelete('kv')) {
    throw DBALError.forbidden('Permission denied: cannot delete key-value data')
  }

  const scopedPrefix = scopedKey('', context)
  let removed = 0

  for (const [scoped] of state.data) {
    if (scoped.startsWith(scopedPrefix)) {
      state.data.delete(scoped)
      removed++
    }
  }

  if (context.quota) {
    context.quota.currentDataSizeBytes = 0
    context.quota.currentRecords = 0
  }

  return removed
}
