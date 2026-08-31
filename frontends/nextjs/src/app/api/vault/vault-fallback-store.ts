export {
  DEFAULT_VAULT_LOGINS,
} from './vault-fallback-store/default-logins'
export {
  createFallbackRecord,
  ensureFallbackVaultSeeded,
} from './vault-fallback-store/store'
export {
  listFallbackVaultEntries,
  readFallbackVaultEntry,
  upsertFallbackVaultEntry,
  deleteFallbackVaultEntry,
} from './vault-fallback-store/crud'
