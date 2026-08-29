import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const registryModule = vi.hoisted(() => ({
  loadSchemaRegistry: vi.fn(),
  saveSchemaRegistry: vi.fn(),
  getPendingMigrations: vi.fn(() => []),
  generateSchemaFragment: vi.fn(() => ''),
  approveMigration: vi.fn(() => true),
  rejectMigration: vi.fn(() => true),
}))
const scanner = vi.hoisted(() => ({
  scanAllPackages: vi.fn(() => ({ scanned: 2, queued: 1, errors: [] })),
}))
const fsMock = vi.hoisted(() => ({ writeFileSync: vi.fn() }))

vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, getSessionUser: session.getSessionUser }
})
vi.mock('@/lib/schema/schema-registry', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, ...registryModule }
})
vi.mock('@/lib/schema/schema-scanner', () => scanner)
vi.mock('fs', () => ({ ...fsMock, default: fsMock }))

import { GET, POST } from './route'

const registry = { packages: { forum: {} }, migrationQueue: [] }

const req = (body?: unknown) =>
  new Request('http://localhost/api/dbal/schema', {
    method: body === undefined ? 'GET' : 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

const signedInAs = (role: string | null) => {
  session.getSessionUser.mockResolvedValue({
    user: role === null ? null : { id: 'u1', role },
  })
}

describe('/api/dbal/schema', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    registryModule.loadSchemaRegistry.mockReturnValue(registry)
    registryModule.getPendingMigrations.mockReturnValue([])
    registryModule.generateSchemaFragment.mockReturnValue('')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe.each([
    ['GET', () => GET(req())],
    ['POST', () => POST(req({ action: 'scan' }))],
  ])('%s access control', (_method, call) => {
    it('refuses an anonymous caller', async () => {
      signedInAs(null)
      const res = await call()

      expect(res.status).toBe(401)
      expect((await res.json()).error).toBe('Authentication required')
    })

    it('refuses a signed-in user below god', async () => {
      signedInAs('user')
      const res = await call()

      expect(res.status).toBe(403)
      expect((await res.json()).error).toBe('God level access required')
    })

    it('refuses an admin, which is still below god', async () => {
      signedInAs('admin')
      expect((await call()).status).toBe(403)
    })

    it('does not touch the registry for a refused caller', async () => {
      signedInAs('user')
      await call()

      expect(registryModule.loadSchemaRegistry).not.toHaveBeenCalled()
    })

    it('allows god', async () => {
      signedInAs('god')
      expect((await call()).status).toBe(200)
    })
  })

  describe('GET', () => {
    beforeEach(() => signedInAs('god'))

    it('reports the packages it knows about', async () => {
      const body = await (await GET(req())).json()

      expect(body.status).toBe('ok')
      expect(body.packages).toEqual(['forum'])
    })

    it('summarises pending migrations', async () => {
      registryModule.getPendingMigrations.mockReturnValue([
        {
          id: 'm1',
          packageId: 'forum',
          status: 'pending',
          queuedAt: 'now',
          entities: [{ name: 'Post' }],
        },
      ])

      const body = await (await GET(req())).json()

      expect(body.pendingMigrations).toBe(1)
      expect(body.migrations[0].entities).toEqual(['Post'])
    })

    it('answers 500 rather than throwing when the registry will not load', async () => {
      registryModule.loadSchemaRegistry.mockImplementation(() => {
        throw new Error('corrupt')
      })

      const res = await GET(req())

      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe('Failed to load schema registry')
    })
  })

  describe('POST body validation', () => {
    beforeEach(() => signedInAs('god'))

    it.each([
      [{ action: 'destroy' }],
      [{}],
      [{ action: 'approve', id: '' }],
      [{ action: 1 }],
    ])('rejects %p', async body => {
      const res = await POST(req(body))

      expect(res.status).toBe(400)
      expect((await res.json()).error).toBe('Invalid request body')
    })

    it('answers 500 on a body that is not JSON at all', async () => {
      const bad = new Request('http://localhost/api/dbal/schema', {
        method: 'POST',
        body: 'not json',
      })

      expect((await POST(bad)).status).toBe(500)
    })
  })

  describe('POST scan', () => {
    beforeEach(() => signedInAs('god'))

    it('reports what the scan found and saves the registry', async () => {
      const body = await (await POST(req({ action: 'scan' }))).json()

      expect(body).toMatchObject({
        action: 'scan',
        packagesScanned: 2,
        changesQueued: 1,
      })
      expect(registryModule.saveSchemaRegistry).toHaveBeenCalled()
    })

    it('passes scan errors through rather than hiding them', async () => {
      scanner.scanAllPackages.mockReturnValue({
        scanned: 1,
        queued: 0,
        errors: ['bad package.json'],
      })

      const body = await (await POST(req({ action: 'scan' }))).json()

      expect(body.errors).toEqual(['bad package.json'])
    })
  })

  describe('POST generate', () => {
    beforeEach(() => signedInAs('god'))

    it('writes nothing when there is nothing to generate', async () => {
      registryModule.generateSchemaFragment.mockReturnValue('   ')

      const body = await (await POST(req({ action: 'generate' }))).json()

      expect(body.generated).toBe(false)
      expect(fsMock.writeFileSync).not.toHaveBeenCalled()
    })

    it('writes the fragment when there is one', async () => {
      registryModule.generateSchemaFragment.mockReturnValue('model X {}')

      const body = await (await POST(req({ action: 'generate' }))).json()

      expect(body.generated).toBe(true)
      expect(fsMock.writeFileSync).toHaveBeenCalled()
    })
  })
})
