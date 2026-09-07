import { beforeEach, describe, expect, it, vi } from 'vitest'

const jar = vi.hoisted(() => ({ cookies: vi.fn() }))
vi.mock('next/headers', () => jar)

const session = vi.hoisted(() => ({ fetchSession: vi.fn() }))
vi.mock('@/lib/auth/api/fetch-session', () => session)

const store = vi.hoisted(() => ({
  listObjects: vi.fn(async () => []),
  getObject: vi.fn(async () => null),
  putObject: vi.fn(async () => undefined),
  deleteObject: vi.fn(async () => undefined),
  ensureBucket: vi.fn(async () => undefined),
}))
vi.mock('@/lib/object-store/client', () => store)

import { GET as list } from './route'
import { DELETE as remove } from './[...path]/route'

const req = (tenant: string) =>
  ({
    nextUrl: { searchParams: new URLSearchParams({ tenant }) },
  }) as unknown as Parameters<typeof list>[0]

const path = { params: Promise.resolve({ path: ['logo.png'] }) }

const signedInAs = (tenantId: string, role = 'god') => {
  jar.cookies.mockResolvedValue({ get: () => ({ value: 'tok' }) })
  session.fetchSession.mockResolvedValue({ id: 'u1', tenantId, role })
}
const signedOut = () => {
  jar.cookies.mockResolvedValue({ get: () => undefined })
}

beforeEach(() => {
  vi.clearAllMocks()
})

/**
 * Both of these took the tenant from a query parameter and never asked
 * whether the caller owned it. Listing had no session check at all, so any
 * visitor could enumerate any community's uploads by editing the URL; the
 * delete checked only that *somebody* was signed in, so one founder could
 * remove the logos and images off another's live pages.
 *
 * Fetching a single object stays open on purpose -- that is how an image
 * on a published page loads.
 */
describe('reaching another community’s assets', () => {
  it('does not list a bucket to a signed-out visitor', async () => {
    signedOut()
    const res = await list(req('harbour_cycle_works'))

    expect(res.status).toBe(401)
    expect(store.listObjects).not.toHaveBeenCalled()
  })

  it('does not list a bucket that is not the caller’s', async () => {
    signedInAs('acme')
    const res = await list(req('harbour_cycle_works'))

    expect(res.status).toBe(403)
    expect(store.listObjects).not.toHaveBeenCalled()
  })

  it('lists the caller’s own', async () => {
    signedInAs('harbour_cycle_works')
    const res = await list(req('harbour_cycle_works'))

    expect(res.status).toBe(200)
    expect(store.listObjects).toHaveBeenCalled()
  })

  it('lets the instance owner list any', async () => {
    signedInAs('acme', 'supergod')
    expect((await list(req('harbour_cycle_works'))).status).toBe(200)
  })

  it('does not delete from a bucket that is not the caller’s', async () => {
    signedInAs('acme')
    const res = await remove(req('harbour_cycle_works'), path)

    expect(res.status).toBe(403)
    expect(store.deleteObject).not.toHaveBeenCalled()
  })

  it('deletes from the caller’s own', async () => {
    signedInAs('harbour_cycle_works')
    const res = await remove(req('harbour_cycle_works'), path)

    expect(res.status).toBe(200)
    expect(store.deleteObject).toHaveBeenCalled()
  })
})
