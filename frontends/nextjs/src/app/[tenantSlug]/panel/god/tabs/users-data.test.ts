import { afterEach, describe, expect, it, vi } from 'vitest'

import { countByRole, fetchUsers, filterUsers, type UserRow } from './users-data'

const user = (over: Partial<UserRow> = {}): UserRow => ({
  id: 'u1',
  username: 'alice',
  email: 'alice@example.com',
  role: 'user',
  tenantId: 'acme',
  ...over,
})

describe('fetchUsers', () => {
  afterEach(() => vi.unstubAllGlobals())

  // The real DBAL envelope carries no `success` key -- this is the exact
  // shape a bespoke unwrapper missed before, which left the table always
  // empty against a real server.
  it('reads users out of the real DBAL envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ data: { data: [user()] } }),
      }))
    )
    expect(await fetchUsers('acme')).toEqual([user()])
  })

  it('throws with the status when the request is refused', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 403 }))
    )
    await expect(fetchUsers('acme')).rejects.toThrow('HTTP 403')
  })

  it('propagates a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED')
    }))
    await expect(fetchUsers('acme')).rejects.toThrow('ECONNREFUSED')
  })
})

describe('filterUsers', () => {
  const users = [
    user(),
    user({ id: 'u2', username: 'bob', email: 'bob@other.com', role: 'admin' }),
  ]

  it('returns everyone for an empty query', () => {
    expect(filterUsers(users, '')).toEqual(users)
    expect(filterUsers(users, '   ')).toEqual(users)
  })

  it('matches on username', () => {
    expect(filterUsers(users, 'ali')).toEqual([users[0]])
  })

  it('matches on email', () => {
    expect(filterUsers(users, 'other.com')).toEqual([users[1]])
  })

  it('matches on role', () => {
    expect(filterUsers(users, 'admin')).toEqual([users[1]])
  })

  it('matches on tenant', () => {
    expect(filterUsers(users, 'acme')).toHaveLength(2)
  })

  it('is case-insensitive', () => {
    expect(filterUsers(users, 'ALICE')).toEqual([users[0]])
  })

  it('is empty for a needle nobody matches', () => {
    expect(filterUsers(users, 'nobody')).toEqual([])
  })

  it('does not throw on a user missing every searchable field', () => {
    expect(filterUsers([{}], 'anything')).toEqual([])
  })
})

describe('countByRole', () => {
  it('counts each role', () => {
    expect(
      countByRole([user({ role: 'admin' }), user({ role: 'admin' }), user()])
    ).toEqual({ admin: 2, user: 1 })
  })

  it('defaults an unset role to user', () => {
    expect(countByRole([user({ role: undefined })])).toEqual({ user: 1 })
  })

  it('is empty for no users', () => {
    expect(countByRole([])).toEqual({})
  })
})

/**
 * The tenant was hardcoded to `system`, so a founder signed in to their own
 * community saw the instance's accounts -- god, supergod, admin, the demo
 * users -- and never their own members. Caught by opening the tab as a
 * brand-new tenant and finding six strangers in it.
 */
describe('which tenant the users come from', () => {
  afterEach(() => vi.unstubAllGlobals())

  it("asks for the signed-in tenant's users, not the instance's", async () => {
    const asked: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        asked.push(url)
        return { ok: true, json: async () => ({ data: { data: [] } }) }
      })
    )

    await fetchUsers('kestrelbindery')

    expect(asked[0]).toContain('/kestrelbindery/core/User')
    expect(asked[0]).not.toContain('/system/')
  })
})
