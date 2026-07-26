import {
  encodeConfig,
  makePackageId,
  makeVaultEntry,
  type VaultDraft,
  type VaultEntry,
  type VaultRecord,
} from './vault-records'

export const DEFAULT_VAULT_LOGINS = [
  {
    slug: 'demo',
    title: 'Demo user',
    username: 'demo',
    password: 'demo1234',
    group: 'Default',
    notes: 'Primary smoke-test login.',
    loginUrl: '/app/login',
    appUrl: '/app',
  },
  {
    slug: 'alice',
    title: 'Alice tester',
    username: 'alice',
    password: 'alice1234',
    group: 'Default',
    notes: 'Secondary test account.',
    loginUrl: '/app/login',
    appUrl: '/app',
  },
  {
    slug: 'bob',
    title: 'Bob tester',
    username: 'bob',
    password: 'bob12345',
    group: 'Default',
    notes: 'Used for permission and role checks.',
    loginUrl: '/app/login',
    appUrl: '/app',
  },
  {
    slug: 'guest',
    title: 'Guest viewer',
    username: 'guest',
    password: 'guest1234',
    group: 'Public',
    notes: 'Low-friction smoke test account.',
    loginUrl: '/app/login',
    appUrl: '/app',
  },
  {
    slug: 'qa',
    title: 'QA engineer',
    username: 'qa',
    password: 'qa1234',
    group: 'Testing',
    notes: 'Used for general QA runs.',
    loginUrl: '/app/login',
    appUrl: '/app/dashboard',
  },
  {
    slug: 'analyst',
    title: 'Analytics reviewer',
    username: 'analyst',
    password: 'analyst1234',
    group: 'Testing',
    notes: 'Checks reporting surfaces and read-only flows.',
    loginUrl: '/app/login',
    appUrl: '/app/dashboard',
  },
  {
    slug: 'editor',
    title: 'Content editor',
    username: 'editor',
    password: 'editor1234',
    group: 'Workspace',
    notes: 'Useful for content and form editing checks.',
    loginUrl: '/app/login',
    appUrl: '/app/comments',
  },
  {
    slug: 'moderator',
    title: 'Moderator',
    username: 'moderator',
    password: 'moderator1234',
    group: 'Workspace',
    notes: 'Moderation and review workflows.',
    loginUrl: '/app/login',
    appUrl: '/app/comments',
  },
  {
    slug: 'admin',
    title: 'Admin operator',
    username: 'admin',
    password: 'admin1234',
    group: 'Administration',
    notes: 'Covers admin and configuration flows.',
    loginUrl: '/app/login',
    appUrl: '/app/admin',
  },
  {
    slug: 'god',
    title: 'God operator',
    username: 'god',
    password: 'god1234',
    group: 'Administration',
    notes: 'Exercises god panel controls.',
    loginUrl: '/app/login',
    appUrl: '/app/god-panel',
  },
  {
    slug: 'supergod',
    title: 'Supergod operator',
    username: 'supergod',
    password: 'supergod1234',
    group: 'Administration',
    notes: 'Exercises super-god workflows.',
    loginUrl: '/app/login',
    appUrl: '/app/super-god-panel',
  },
  {
    slug: 'service',
    title: 'Service account',
    username: 'service',
    password: 'service1234',
    group: 'System',
    notes: 'Tests automation and integration hooks.',
    loginUrl: '/app/login',
    appUrl: '/app/system/god-panel',
  },
]

const fallbackStore = new Map<string, VaultRecord>()

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
