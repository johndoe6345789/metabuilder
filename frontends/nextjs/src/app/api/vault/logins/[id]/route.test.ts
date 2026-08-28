import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ hasValidVaultSession: vi.fn(() => true) }))
const ops = vi.hoisted(() => ({
  read: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  create: vi.fn(),
  list: vi.fn(),
}))
const fallback = vi.hoisted(() => ({
  DEFAULT_VAULT_LOGINS: [] as unknown[],
  readFallbackVaultEntry: vi.fn(() => null),
  deleteFallbackVaultEntry: vi.fn(() => false),
  upsertFallbackVaultEntry: vi.fn(),
  listFallbackVaultEntries: vi.fn(() => []),
}))

vi.mock('../../vault-session', () => session)
vi.mock('../../vault-fallback-store', () => fallback)
vi.mock('@/lib/db-client', () => ({ db: { entity: () => ops } }))

import { DELETE, PUT } from './route'

const stored = (slug = 'github') => ({
  packageId: `vault_${slug}`,
  version: '1.0.0',
  enabled: true,
  config: JSON.stringify({
    slug,
    title: 'GitHub',
    username: 'alice',
    password: 'secret',
    group: 'Dev',
    notes: 'n',
    loginUrl: '/app/login',
    appUrl: '/app',
    createdAt: 1,
    updatedAt: 1,
  }),
  tenantId: 'system',
  installedAt: 1,
})

const ctx = (id = 'vault_github') => ({ params: Promise.resolve({ id }) })

const req = (body?: unknown) =>
  new Request('http://localhost/api/vault/logins/vault_github', {
    method: 'PUT',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

describe('/api/vault/logins/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    session.hasValidVaultSession.mockReturnValue(true)
    ops.read.mockResolvedValue(stored())
    ops.update.mockResolvedValue({})
    ops.remove.mockResolvedValue(true)
    fallback.readFallbackVaultEntry.mockReturnValue(null)
    fallback.deleteFallbackVaultEntry.mockReturnValue(false)
  })

  describe.each([
    ['PUT', () => PUT(req({ title: 'New' }), ctx())],
    ['DELETE', () => DELETE(req(), ctx())],
  ])('%s access control', (_method, call) => {
    it('refuses without a vault session', async () => {
      session.hasValidVaultSession.mockReturnValue(false)

      expect((await call()).status).toBe(401)
    })

    it('does not touch the database when refused', async () => {
      session.hasValidVaultSession.mockReturnValue(false)

      await call()

      expect(ops.read).not.toHaveBeenCalled()
      expect(ops.remove).not.toHaveBeenCalled()
    })
  })

  describe('PUT', () => {
    it('refuses an empty id', async () => {
      const res = await PUT(req({ title: 'x' }), ctx(''))

      expect(res.status).toBe(400)
      expect((await res.json()).error).toBe('Missing login id')
    })

    it('refuses a body that is not an object', async () => {
      const bad = new Request('http://localhost/x', {
        method: 'PUT',
        body: 'not json',
      })

      expect((await PUT(bad, ctx())).status).toBe(400)
    })

    it('answers 404 when neither DBAL nor the fallback has it', async () => {
      ops.read.mockResolvedValue(null)

      const res = await PUT(req({ title: 'x' }), ctx())

      expect(res.status).toBe(404)
    })

    it('falls back to the local entry when DBAL has none', async () => {
      ops.read.mockResolvedValue(null)
      fallback.readFallbackVaultEntry.mockReturnValue({
        slug: 'github',
        title: 'GitHub',
        username: 'alice',
        password: 'secret',
        group: 'Dev',
        notes: '',
        loginUrl: '/app/login',
        appUrl: '/app',
        createdAt: 1,
        updatedAt: 1,
      } as never)

      expect((await PUT(req({ title: 'Renamed' }), ctx())).status).toBe(200)
    })

    it('keeps fields the patch does not mention', async () => {
      // A partial edit must not blank out the password.
      await PUT(req({ title: 'Renamed' }), ctx())

      const written = ops.update.mock.calls[0]?.[1] as { config: string }
      const config = JSON.parse(written.config)
      expect(config.password).toBe('secret')
      expect(config.username).toBe('alice')
      expect(config.title).toBe('Renamed')
    })

    it('preserves createdAt and moves updatedAt', async () => {
      await PUT(req({ title: 'Renamed' }), ctx())

      const written = ops.update.mock.calls[0]?.[1] as { config: string }
      const config = JSON.parse(written.config)
      expect(config.createdAt).toBe(1)
      expect(config.updatedAt).not.toBe(1)
    })

    it('refuses a patch that would blank a required field', async () => {
      const res = await PUT(req({ password: '' }), ctx())

      expect(res.status).toBe(400)
    })

    it('defaults a blank group', async () => {
      await PUT(req({ group: '   ' }), ctx())

      const written = ops.update.mock.calls[0]?.[1] as { config: string }
      expect(JSON.parse(written.config).group).toBe('General')
    })
  })

  describe('DELETE', () => {
    it('refuses an empty id', async () => {
      expect((await DELETE(req(), ctx(''))).status).toBe(400)
    })

    it('reports success when DBAL removed it', async () => {
      ops.remove.mockResolvedValue(true)

      const res = await DELETE(req(), ctx())

      expect(res.status).toBe(200)
      expect((await res.json()).ok).toBe(true)
    })

    it('falls back to the local store when DBAL has nothing', async () => {
      ops.remove.mockResolvedValue(false)
      fallback.deleteFallbackVaultEntry.mockReturnValue(true)

      expect((await DELETE(req(), ctx())).status).toBe(200)
    })

    it('answers 404 when neither had it', async () => {
      ops.remove.mockResolvedValue(false)
      fallback.deleteFallbackVaultEntry.mockReturnValue(false)

      expect((await DELETE(req(), ctx())).status).toBe(404)
    })
  })
})
