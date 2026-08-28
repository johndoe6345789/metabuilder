import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const middleware = vi.hoisted(() => ({ applyRateLimit: vi.fn(() => null) }))
vi.mock('@/lib/middleware', () => middleware)

import { POST } from './route'

const SECRET = 'setup-secret-value'

function request(auth?: string) {
  return new Request('http://localhost/api/bootstrap', {
    method: 'POST',
    headers: auth === undefined ? {} : { Authorization: auth },
  }) as never
}

/** Every DBAL write succeeds unless a test says otherwise. */
function mockDbal(handler?: (url: string, init?: RequestInit) => Response) {
  const calls: { url: string; method: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method ?? 'GET' })
      if (handler !== undefined) return handler(String(url), init)
      return { ok: true, status: 200, json: async () => ({}) } as Response
    })
  )
  return calls
}

describe('POST /api/bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    middleware.applyRateLimit.mockReturnValue(null)
    vi.stubEnv('SETUP_SECRET', SECRET)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  describe('rate limiting', () => {
    it('returns the limiter response and does nothing else', async () => {
      const limited = new Response('slow down', { status: 429 })
      middleware.applyRateLimit.mockReturnValue(limited as never)
      const calls = mockDbal()

      const res = await POST(request(`Bearer ${SECRET}`))

      expect(res.status).toBe(429)
      expect(calls).toHaveLength(0)
    })

    it('is checked before the secret, so probing is limited too', async () => {
      middleware.applyRateLimit.mockReturnValue(
        new Response('', { status: 429 }) as never
      )
      mockDbal()

      expect((await POST(request())).status).toBe(429)
    })
  })

  describe('authorization', () => {
    it.each([
      ['no header', undefined],
      ['the wrong secret', 'Bearer wrong'],
      ['a bare secret with no scheme', SECRET],
      ['a Basic credential', 'Basic anything'],
    ])('refuses %s', async (_label, auth) => {
      const calls = mockDbal()

      const res = await POST(request(auth))

      expect(res.status).toBe(401)
      expect(calls).toHaveLength(0)
    })

    it('refuses everything when SETUP_SECRET is unset', async () => {
      // Otherwise an unconfigured deployment would expose a seed endpoint.
      vi.stubEnv('SETUP_SECRET', '')
      mockDbal()

      expect((await POST(request('Bearer '))).status).toBe(401)
    })

    it('accepts the configured secret', async () => {
      mockDbal()

      const res = await POST(request(`Bearer ${SECRET}`))

      expect(res.status).toBe(200)
    })
  })

  describe('seeding', () => {
    it('reports what it wrote', async () => {
      mockDbal()

      const body = await (await POST(request(`Bearer ${SECRET}`))).json()

      expect(body.success).toBe(true)
      expect(body.results.packages).toBeGreaterThan(0)
    })

    it('writes to the system tenant core package', async () => {
      const calls = mockDbal()

      await POST(request(`Bearer ${SECRET}`))

      expect(calls.every(c => c.url.includes('/system/core/'))).toBe(true)
    })

    it('falls back to PUT when a create conflicts', async () => {
      // A re-run must update the existing row rather than fail on 409.
      // Any POST conflicts; the route must then retry the same row as a PUT.
      const calls = mockDbal((_url, init) => {
        const conflict = (init?.method ?? 'GET') === 'POST'
        return {
          ok: !conflict,
          status: conflict ? 409 : 200,
          json: async () => ({}),
        } as Response
      })

      await POST(request(`Bearer ${SECRET}`))

      expect(calls.some(c => c.method === 'PUT')).toBe(true)
    })

    it('counts errors instead of aborting the run', async () => {
      const calls = mockDbal(
        () => ({ ok: false, status: 500, json: async () => ({}) }) as Response
      )

      const body = await (await POST(request(`Bearer ${SECRET}`))).json()

      expect(body.results.errors).toBeGreaterThan(0)
      // It kept going rather than stopping at the first failure.
      expect(calls.length).toBeGreaterThan(1)
    })
  })
})
