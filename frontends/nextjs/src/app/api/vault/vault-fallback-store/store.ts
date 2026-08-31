import {
  encodeConfig,
  makePackageId,
  type VaultDraft,
  type VaultRecord,
} from '../vault-records'
import { DEFAULT_VAULT_LOGINS } from './default-logins'

export const fallbackStore = new Map<string, VaultRecord>()

export function createFallbackRecord(
  entry: VaultDraft,
  createdAt: number,
  updatedAt: number
): VaultRecord {
  return {
    packageId: makePackageId(entry.slug),
    version: '1.0.0',
    enabled: true,
    config: encodeConfig(entry, createdAt, updatedAt),
    tenantId: 'system',
    installedAt: createdAt,
  }
}

export function ensureFallbackVaultSeeded(): void {
  if (fallbackStore.size > 0) return

  const now = Date.now()
  for (const entry of DEFAULT_VAULT_LOGINS) {
    fallbackStore.set(entry.slug, createFallbackRecord(entry, now, now))
  }
}
