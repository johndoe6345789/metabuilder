import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const registryModule = vi.hoisted(() => ({
  loadSchemaRegistry: vi.fn(() => ({ packages: {}, migrationQueue: [] })),
  saveSchemaRegistry: vi.fn(),
  getPendingMigrations: vi.fn(() => []),
  approveMigration: vi.fn(() => true),
}))

vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, getSessionUser: session.getSessionUser }
})
vi.mock('@/lib/schema/schema-registry', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, ...registryModule }
})

import { POST } from './route'

const registry = { packages: { forum: {} }, migrationQueue: [] }
const req = (body: unknown) =>
  new Request('http://localhost/api/dbal/schema', {
    method: 'POST',
    body: JSON.stringify(body),
  })

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { id: 'u1', role: 'god' } })
  registryModule.loadSchemaRegistry.mockReturnValue(registry)
  registryModule.getPendingMigrations.mockReturnValue([])
  registryModule.approveMigration.mockReturnValue(true)
})

describe('POST approve', () => {
  it('approves one migration by id and saves the registry', async () => {
    const res = await POST(req({ action: 'approve', id: 'm1' }))
    const body = await res.json()

    expect(body).toMatchObject({ action: 'approve', id: 'm1' })
    expect(registryModule.approveMigration).toHaveBeenCalledWith('m1', registry)
    expect(registryModule.saveSchemaRegistry).toHaveBeenCalled()
  })

  it('reports 404 rather than saving when the id is not found', async () => {
    registryModule.approveMigration.mockReturnValue(false)

    const res = await POST(req({ action: 'approve', id: 'missing' }))

    expect(res.status).toBe(404)
    expect(registryModule.saveSchemaRegistry).not.toHaveBeenCalled()
  })

  it('approves every pending migration when id is "all"', async () => {
    registryModule.getPendingMigrations.mockReturnValue([
      { id: 'm1' },
      { id: 'm2' },
    ])

    const res = await POST(req({ action: 'approve', id: 'all' }))
    const body = await res.json()

    expect(body.approved).toBe(2)
    expect(registryModule.approveMigration).toHaveBeenCalledTimes(2)
  })
})
