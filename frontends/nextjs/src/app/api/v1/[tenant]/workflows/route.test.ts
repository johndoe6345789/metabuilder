import { beforeEach, describe, expect, it, vi } from 'vitest'

const mw = vi.hoisted(() => ({ applyRateLimit: vi.fn(() => null) }))
const auth = vi.hoisted(() => ({ authenticate: vi.fn() }))
const store = vi.hoisted(() => ({
  listWorkflows: vi.fn(async () => ({ items: [], total: 0 })),
  createWorkflow: vi.fn(async (record: Record<string, unknown>) => record),
}))

vi.mock('@/lib/middleware/rate-limit', () => mw)
vi.mock('@/lib/middleware/auth-middleware', () => auth)
vi.mock('./workflows-store', () => store)

import { GET, POST } from './route'

const params = (tenant = 'acme') => ({ params: Promise.resolve({ tenant }) })

const req = (query = '') =>
  new Request(`http://localhost/api/v1/acme/workflows${query}`) as never

const signedInAs = (over: Record<string, unknown> = {}) => {
  auth.authenticate.mockResolvedValue({
    success: true,
    user: { id: 'u1', tenantId: 'acme', level: 1, ...over },
  })
}

describe('GET /api/v1/[tenant]/workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mw.applyRateLimit.mockReturnValue(null)
    signedInAs()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('rate limiting', () => {
    it('returns the limiter response before authenticating', async () => {
      mw.applyRateLimit.mockReturnValue(
        new Response('', { status: 429 }) as never
      )

      const res = await GET(req(), params())

      expect(res.status).toBe(429)
      expect(auth.authenticate).not.toHaveBeenCalled()
    })
  })

  describe('authentication', () => {
    it('refuses when authentication fails', async () => {
      auth.authenticate.mockResolvedValue({ success: false })

      expect((await GET(req(), params())).status).toBe(401)
    })

    it('refuses when it succeeds but yields no user', async () => {
      auth.authenticate.mockResolvedValue({ success: true, user: null })

      expect((await GET(req(), params())).status).toBe(401)
    })

    it('prefers the error response the authenticator supplied', async () => {
      auth.authenticate.mockResolvedValue({
        success: false,
        error: new Response('', { status: 418 }),
      })

      expect((await GET(req(), params())).status).toBe(418)
    })
  })

  describe('tenant isolation', () => {
    it('refuses a user reading another tenant', async () => {
      signedInAs({ tenantId: 'other', level: 1 })

      const res = await GET(req(), params('acme'))

      expect(res.status).toBe(403)
      expect((await res.json()).message).toBe('Access denied to this tenant')
    })

    it('allows a user reading their own tenant', async () => {
      signedInAs({ tenantId: 'acme', level: 1 })

      expect((await GET(req(), params('acme'))).status).toBe(200)
    })

    it('allows god and above to cross tenants', async () => {
      signedInAs({ tenantId: 'other', level: 4 })

      expect((await GET(req(), params('acme'))).status).toBe(200)
    })

    it('does not let level 3 cross tenants', async () => {
      signedInAs({ tenantId: 'other', level: 3 })

      expect((await GET(req(), params('acme'))).status).toBe(403)
    })
  })

  describe('paging', () => {
    it('defaults to 50', async () => {
      const body = await (await GET(req(), params())).json()
      expect(body.pagination.limit).toBe(50)
    })

    it('caps the limit at 100', async () => {
      // Otherwise a caller could ask for the whole table in one request.
      const body = await (await GET(req('?limit=5000'), params())).json()
      expect(body.pagination.limit).toBe(100)
    })

    it('takes a limit below the cap', async () => {
      const body = await (await GET(req('?limit=10'), params())).json()
      expect(body.pagination.limit).toBe(10)
    })

    it('reports hasMore false for an empty result', async () => {
      const body = await (await GET(req(), params())).json()
      expect(body.pagination.hasMore).toBe(false)
    })

    it('defaults the offset to zero', async () => {
      const body = await (await GET(req(), params())).json()
      expect(body.pagination.offset).toBe(0)
    })
  })

  describe('errors', () => {
    it('answers 500 rather than throwing', async () => {
      auth.authenticate.mockRejectedValue(new Error('boom'))

      const res = await GET(req(), params())

      expect(res.status).toBe(500)
      expect((await res.json()).message).toBe('Failed to list workflows')
    })
  })
})

const validBody = {
  name: 'Sync inventory',
  category: 'automation',
}

const postReq = (body: unknown): Request =>
  new Request('http://localhost/api/v1/acme/workflows', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('POST /api/v1/[tenant]/workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mw.applyRateLimit.mockReturnValue(null)
    signedInAs({ level: 2 })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('asks the authenticator for at least level 2', async () => {
    await POST(postReq(validBody), params())
    expect(auth.authenticate).toHaveBeenCalledWith(
      expect.anything(),
      { minLevel: 2 }
    )
  })

  it('applies mutation-rate limiting before authenticating', async () => {
    mw.applyRateLimit.mockReturnValue(new Response('', { status: 429 }))
    const res = await POST(postReq(validBody), params())
    expect(res.status).toBe(429)
    expect(auth.authenticate).not.toHaveBeenCalled()
  })

  it('is 400 for a body that is not JSON', async () => {
    const res = await POST(postReq('not json'), params())
    expect(res.status).toBe(400)
    expect(store.createWorkflow).not.toHaveBeenCalled()
  })

  it('is 400 when the name is missing', async () => {
    const res = await POST(postReq({ category: 'automation' }), params())
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.errors).toContain('name is required and must be a string')
  })

  it('is 400 for an unrecognised category', async () => {
    const res = await POST(
      postReq({ name: 'x', category: 'made-up' }),
      params()
    )
    expect(res.status).toBe(400)
  })

  it('persists the workflow and returns 201', async () => {
    const res = await POST(postReq(validBody), params())
    expect(res.status).toBe(201)
    expect(store.createWorkflow).toHaveBeenCalledOnce()
    const body = await res.json()
    expect(body.name).toBe('Sync inventory')
    expect(body.category).toBe('automation')
  })

  // The caller cannot write into another tenant, and cannot claim to be
  // someone else, by naming either in the body.
  it('stamps the resolved tenant and author, ignoring what the body claims', async () => {
    await POST(
      postReq({ ...validBody, tenantId: 'other', createdBy: 'someone-else' }),
      params('acme')
    )
    const record = store.createWorkflow.mock.calls[0]?.[0] as Record<
      string,
      unknown
    >
    expect(record.tenantId).toBe('acme')
    expect(record.createdBy).toBe('u1')
  })

  it('answers 500 rather than throwing when the write fails', async () => {
    store.createWorkflow.mockRejectedValue(new Error('DBAL down'))
    const res = await POST(postReq(validBody), params())
    expect(res.status).toBe(500)
  })
})
