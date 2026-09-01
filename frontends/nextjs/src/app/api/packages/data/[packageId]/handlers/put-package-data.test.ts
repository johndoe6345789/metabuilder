import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as Routing from '@/lib/routing'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const ops = vi.hoisted(() => ({
  list: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
}))
const entitySpy = vi.hoisted(() => vi.fn(() => ops))

vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<typeof Routing>()
  return { ...actual, getSessionUser: session.getSessionUser }
})
vi.mock('@/lib/db-client', () => ({ db: { entity: entitySpy } }))

import { PUT } from './put-package-data'

type Ctx = Parameters<typeof PUT>[1]

const ctx = (packageId: string): Ctx =>
  ({ params: Promise.resolve({ packageId }) }) as Ctx

const req = (body?: unknown) =>
  new Request('http://localhost/api/packages/data/blog', {
    method: 'PUT',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { role: 'admin' } })
  ops.list.mockResolvedValue({ data: [] })
  ops.update.mockResolvedValue({})
  ops.create.mockResolvedValue({})
})

describe('PUT /api/packages/data/[packageId]', () => {
  it('rejects an invalid package id', async () => {
    const res = await PUT(req({ data: {} }), ctx('Bad-Id!'))
    expect(res.status).toBe(400)
  })

  it('is 401 with no session', async () => {
    session.getSessionUser.mockResolvedValue({ user: null })
    const res = await PUT(req({ data: {} }), ctx('blog'))
    expect(res.status).toBe(401)
  })

  it('is 403 below admin level', async () => {
    session.getSessionUser.mockResolvedValue({ user: { role: 'user' } })
    const res = await PUT(req({ data: {} }), ctx('blog'))
    expect(res.status).toBe(403)
  })

  it('is 400 when the body has no data field', async () => {
    const res = await PUT(req({}), ctx('blog'))
    expect(res.status).toBe(400)
  })

  it('creates a new row when none exists yet', async () => {
    ops.list.mockResolvedValue({ data: [] })
    const res = await PUT(req({ data: { hello: 'world' } }), ctx('blog'))
    expect(res.status).toBe(200)
    expect(ops.create).toHaveBeenCalledWith({
      packageId: 'blog',
      data: JSON.stringify({ hello: 'world' }),
    })
    expect(ops.update).not.toHaveBeenCalled()
  })

  it('updates the existing row when one is found', async () => {
    ops.list.mockResolvedValue({ data: [{ id: 'row1' }] })
    await PUT(req({ data: { hello: 'world' } }), ctx('blog'))
    expect(ops.update).toHaveBeenCalledWith('row1', {
      data: JSON.stringify({ hello: 'world' }),
    })
    expect(ops.create).not.toHaveBeenCalled()
  })

  it('reads and writes the same entity name GET and DELETE use', async () => {
    await PUT(req({ data: {} }), ctx('blog'))
    expect(entitySpy).toHaveBeenCalledWith('PackageData')
  })

  it('is 500 when the database call throws', async () => {
    ops.list.mockRejectedValue(new Error('DB down'))
    const res = await PUT(req({ data: {} }), ctx('blog'))
    expect(res.status).toBe(500)
  })
})
