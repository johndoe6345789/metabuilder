import { makeVaultEntry, type VaultDraft, type VaultEntry } from '../vault-records'
import { createFallbackRecord, ensureFallbackVaultSeeded, fallbackStore } from './store'

export function listFallbackVaultEntries(): VaultEntry[] {
  ensureFallbackVaultSeeded()
  return [...fallbackStore.values()]
    .map(record => makeVaultEntry(record))
    .filter((item): item is VaultEntry => item !== null)
    .sort((a, b) => a.title.localeCompare(b.title))
}

export function readFallbackVaultEntry(id: string): VaultEntry | null {
  ensureFallbackVaultSeeded()
  for (const record of fallbackStore.values()) {
    if (record.packageId !== id) continue
    return makeVaultEntry(record)
  }
  return null
}

export function upsertFallbackVaultEntry(
  entry: VaultDraft,
  createdAt: number,
  updatedAt: number
): VaultEntry | null {
  ensureFallbackVaultSeeded()
  const record = createFallbackRecord(entry, createdAt, updatedAt)
  fallbackStore.set(entry.slug, record)
  return makeVaultEntry(record)
}

export function deleteFallbackVaultEntry(id: string): boolean {
  ensureFallbackVaultSeeded()
  for (const [slug, record] of fallbackStore.entries()) {
    if (record.packageId !== id) continue
    fallbackStore.delete(slug)
    return true
  }
  return false
}
