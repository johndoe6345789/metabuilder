import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as FallbackStore from './vault-fallback-store'

// The store is a module-level Map, so each test gets a fresh module
// registry rather than inheriting the previous test's mutations.
let store: typeof FallbackStore

beforeEach(async () => {
  vi.resetModules()
  store = await import('./vault-fallback-store')
})

describe('createFallbackRecord', () => {
  it('builds a system-tenant record with a vault_ package id', () => {
    const record = store.createFallbackRecord(
      {
        slug: 'demo',
        title: 'Demo',
        username: 'demo',
        password: 'pw',
        group: 'Default',
        notes: '',
        loginUrl: '/app/login',
        appUrl: '/app',
      },
      10,
      20
    )
    expect(record.packageId).toBe('vault_demo')
    expect(record.tenantId).toBe('system')
    expect(record.enabled).toBe(true)
    expect(record.installedAt).toBe(10)
  })

  it('encodes both timestamps into the config payload', () => {
    const record = store.createFallbackRecord(
      {
        slug: 'x',
        title: 'X',
        username: 'x',
        password: 'p',
        group: 'G',
        notes: 'n',
        loginUrl: '/l',
        appUrl: '/a',
      },
      1,
      2
    )
    const config = JSON.parse(record.config ?? '{}') as Record<string, unknown>
    expect(config.createdAt).toBe(1)
    expect(config.updatedAt).toBe(2)
    expect(config.username).toBe('x')
  })
})

describe('listFallbackVaultEntries', () => {
  it('seeds every default login on first read', () => {
    expect(store.listFallbackVaultEntries()).toHaveLength(
      store.DEFAULT_VAULT_LOGINS.length
    )
  })

  it('returns entries sorted by title', () => {
    const titles = store.listFallbackVaultEntries().map(e => e.title)
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)))
  })

  it('gives every entry a vault_ id and the system tenant', () => {
    for (const entry of store.listFallbackVaultEntries()) {
      expect(entry.id).toBe(`vault_${entry.slug}`)
      expect(entry.tenantId).toBe('system')
    }
  })

  it('does not re-seed over an entry written before the first list', () => {
    store.upsertFallbackVaultEntry(
      {
        slug: 'demo',
        title: 'Renamed',
        username: 'demo',
        password: 'pw',
        group: 'Default',
        notes: '',
        loginUrl: '/app/login',
        appUrl: '/app',
      },
      1,
      1
    )
    const demo = store.readFallbackVaultEntry('vault_demo')
    expect(demo?.title).toBe('Renamed')
  })
})

describe('readFallbackVaultEntry', () => {
  it('finds a seeded entry by its package id', () => {
    expect(store.readFallbackVaultEntry('vault_god')?.username).toBe('god')
  })

  it('is null for an id that is not in the store', () => {
    expect(store.readFallbackVaultEntry('vault_nobody')).toBeNull()
  })

  it('is null for an id missing the vault_ prefix', () => {
    expect(store.readFallbackVaultEntry('demo')).toBeNull()
  })
})

describe('upsertFallbackVaultEntry', () => {
  const draft = {
    slug: 'new-login',
    title: 'New login',
    username: 'newbie',
    password: 'secret123',
    group: 'Testing',
    notes: 'added by a test',
    loginUrl: '/app/login',
    appUrl: '/app',
  }

  it('returns the stored entry with its timestamps', () => {
    const entry = store.upsertFallbackVaultEntry(draft, 100, 200)
    expect(entry?.id).toBe('vault_new-login')
    expect(entry?.createdAt).toBe(100)
    expect(entry?.updatedAt).toBe(200)
  })

  it('makes the entry readable and listable afterwards', () => {
    store.upsertFallbackVaultEntry(draft, 1, 1)
    expect(store.readFallbackVaultEntry('vault_new-login')?.title).toBe(
      'New login'
    )
    expect(store.listFallbackVaultEntries()).toHaveLength(
      store.DEFAULT_VAULT_LOGINS.length + 1
    )
  })

  it('replaces rather than duplicates an existing slug', () => {
    const before = store.listFallbackVaultEntries().length
    store.upsertFallbackVaultEntry({ ...draft, slug: 'qa' }, 1, 1)
    expect(store.listFallbackVaultEntries()).toHaveLength(before)
    expect(store.readFallbackVaultEntry('vault_qa')?.username).toBe('newbie')
  })
})

describe('deleteFallbackVaultEntry', () => {
  it('removes a seeded entry and reports it', () => {
    expect(store.deleteFallbackVaultEntry('vault_guest')).toBe(true)
    expect(store.readFallbackVaultEntry('vault_guest')).toBeNull()
  })

  it('shortens the listing by exactly one', () => {
    const before = store.listFallbackVaultEntries().length
    store.deleteFallbackVaultEntry('vault_bob')
    expect(store.listFallbackVaultEntries()).toHaveLength(before - 1)
  })

  it('reports false for an id that was never stored', () => {
    expect(store.deleteFallbackVaultEntry('vault_nobody')).toBe(false)
  })

  it('is not fooled by a bare slug', () => {
    expect(store.deleteFallbackVaultEntry('guest')).toBe(false)
    expect(store.readFallbackVaultEntry('vault_guest')).not.toBeNull()
  })
})
