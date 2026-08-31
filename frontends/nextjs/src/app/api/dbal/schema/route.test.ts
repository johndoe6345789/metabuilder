import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const registryModule = vi.hoisted(() => ({
  loadSchemaRegistry: vi.fn(() => ({ packages: {}, migrationQueue: [] })),
  saveSchemaRegistry: vi.fn(),
}))
const scanner = vi.hoisted(() => ({
  scanAllPackages: vi.fn(() => ({ scanned: 0, queued: 0, errors: [] })),
}))

vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, getSessionUser: session.getSessionUser }
})
vi.mock('@/lib/schema/schema-registry', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, ...registryModule }
})
vi.mock('@/lib/schema/schema-scanner', () => scanner)

import { GET, POST } from './route'

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

beforeEach(() => vi.clearAllMocks())

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
