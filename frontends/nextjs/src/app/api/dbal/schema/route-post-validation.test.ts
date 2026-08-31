import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const registryModule = vi.hoisted(() => ({
  loadSchemaRegistry: vi.fn(() => ({ packages: {}, migrationQueue: [] })),
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

const req = (body: unknown) =>
  new Request('http://localhost/api/dbal/schema', {
    method: 'POST',
    body: JSON.stringify(body),
  })

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { id: 'u1', role: 'god' } })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('POST /api/dbal/schema body validation', () => {
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
