import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mw = vi.hoisted(() => ({ applyRateLimit: vi.fn(() => null) }))
const session = vi.hoisted(() => ({ fetchSession: vi.fn() }))

vi.mock('@/lib/middleware/rate-limit', () => mw)
vi.mock('@/lib/auth/api/fetch-session', () => session)
vi.mock('@/app/api/auth/session/route', () => ({
  SESSION_COOKIE: 'mb_session',
}))

import { POST } from './route'

const TOKEN = 'operator-admin-token'

function mockDbal(ok = true) {
  const calls: { url: string; auth?: string; body?: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        auth: (init?.headers as Record<string, string>)?.Authorization,
        body: init?.body as string | undefined,
      })
      return {
        ok,
        status: ok ? 200 : 400,
        text: async () => 'dbal said no',
        json: async () => ({ success: ok }),
      } as Response
    })
  )
  return calls
}

/** A NextRequest-shaped stub: the route reads the session cookie. */
const req = (body: unknown, cookie: string | null = 'session-token') => {
  const base = new Request('http://localhost/api/admin/credentials', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  return Object.assign(base, {
    cookies: {
      get: (name: string) =>
        cookie !== null && name === 'mb_session'
          ? { name, value: cookie }
          : undefined,
    },
  }) as never
}

const signedInAs = (role: string | null, tenantId = 'system') => {
  session.fetchSession.mockResolvedValue(
    role === null ? null : { id: 'u1', role, tenantId }
  )
}

const valid = { username: 'alice', password: 'longenough123' }

describe('POST /api/admin/credentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mw.applyRateLimit.mockReturnValue(null)
    vi.stubEnv('DBAL_ADMIN_TOKEN', TOKEN)
    signedInAs('god')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  describe('rate limiting', () => {
    it('returns the limiter response before authenticating', async () => {
      mw.applyRateLimit.mockReturnValue(
        new Response('', { status: 429 }) as never
      )
      const calls = mockDbal()

      const res = await POST(req(valid))

      expect(res.status).toBe(429)
      expect(session.fetchSession).not.toHaveBeenCalled()
      expect(calls).toHaveLength(0)
    })
  })

  describe('authorization', () => {
    it('refuses an anonymous caller', async () => {
      signedInAs(null)
      const calls = mockDbal()

      expect((await POST(req(valid))).status).toBe(401)
      expect(calls).toHaveLength(0)
    })

    it('refuses when there is no session cookie at all', async () => {
      const calls = mockDbal()

      const res = await POST(req(valid, null))

      expect(res.status).toBe(401)
      // No cookie means no token to verify; do not even ask.
      expect(session.fetchSession).not.toHaveBeenCalled()
      expect(calls).toHaveLength(0)
    })

    it.each([['user'], ['moderator'], ['admin']])(
      'refuses %s, which is below god',
      async role => {
        signedInAs(role)
        const calls = mockDbal()

        const res = await POST(req(valid))

        expect(res.status).toBe(403)
        expect((await res.json()).error).toBe('God level access required')
        expect(calls).toHaveLength(0)
      }
    )

    it('allows god', async () => {
      mockDbal()
      expect((await POST(req(valid))).status).toBe(200)
    })

    it('allows supergod', async () => {
      signedInAs('supergod')
      mockDbal()
      expect((await POST(req(valid))).status).toBe(200)
    })
  })

  describe('tenant scoping', () => {
    it('refuses a god writing into another tenant', async () => {
      signedInAs('god', 'acme')
      const calls = mockDbal()

      const res = await POST(req({ ...valid, tenantId: 'other' }))

      expect(res.status).toBe(403)
      expect(calls).toHaveLength(0)
    })

    it('allows a god writing into its own tenant', async () => {
      signedInAs('god', 'acme')
      mockDbal()

      expect((await POST(req({ ...valid, tenantId: 'acme' }))).status).toBe(200)
    })

    it('lets a supergod write into any tenant', async () => {
      signedInAs('supergod', 'system')
      const calls = mockDbal()

      const res = await POST(req({ ...valid, tenantId: 'acme' }))

      expect(res.status).toBe(200)
      expect(JSON.parse(calls[0].body ?? '{}').tenantId).toBe('acme')
    })

    it('defaults to the caller own tenant when none is named', async () => {
      signedInAs('god', 'acme')
      const calls = mockDbal()

      await POST(req(valid))

      expect(JSON.parse(calls[0].body ?? '{}').tenantId).toBe('acme')
    })
  })

  describe('validation', () => {
    it.each([
      ['a body that is not JSON', 'not json'],
      ['a missing username', { password: 'longenough123' }],
      ['a missing password', { username: 'alice' }],
      ['a non-string username', { username: 7, password: 'longenough123' }],
      ['a short username', { username: 'ab', password: 'longenough123' }],
      ['a short password', { username: 'alice', password: 'short' }],
      ['a whitespace password', { username: 'alice', password: '        ' }],
      [
        'a username with punctuation',
        { username: 'al ice!', password: 'longenough123' },
      ],
    ])('refuses %s', async (_label, body) => {
      const calls = mockDbal()

      const res = await POST(req(body))

      expect(res.status).toBe(400)
      expect(calls).toHaveLength(0)
    })

    it('accepts a username with underscore and hyphen', async () => {
      mockDbal()

      const res = await POST(
        req({ username: 'svc_build-1', password: 'longenough123' })
      )

      expect(res.status).toBe(200)
    })

    it('refuses an over-long password rather than truncating it', async () => {
      const calls = mockDbal()

      const res = await POST(
        req({ username: 'alice', password: 'a'.repeat(129) })
      )

      expect(res.status).toBe(400)
      expect(calls).toHaveLength(0)
    })
  })

  describe('forwarding to DBAL', () => {
    it('attaches the admin token server-side', async () => {
      const calls = mockDbal()

      await POST(req(valid))

      expect(calls[0].auth).toBe(`Bearer ${TOKEN}`)
      expect(calls[0].url).toContain('/admin/credentials')
    })

    it('sends the plaintext for DBAL to hash with Argon2id', async () => {
      // Hashing here would produce a digest verify_password cannot check.
      const calls = mockDbal()

      await POST(req(valid))

      const body = JSON.parse(calls[0].body ?? '{}')
      expect(body.password).toBe('longenough123')
      expect(body.passwordHash).toBeUndefined()
      expect(body.salt).toBeUndefined()
    })

    it('reports a refusal without leaking the DBAL detail', async () => {
      const res = await (async () => {
        mockDbal(false)
        return POST(req(valid))
      })()

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('DBAL refused the credential write.')
      expect(JSON.stringify(body)).not.toContain(TOKEN)
    })

    it('reports unavailability when the request throws', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('ECONNREFUSED')
        })
      )

      const res = await POST(req(valid))

      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe('Credential service unavailable.')
    })
  })

  describe('when the deployment has no admin token', () => {
    it('refuses rather than sending an empty Bearer', async () => {
      // An empty token would be rejected by DBAL anyway, but saying so
      // plainly beats a confusing 401 from another service.
      vi.stubEnv('DBAL_ADMIN_TOKEN', '')
      const calls = mockDbal()

      const res = await POST(req(valid))

      expect(res.status).toBe(500)
      expect((await res.json()).error).toContain('not configured')
      expect(calls).toHaveLength(0)
    })
  })
})
