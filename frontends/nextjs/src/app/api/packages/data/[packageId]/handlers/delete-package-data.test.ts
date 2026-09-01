import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as Routing from '@/lib/routing'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const ops = vi.hoisted(() => ({ remove: vi.fn() }))
const entitySpy = vi.hoisted(() => vi.fn(() => ops))

vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<typeof Routing>()
  return { ...actual, getSessionUser: session.getSessionUser }
})
vi.mock('@/lib/db-client', () => ({ db: { entity: entitySpy } }))

import { DELETE } from './delete-package-data'

type Req = Parameters<typeof DELETE>[0]
type Ctx = Parameters<typeof DELETE>[1]

const req = (): Req =>
  new Request('http://localhost/api/packages/data/blog', {
    method: 'DELETE',
  }) as unknown as Req
const ctx = (packageId: string): Ctx =>
  ({ params: Promise.resolve({ packageId }) }) as Ctx

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { role: 'admin' } })
  ops.remove.mockResolvedValue(undefined)
})

describe('DELETE /api/packages/data/[packageId]', () => {
  it('rejects an invalid package id', async () => {
    const res = await DELETE(req(), ctx('Bad-Id!'))
    expect(res.status).toBe(400)
  })

  it('is 401 with no session', async () => {
    session.getSessionUser.mockResolvedValue({ user: null })
    const res = await DELETE(req(), ctx('blog'))
    expect(res.status).toBe(401)
  })

  it('is 403 below admin level', async () => {
    session.getSessionUser.mockResolvedValue({ user: { role: 'user' } })
    const res = await DELETE(req(), ctx('blog'))
    expect(res.status).toBe(403)
  })

  it('removes the row and reports success', async () => {
    const res = await DELETE(req(), ctx('blog'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ deleted: true })
    expect(ops.remove).toHaveBeenCalledWith('blog')
  })

  it('removes from the same entity name PUT/GET use', async () => {
    await DELETE(req(), ctx('blog'))
    expect(entitySpy).toHaveBeenCalledWith('PackageData')
  })

  it('is 500 when the database call throws', async () => {
    ops.remove.mockRejectedValue(new Error('DB down'))
    const res = await DELETE(req(), ctx('blog'))
    expect(res.status).toBe(500)
  })
})
