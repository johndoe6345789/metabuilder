import { beforeEach, describe, expect, it, vi } from 'vitest'

const jar = vi.hoisted(() => ({ cookies: vi.fn() }))
vi.mock('next/headers', () => jar)

const session = vi.hoisted(() => ({ fetchSession: vi.fn() }))
vi.mock('@/lib/auth/api/fetch-session', () => session)

import { mayViewPage } from './page-access'
import type { TenantPage } from './fetch-tenant-page'

const page = (over: Partial<TenantPage> = {}): TenantPage => ({
  id: 'p1',
  path: '/members',
  title: 'Members',
  level: 0,
  requiresAuth: false,
  requiredRole: null,
  componentTree: {},
  pageTreeId: 't1',
  isActive: true,
  ...over,
})

const signedInAs = (role: string) => {
  jar.cookies.mockResolvedValue({ get: () => ({ value: 'tok' }) })
  session.fetchSession.mockResolvedValue({ id: 'u1', role })
}
const signedOut = () => {
  jar.cookies.mockResolvedValue({ get: () => undefined })
}

beforeEach(() => {
  vi.clearAllMocks()
})

/**
 * A founder can mark a page Admin-only, God-only or logged-in-only: the
 * builder has an Access level picker, the Page Routes tab has another, and
 * the row carries level/requiresAuth/requiredRole.
 *
 * The client renderer honours that through LevelGate. The two server-
 * rendered routes -- /{tenant}/{path} and its nested form -- fetched those
 * three fields and then rendered the tree without looking at any of them,
 * so a page marked "Admin only" was served in full to anyone with the URL,
 * and was crawlable besides.
 */
describe('who may see a published page', () => {
  it('lets anyone see a public page, without asking who they are', async () => {
    signedOut()
    expect(await mayViewPage(page())).toBe(true)
    // A public page must not cost a session lookup on every view.
    expect(session.fetchSession).not.toHaveBeenCalled()
  })

  it('refuses a signed-out visitor a page that requires a level', async () => {
    signedOut()
    expect(await mayViewPage(page({ level: 3 }))).toBe(false)
  })

  it('refuses a visitor below the level the founder set', async () => {
    signedInAs('user')
    expect(await mayViewPage(page({ level: 3 }))).toBe(false)
  })

  it('admits a visitor at the level the founder set', async () => {
    signedInAs('admin')
    expect(await mayViewPage(page({ level: 3 }))).toBe(true)
  })

  it('admits someone above it -- levels are a floor, not a match', async () => {
    signedInAs('supergod')
    expect(await mayViewPage(page({ level: 3 }))).toBe(true)
  })

  it('treats requiresAuth as "any signed-in visitor"', async () => {
    signedOut()
    expect(await mayViewPage(page({ requiresAuth: true }))).toBe(false)
    signedInAs('user')
    expect(await mayViewPage(page({ requiresAuth: true }))).toBe(true)
  })

  it('reads requiredRole as a floor too', async () => {
    signedInAs('moderator')
    expect(await mayViewPage(page({ requiredRole: 'admin' }))).toBe(false)
    signedInAs('admin')
    expect(await mayViewPage(page({ requiredRole: 'admin' }))).toBe(true)
  })

  // A cookie that names nobody is a signed-out visitor, not a trusted one.
  it('refuses a token the data layer will not vouch for', async () => {
    jar.cookies.mockResolvedValue({ get: () => ({ value: 'stale' }) })
    session.fetchSession.mockResolvedValue(null)
    expect(await mayViewPage(page({ level: 1 }))).toBe(false)
  })

  // Failing closed matters more than staying up: the whole point is that
  // this is the only thing standing in front of a private page.
  it('refuses when it cannot tell -- it does not fail open', async () => {
    jar.cookies.mockResolvedValue({ get: () => ({ value: 'tok' }) })
    session.fetchSession.mockRejectedValue(new Error('DBAL down'))
    expect(await mayViewPage(page({ level: 3 }))).toBe(false)
  })
})
