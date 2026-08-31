import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const registryModule = vi.hoisted(() => ({
  loadSchemaRegistry: vi.fn(),
  getPendingMigrations: vi.fn(() => []),
}))

vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, getSessionUser: session.getSessionUser }
})
vi.mock('@/lib/schema/schema-registry', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, ...registryModule }
})

import { GET } from './route'

const registry = { packages: { forum: {} }, migrationQueue: [] }
const req = () => new Request('http://localhost/api/dbal/schema')

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { id: 'u1', role: 'god' } })
  registryModule.loadSchemaRegistry.mockReturnValue(registry)
  registryModule.getPendingMigrations.mockReturnValue([])
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('GET /api/dbal/schema', () => {
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

  it('answers 500 instead of throwing when the registry will not load', async () => {
    registryModule.loadSchemaRegistry.mockImplementation(() => {
      throw new Error('corrupt')
    })

    const res = await GET(req())

    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe('Failed to load schema registry')
  })
})
