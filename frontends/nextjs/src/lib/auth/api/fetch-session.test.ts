import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchSession } from './fetch-session'

const record = {
  id: 'u1',
  username: 'alice',
  email: 'alice@example.com',
  role: 'user',
  createdAt: 1700000000000,
}

interface Call {
  url: string
  auth?: string
}

const calls: Call[] = []
/** Rows the User lookup answers with, and whether it is allowed at all. */
const lookup = { rows: [record] as unknown[], ok: true }

/**
 * Stubs /oidc/userinfo and the User lookup that follows it. Both are plain
 * fetches now: the profile read carries the caller's own token, because
 * DBAL enforces User's declared read ACL and the shared db client attaches
 * nothing.
 */
const stubUserinfo = (ok: boolean, claims: unknown = { sub: 'alice' }) => {
  calls.length = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const auth = (init?.headers as Record<string, string> | undefined)
        ?.Authorization
      calls.push({ url: String(url), auth })
      if (String(url).includes('/oidc/userinfo')) {
        return { ok, json: async () => claims } as unknown as Response
      }
      return {
        ok: lookup.ok,
        status: lookup.ok ? 200 : 401,
        json: async () => ({ data: { data: lookup.rows } }),
      } as unknown as Response
    })
  )
  return calls
}

/** The User lookup, or undefined when it never happened. */
const userCall = () => calls.find(c => c.url.includes('/core/User'))

beforeEach(() => {
  lookup.rows = [record]
  lookup.ok = true
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('fetchSession', () => {
  it('is null for a null token without calling out', async () => {
    const seen = stubUserinfo(true)
    expect(await fetchSession(null)).toBeNull()
    expect(seen).toHaveLength(0)
  })

  it('is null for an empty token without calling out', async () => {
    const seen = stubUserinfo(true)
    expect(await fetchSession('')).toBeNull()
    expect(seen).toHaveLength(0)
  })

  it('sends the token as a bearer to /oidc/userinfo', async () => {
    const seen = stubUserinfo(true)
    await fetchSession('tok')
    expect(seen[0]?.url).toContain('/oidc/userinfo')
    expect(seen[0]?.auth).toBe('Bearer tok')
  })

  // A token the data layer will not vouch for resolves to nobody, so a
  // caller cannot turn a rejected token into a session.
  it('is null when userinfo rejects the token', async () => {
    stubUserinfo(false)
    expect(await fetchSession('bad')).toBeNull()
    expect(userCall()).toBeUndefined()
  })

  it('is null when userinfo returns no subject', async () => {
    stubUserinfo(true, {})
    expect(await fetchSession('tok')).toBeNull()
  })

  it('is null when the subject is an empty string', async () => {
    stubUserinfo(true, { sub: '' })
    expect(await fetchSession('tok')).toBeNull()
  })

  it('looks the user up by the subject userinfo returned', async () => {
    stubUserinfo(true, { sub: 'alice', tenant_id: 'acme' })
    await fetchSession('tok')
    expect(userCall()?.url).toContain('filter.username=alice')
  })

  /**
   * The regression this pins: DBAL began enforcing the read ACL User's
   * schema has always declared, and this lookup went through a client that
   * attaches nothing. Sign-in then failed *after* the OIDC callback had
   * already succeeded, so a freshly minted, perfectly valid token was
   * reported to the person as "Session token rejected".
   */
  it("reads the profile with the caller's own token", async () => {
    stubUserinfo(true, { sub: 'alice', tenant_id: 'acme' })
    await fetchSession('tok')
    expect(userCall()?.auth).toBe('Bearer tok')
  })

  it('is null when the profile read is refused', async () => {
    stubUserinfo(true, { sub: 'alice', tenant_id: 'acme' })
    lookup.ok = false
    expect(await fetchSession('tok')).toBeNull()
  })

  // The whole point: a signup that founded its own community carries that
  // tenant in the signed access token, and the profile it created lives
  // under that tenant's DBAL route, not the fixed 'system' one.
  it('queries the tenant carried in the userinfo response', async () => {
    stubUserinfo(true, { sub: 'alice', tenant_id: 'acme' })
    await fetchSession('tok')
    expect(userCall()?.url).toContain('/acme/core/User')
  })

  it('falls back to the system tenant when userinfo carries none', async () => {
    stubUserinfo(true, { sub: 'alice' })
    await fetchSession('tok')
    expect(userCall()?.url).toContain('/system/core/User')
  })

  it('falls back to the system tenant for an empty tenant_id', async () => {
    stubUserinfo(true, { sub: 'alice', tenant_id: '' })
    await fetchSession('tok')
    expect(userCall()?.url).toContain('/system/core/User')
  })

  it('is null when the subject matches no user row', async () => {
    stubUserinfo(true)
    lookup.rows = []
    expect(await fetchSession('tok')).toBeNull()
  })

  it('maps the row onto a User', async () => {
    stubUserinfo(true)
    expect(await fetchSession('tok')).toEqual({
      id: 'u1',
      username: 'alice',
      email: 'alice@example.com',
      role: 'user',
      isInstanceOwner: false,
      profilePicture: null,
      bio: null,
      createdAt: 1700000000000,
      tenantId: null,
    })
  })

  it('preserves the fields the row does supply', async () => {
    stubUserinfo(true)
    lookup.rows = [
      {
        ...record,
        isInstanceOwner: true,
        tenantId: 'acme',
        bio: 'hello',
        profilePicture: '/a.png',
      },
    ]
    expect(await fetchSession('tok')).toMatchObject({
      isInstanceOwner: true,
      tenantId: 'acme',
      bio: 'hello',
      profilePicture: '/a.png',
    })
  })

  it('coerces a bigint createdAt to a number', async () => {
    stubUserinfo(true)
    lookup.rows = [{ ...record, createdAt: 1700000000000n }]
    expect((await fetchSession('tok'))?.createdAt).toBe(1700000000000)
  })

  it('is null rather than throwing when the lookup fails', async () => {
    stubUserinfo(true)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).includes('/oidc/userinfo')) {
          return {
            ok: true,
            json: async () => ({ sub: 'alice' }),
          } as unknown as Response
        }
        throw new Error('dbal down')
      })
    )
    expect(await fetchSession('tok')).toBeNull()
  })

  it('is null rather than throwing when userinfo is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED')
      })
    )
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await fetchSession('tok')).toBeNull()
  })
})
