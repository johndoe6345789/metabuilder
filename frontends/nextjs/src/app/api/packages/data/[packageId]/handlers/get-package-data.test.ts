import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as Routing from '@/lib/routing'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const ops = vi.hoisted(() => ({ read: vi.fn() }))
const entitySpy = vi.hoisted(() => vi.fn(() => ops))

vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<typeof Routing>()
  return { ...actual, getSessionUser: session.getSessionUser }
})
vi.mock('@/lib/db-client', () => ({ db: { entity: entitySpy } }))

import { GET } from './get-package-data'

type Req = Parameters<typeof GET>[0]
type Ctx = Parameters<typeof GET>[1]

const req = (): Req =>
  new Request('http://localhost/api/packages/data/blog') as unknown as Req
const ctx = (packageId: string): Ctx =>
  ({ params: Promise.resolve({ packageId }) }) as Ctx

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { role: 'user' } })
  ops.read.mockResolvedValue(null)
})

describe('GET /api/packages/data/[packageId]', () => {
  it('rejects an invalid package id', async () => {
    const res = await GET(req(), ctx('Bad-Id!'))
    expect(res.status).toBe(400)
  })

  it('is 401 with no session', async () => {
    session.getSessionUser.mockResolvedValue({ user: null })
    const res = await GET(req(), ctx('blog'))
    expect(res.status).toBe(401)
  })

  it('returns null data when no row exists', async () => {
    ops.read.mockResolvedValue(null)
    const res = await GET(req(), ctx('blog'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ data: null })
  })

  it('parses and returns the stored JSON data', async () => {
    ops.read.mockResolvedValue({ data: JSON.stringify({ hello: 'world' }) })
    const res = await GET(req(), ctx('blog'))
    expect(await res.json()).toEqual({ data: { hello: 'world' } })
  })

  it('reads from the same entity name PUT writes to', async () => {
    await GET(req(), ctx('blog'))
    expect(entitySpy).toHaveBeenCalledWith('PackageData')
  })

  it('is 500 when the database call throws', async () => {
    ops.read.mockRejectedValue(new Error('DB down'))
    const res = await GET(req(), ctx('blog'))
    expect(res.status).toBe(500)
  })
})
