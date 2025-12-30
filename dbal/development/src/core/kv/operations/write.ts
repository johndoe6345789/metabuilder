import { DBALError } from '../../foundation/errors'
import type { TenantContext } from '../../foundation/tenant-context'
import { calculateSize, deepEquals, scopedKey, valueType } from '../scoping'
import type { KVStoreEntry, KVStoreState, StorableValue } from '../types'

export async function setValue(
  state: KVStoreState,
  key: string,
  value: StorableValue,
  context: TenantContext,
  ttl?: number
): Promise<void> {
  if (!context.canWrite('kv')) {
    throw DBALError.forbidden('Permission denied: cannot write key-value data')
  }

  const scoped = scopedKey(key, context)
  const sizeBytes = calculateSize(value)
  const existing = state.data.get(scoped)
  const sizeDelta = existing ? sizeBytes - existing.sizeBytes : sizeBytes

  if (sizeDelta > 0 && context.quota.maxDataSizeBytes) {
    if (context.quota.currentDataSizeBytes + sizeDelta > context.quota.maxDataSizeBytes) {
      throw DBALError.forbidden('Quota exceeded: maximum data size reached')
    }
  }

  if (!existing && !context.canCreateRecord()) {
    throw DBALError.forbidden('Quota exceeded: maximum record count reached')
  }

  const now = new Date()
  const entry: KVStoreEntry = {
    key,
    value,
    type: valueType(value),
    sizeBytes,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    expiresAt: ttl ? new Date(now.getTime() + ttl * 1000) : undefined
  }

  state.data.set(scoped, entry)

  if (sizeDelta > 0) {
    context.quota.currentDataSizeBytes += sizeDelta
  }
  if (!existing) {
    context.quota.currentRecords++
  }
}

export async function deleteValue(
  state: KVStoreState,
  key: string,
  context: TenantContext
): Promise<boolean> {
  if (!context.canDelete('kv')) {
    throw DBALError.forbidden('Permission denied: cannot delete key-value data')
  }

  const scoped = scopedKey(key, context)
  const existing = state.data.get(scoped)

  if (!existing) return false

  state.data.delete(scoped)
  context.quota.currentDataSizeBytes -= existing.sizeBytes
  context.quota.currentRecords--
  return true
}

export async function listAdd(
  state: KVStoreState,
  key: string,
  items: StorableValue[],
  context: TenantContext
): Promise<number> {
  if (!context.canWrite('kv')) {
    throw DBALError.forbidden('Permission denied: cannot write key-value data')
  }

  if (!context.canAddToList(items.length)) {
    throw DBALError.forbidden('Quota exceeded: list length limit reached')
  }

  const existing = await getValueForWrite(state, key, context)
  const list = Array.isArray(existing) ? existing : []
  list.push(...items)

  await setValue(state, key, list, context)
  return list.length
}

export async function listRemove(
  state: KVStoreState,
  key: string,
  valueToRemove: StorableValue,
  context: TenantContext
): Promise<number> {
  if (!context.canWrite('kv')) {
    throw DBALError.forbidden('Permission denied: cannot write key-value data')
  }

  const existing = await getValueForWrite(state, key, context)
  if (!Array.isArray(existing)) return 0

  const filtered = existing.filter(item => !deepEquals(item, valueToRemove))
  const removed = existing.length - filtered.length

  if (removed > 0) {
    await setValue(state, key, filtered, context)
  }

  return removed
}

export async function listClear(
  state: KVStoreState,
  key: string,
  context: TenantContext
): Promise<void> {
  await setValue(state, key, [], context)
}

async function getValueForWrite(
  state: KVStoreState,
  key: string,
  context: TenantContext
): Promise<StorableValue | null> {
  if (!context.canRead('kv')) {
    throw DBALError.forbidden('Permission denied: cannot read key-value data')
  }

  const scoped = scopedKey(key, context)
  const entry = state.data.get(scoped)
  if (!entry) return null
  if (entry.expiresAt && entry.expiresAt < new Date()) {
    state.data.delete(scoped)
    return null
  }
  return entry.value
}
