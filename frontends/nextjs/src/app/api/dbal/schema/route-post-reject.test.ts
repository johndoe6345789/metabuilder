import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const registryModule = vi.hoisted(() => ({
  loadSchemaRegistry: vi.fn(() => ({ packages: {}, migrationQueue: [] })),
  saveSchemaRegistry: vi.fn(),
  rejectMigration: vi.fn(() => true),
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
  registryModule.rejectMigration.mockReturnValue(true)
})

describe('POST reject', () => {
  it('rejects one migration by id and saves the registry', async () => {
    const res = await POST(req({ action: 'reject', id: 'm1' }))
    const body = await res.json()

    expect(body).toMatchObject({ action: 'reject', id: 'm1' })
    expect(registryModule.rejectMigration).toHaveBeenCalledWith('m1', registry)
    expect(registryModule.saveSchemaRegistry).toHaveBeenCalled()
  })

  it('reports 404 rather than saving when the id is not found', async () => {
    registryModule.rejectMigration.mockReturnValue(false)

    const res = await POST(req({ action: 'reject', id: 'missing' }))

    expect(res.status).toBe(404)
    expect(registryModule.saveSchemaRegistry).not.toHaveBeenCalled()
  })
})
