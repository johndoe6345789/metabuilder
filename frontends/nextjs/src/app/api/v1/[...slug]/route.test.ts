import { beforeEach, describe, expect, it, vi } from 'vitest'

const mw = vi.hoisted(() => ({ applyRateLimit: vi.fn(() => null) }))
const routing = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  validatePackageRoute: vi.fn(),
  validateTenantAccess: vi.fn(),
  executeDbalOperation: vi.fn(),
  executePackageAction: vi.fn(),
}))

vi.mock('@/lib/middleware', () => mw)
vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, ...routing }
})

import { GET, POST, DELETE } from './route'

const params = (slug: string[]) => ({ params: Promise.resolve({ slug }) })

const req = (method: string, path: string, body?: unknown) =>
  new Request(`http://localhost/api/v1/${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as never

const POSTS = ['acme', 'forum', 'posts']

describe('/api/v1/[...slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mw.applyRateLimit.mockReturnValue(null)
    routing.getSessionUser.mockResolvedValue({
      user: { id: 'u1', role: 'user', tenantId: 'acme' },
    })
    routing.validatePackageRoute.mockReturnValue({
      allowed: true,
      package: { minLevel: 1 },
    })
    routing.validateTenantAccess.mockResolvedValue({
      allowed: true,
      tenant: { id: 'acme' },
    })
    routing.executePackageAction.mockResolvedValue({
      success: false,
      code: 'NOT_FOUND',
    })
    routing.executeDbalOperation.mockResolvedValue({
      success: true,
      data: [{ id: 'p1' }],
    })
  })

  describe('rate limiting', () => {
    it('returns the limiter response before doing any work', async () => {
      mw.applyRateLimit.mockReturnValue(
        new Response('', { status: 429 }) as never
      )

      const res = await GET(req('GET', 'acme/forum/posts'), params(POSTS))

      expect(res.status).toBe(429)
      expect(routing.getSessionUser).not.toHaveBeenCalled()
    })

    it.each([
      ['GET', 'acme/forum/posts', POSTS, 'list'],
      ['POST', 'acme/forum/posts', POSTS, 'mutation'],
      ['POST', 'acme/auth/login', ['acme', 'auth', 'login'], 'login'],
      ['POST', 'acme/auth/register', ['acme', 'auth', 'register'], 'register'],
    ])('applies the %s %s limit as %s', async (method, path, slug, kind) => {
      const handler = method === 'GET' ? GET : POST
      // A GET Request cannot carry a body, so only send one on mutations.
      const body = method === 'GET' ? undefined : {}
      await handler(req(method, path, body), params(slug))

      expect(mw.applyRateLimit).toHaveBeenCalledWith(expect.anything(), kind)
    })
  })

  describe('authorization', () => {
    it('answers 401 for an anonymous caller refused by the package', async () => {
      routing.getSessionUser.mockResolvedValue({ user: null })
      routing.validatePackageRoute.mockReturnValue({
        allowed: false,
        reason: 'Login required',
      })

      const res = await GET(req('GET', 'acme/forum/posts'), params(POSTS))

      expect(res.status).toBe(401)
    })

    it('answers 403 for a signed-in caller refused by the package', async () => {
      routing.validatePackageRoute.mockReturnValue({
        allowed: false,
        reason: 'Level too low',
      })

      const res = await GET(req('GET', 'acme/forum/posts'), params(POSTS))

      expect(res.status).toBe(403)
    })

    it('answers 403 when the tenant refuses a signed-in caller', async () => {
      routing.validateTenantAccess.mockResolvedValue({
        allowed: false,
        reason: 'Not a member of this tenant',
      })

      const res = await GET(req('GET', 'acme/forum/posts'), params(POSTS))

      expect(res.status).toBe(403)
    })

    it('does not reach DBAL for a refused request', async () => {
      routing.validateTenantAccess.mockResolvedValue({ allowed: false })

      await GET(req('GET', 'acme/forum/posts'), params(POSTS))

      expect(routing.executeDbalOperation).not.toHaveBeenCalled()
    })

    it('passes the package minLevel to the tenant check', async () => {
      routing.validatePackageRoute.mockReturnValue({
        allowed: true,
        package: { minLevel: 4 },
      })

      await GET(req('GET', 'acme/forum/posts'), params(POSTS))

      expect(routing.validateTenantAccess).toHaveBeenCalledWith(
        expect.anything(),
        'acme',
        4
      )
    })

    it('treats a user with a non-string role as public', async () => {
      routing.getSessionUser.mockResolvedValue({ user: { id: 'u1', role: 7 } })

      await GET(req('GET', 'acme/forum/posts'), params(POSTS))

      expect(routing.validatePackageRoute).toHaveBeenCalledWith(
        'forum',
        'posts',
        expect.objectContaining({ role: 'public' })
      )
    })
  })

  describe('request body', () => {
    it('rejects a malformed JSON body', async () => {
      const bad = new Request('http://localhost/api/v1/acme/forum/posts', {
        method: 'POST',
        body: '{ not json',
      }) as never

      const res = await POST(bad, params(POSTS))

      expect(res.status).toBe(400)
    })

    it('accepts an empty body on a mutation', async () => {
      const res = await POST(req('POST', 'acme/forum/posts'), params(POSTS))
      expect(res.status).toBeLessThan(400)
    })
  })

  describe('missing tenant', () => {
    it('answers 404 when access was allowed but no tenant resolved', async () => {
      routing.validateTenantAccess.mockResolvedValue({ allowed: true })

      const res = await GET(req('GET', 'acme/forum/posts'), params(POSTS))

      expect(res.status).toBe(404)
    })
  })

  describe('dispatch', () => {
    it('falls through to DBAL when no package override handles it', async () => {
      await GET(req('GET', 'acme/forum/posts'), params(POSTS))

      expect(routing.executeDbalOperation).toHaveBeenCalled()
    })

    it('prefers a package override over DBAL', async () => {
      routing.executePackageAction.mockResolvedValue({
        success: true,
        data: [{ id: 'override' }],
      })

      const res = await GET(req('GET', 'acme/forum/posts'), params(POSTS))

      expect(res.status).toBe(200)
      expect(routing.executeDbalOperation).not.toHaveBeenCalled()
    })

    it('answers 404 for an action that does not exist', async () => {
      routing.executePackageAction.mockResolvedValue({
        success: false,
        code: 'NOT_FOUND',
        error: 'No such action',
      })

      const res = await POST(
        req('POST', 'acme/forum/posts/p1/like', {}),
        params(['acme', 'forum', 'posts', 'p1', 'like'])
      )

      expect(res.status).toBe(404)
    })

    it('answers 400 when an action fails for another reason', async () => {
      routing.executePackageAction.mockResolvedValue({
        success: false,
        code: 'BAD_INPUT',
        error: 'Already liked',
      })

      const res = await POST(
        req('POST', 'acme/forum/posts/p1/like', {}),
        params(['acme', 'forum', 'posts', 'p1', 'like'])
      )

      expect(res.status).toBe(400)
    })

    it('deletes through the same guards', async () => {
      await DELETE(
        req('DELETE', 'acme/forum/posts/p1'),
        params(['acme', 'forum', 'posts', 'p1'])
      )

      expect(routing.validateTenantAccess).toHaveBeenCalled()
    })
  })
})
