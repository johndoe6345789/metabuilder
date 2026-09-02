import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const client = vi.hoisted(() => ({
  db: { entity: vi.fn(() => ({ list: vi.fn() })) },
}))
vi.mock('@/lib/db-client', () => client)

import { fetchSession } from './fetch-session'

const record = {
  id: 'u1',
  username: 'alice',
  email: 'alice@example.com',
  role: 'user',
  createdAt: 1700000000000,
}

const listMock = () => client.db.entity('User').list as ReturnType<typeof vi.fn>

/** Stubs /oidc/userinfo, then the User lookup that follows it. */
const stubUserinfo = (ok: boolean, claims: unknown = { sub: 'alice' }) => {
  const calls: { url: string; auth?: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        auth: (init?.headers as Record<string, string>)?.Authorization,
      })
      return { ok, json: async () => claims } as Response
    })
  )
  return calls
}

beforeEach(() => {
  client.db.entity.mockReturnValue({
    list: vi.fn().mockResolvedValue({ data: [record] }),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('fetchSession', () => {
  it('is null for a null token without calling out', async () => {
    const calls = stubUserinfo(true)
    expect(await fetchSession(null)).toBeNull()
    expect(calls).toHaveLength(0)
  })

  it('is null for an empty token without calling out', async () => {
    const calls = stubUserinfo(true)
    expect(await fetchSession('')).toBeNull()
    expect(calls).toHaveLength(0)
  })

  it('sends the token as a bearer to /oidc/userinfo', async () => {
    const calls = stubUserinfo(true)
    await fetchSession('tok')
    expect(calls[0]?.url).toContain('/oidc/userinfo')
    expect(calls[0]?.auth).toBe('Bearer tok')
  })

  // A token the data layer will not vouch for resolves to nobody, so a
  // caller cannot turn a rejected token into a session.
  it('is null when userinfo rejects the token', async () => {
    stubUserinfo(false)
    expect(await fetchSession('bad')).toBeNull()
    expect(client.db.entity).not.toHaveBeenCalled()
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
    expect(listMock()).toHaveBeenCalledWith({
      filter: { username: 'alice' },
    })
  })

  // The whole point: a signup that founded its own community carries that
  // tenant in the signed access token, and the profile it created lives
  // under that tenant's DBAL route, not the fixed 'system' one.
  it('queries the tenant carried in the userinfo response', async () => {
    stubUserinfo(true, { sub: 'alice', tenant_id: 'acme' })
    await fetchSession('tok')
    expect(client.db.entity).toHaveBeenCalledWith('User', 'acme')
  })

  it('falls back to the system tenant when userinfo carries none', async () => {
    stubUserinfo(true, { sub: 'alice' })
    await fetchSession('tok')
    expect(client.db.entity).toHaveBeenCalledWith('User', 'system')
  })

  it('falls back to the system tenant for an empty tenant_id', async () => {
    stubUserinfo(true, { sub: 'alice', tenant_id: '' })
    await fetchSession('tok')
    expect(client.db.entity).toHaveBeenCalledWith('User', 'system')
  })

  it('is null when the subject matches no user row', async () => {
    stubUserinfo(true)
    client.db.entity.mockReturnValue({
      list: vi.fn().mockResolvedValue({ data: [] }),
    })
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
    client.db.entity.mockReturnValue({
      list: vi.fn().mockResolvedValue({
        data: [
          {
            ...record,
            isInstanceOwner: true,
            tenantId: 'acme',
            bio: 'hello',
            profilePicture: '/a.png',
          },
        ],
      }),
    })
    expect(await fetchSession('tok')).toMatchObject({
      isInstanceOwner: true,
      tenantId: 'acme',
      bio: 'hello',
      profilePicture: '/a.png',
    })
  })

  it('coerces a bigint createdAt to a number', async () => {
    stubUserinfo(true)
    const bigintRow = { ...record, createdAt: 1700000000000n }
    client.db.entity.mockReturnValue({
      list: vi.fn().mockResolvedValue({ data: [bigintRow] }),
    })
    expect((await fetchSession('tok'))?.createdAt).toBe(1700000000000)
  })

  it('is null rather than throwing when the lookup fails', async () => {
    stubUserinfo(true)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    client.db.entity.mockReturnValue({
      list: vi.fn().mockRejectedValue(new Error('dbal down')),
    })
    expect(await fetchSession('tok')).toBeNull()
  })

  it('is null rather than throwing when userinfo is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED')
    }))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await fetchSession('tok')).toBeNull()
  })
})
