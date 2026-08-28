import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ hasValidVaultSession: vi.fn(() => true) }))
const ops = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
}))
const fallback = vi.hoisted(() => ({
  DEFAULT_VAULT_LOGINS: [] as unknown[],
  listFallbackVaultEntries: vi.fn(() => [{ slug: 'fallback' }]),
  upsertFallbackVaultEntry: vi.fn(),
}))

vi.mock('../vault-session', () => session)
vi.mock('../vault-fallback-store', () => fallback)
vi.mock('@/lib/db-client', () => ({
  db: { entity: () => ops },
}))

import { GET, POST } from './route'

const pkg = (slug: string, title = slug) => ({
  packageId: `vault_${slug}`,
  version: '1.0.0',
  enabled: true,
  config: JSON.stringify({
    slug,
    title,
    username: 'u',
    password: 'p',
    group: 'G',
    notes: '',
    loginUrl: '/app/login',
    appUrl: '/app',
    createdAt: 1,
    updatedAt: 1,
  }),
  tenantId: 'system',
  installedAt: 1,
})

const req = (body?: unknown) =>
  new Request('http://localhost/api/vault/logins', {
    method: body === undefined ? 'GET' : 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

const valid = {
  slug: 'github',
  title: 'GitHub',
  username: 'alice',
  password: 'secret',
}

describe('/api/vault/logins', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    session.hasValidVaultSession.mockReturnValue(true)
    ops.list.mockResolvedValue({ data: [] })
    ops.create.mockResolvedValue({})
    fallback.DEFAULT_VAULT_LOGINS.length = 0
  })

  describe.each([
    ['GET', () => GET(req())],
    ['POST', () => POST(req(valid))],
  ])('%s access control', (_method, call) => {
    it('refuses without a vault session', async () => {
      session.hasValidVaultSession.mockReturnValue(false)

      const res = await call()

      expect(res.status).toBe(401)
      expect((await res.json()).error).toBe('Authentication required')
    })

    it('does not touch the database when refused', async () => {
      session.hasValidVaultSession.mockReturnValue(false)

      await call()

      expect(ops.list).not.toHaveBeenCalled()
      expect(ops.create).not.toHaveBeenCalled()
    })
  })

  describe('GET', () => {
    it('returns only the vault-prefixed packages', async () => {
      // InstalledPackage holds every package; only vault_* rows are logins.
      ops.list.mockResolvedValue({
        data: [pkg('github'), { packageId: 'forum', config: '{}' }],
      })

      const body = await (await GET(req())).json()

      expect(body.entries).toHaveLength(1)
      expect(body.entries[0].slug).toBe('github')
    })

    it('sorts entries by title', async () => {
      ops.list.mockResolvedValue({
        data: [pkg('b', 'Beta'), pkg('a', 'Alpha')],
      })

      const body = await (await GET(req())).json()

      expect(body.entries.map((e: { title: string }) => e.title)).toEqual([
        'Alpha',
        'Beta',
      ])
    })

    it('scopes the query to the system tenant', async () => {
      await GET(req())

      expect(ops.list).toHaveBeenCalledWith({ filter: { tenantId: 'system' } })
    })

    it('falls back to local entries when DBAL is down', async () => {
      ops.list.mockRejectedValue(new Error('ECONNREFUSED'))

      const body = await (await GET(req())).json()

      expect(body.entries).toEqual([{ slug: 'fallback' }])
      expect(body.warning).toContain('DBAL unavailable')
    })

    it('names the reason in the warning', async () => {
      ops.list.mockRejectedValue(new Error('connect timeout'))

      const body = await (await GET(req())).json()

      expect(body.warning).toContain('connect timeout')
    })

    it('answers 200 with a warning rather than an error status', async () => {
      // The vault stays usable read-only when DBAL is unreachable.
      ops.list.mockRejectedValue(new Error('down'))

      expect((await GET(req())).status).toBe(200)
    })
  })

  describe('POST', () => {
    it.each([
      ['no slug', { ...valid, slug: '' }],
      ['no title', { ...valid, title: '' }],
      ['no username', { ...valid, username: '' }],
      ['no password', { ...valid, password: '' }],
      ['whitespace-only slug', { ...valid, slug: '   ' }],
    ])('refuses an entry with %s', async (_label, body) => {
      const res = await POST(req(body))

      expect(res.status).toBe(400)
      expect(ops.create).not.toHaveBeenCalled()
    })

    it('refuses a body that is not an object', async () => {
      const bad = new Request('http://localhost/api/vault/logins', {
        method: 'POST',
        body: 'not json',
      })

      expect((await POST(bad)).status).toBe(400)
    })

    it('creates the entry under a vault package id', async () => {
      await POST(req(valid))

      expect(ops.create).toHaveBeenCalledWith(
        expect.objectContaining({
          packageId: 'vault_github',
          tenantId: 'system',
        })
      )
    })

    it('defaults a blank group rather than storing an empty one', async () => {
      await POST(req({ ...valid, group: '   ' }))

      const config = JSON.parse(
        (ops.create.mock.calls[0][0] as { config: string }).config
      )
      expect(config.group).toBe('General')
    })

    it('trims the fields it stores', async () => {
      await POST(req({ ...valid, title: '  GitHub  ' }))

      const config = JSON.parse(
        (ops.create.mock.calls[0][0] as { config: string }).config
      )
      expect(config.title).toBe('GitHub')
    })
  })
})
