import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  assignableRoles,
  mayChangeRole,
  updateUserRole,
  userLevel,
} from './users-roles'

/**
 * The tab was headed "User Management" over a role hierarchy it printed
 * and nowhere offered to change: neither it nor the admin panel could
 * promote a member to moderator. A founder is their community's god, so
 * they may hand out any role below their own -- and not touch their own
 * account, or a peer's, from a list.
 */
describe('assignableRoles', () => {
  it('lets a god hand out every role below god', () => {
    expect(assignableRoles('god')).toEqual(['user', 'moderator', 'admin'])
  })

  it('lets the instance owner hand out god, but not supergod', () => {
    expect(assignableRoles('supergod')).toEqual([
      'user',
      'moderator',
      'admin',
      'god',
    ])
  })

  it('gives an admin only the roles below admin', () => {
    expect(assignableRoles('admin')).toEqual(['user', 'moderator'])
  })

  it('gives a plain user, an unknown role and no role nothing', () => {
    expect(assignableRoles('user')).toEqual([])
    expect(assignableRoles('wizard')).toEqual([])
    expect(assignableRoles(undefined)).toEqual([])
  })
})

describe('mayChangeRole', () => {
  const god = { id: 'me', role: 'god' }

  it('allows an account below the caller', () => {
    expect(mayChangeRole(god, { id: 'u1', role: 'user' })).toBe(true)
    expect(mayChangeRole(god, { id: 'u1', role: 'admin' })).toBe(true)
  })

  it('refuses the caller their own account', () => {
    expect(mayChangeRole(god, { id: 'me', role: 'user' })).toBe(false)
  })

  it('refuses a peer or anyone above', () => {
    expect(mayChangeRole(god, { id: 'u1', role: 'god' })).toBe(false)
    expect(mayChangeRole(god, { id: 'u1', role: 'supergod' })).toBe(false)
  })

  it('refuses a row it could not address', () => {
    expect(mayChangeRole(god, { role: 'user' })).toBe(false)
  })

  it('treats an unset role as user', () => {
    expect(mayChangeRole(god, { id: 'u1' })).toBe(true)
    expect(userLevel({})).toBe(1)
  })
})

describe('updateUserRole', () => {
  afterEach(() => vi.unstubAllGlobals())

  it("writes the role to the tenant's own User row, as the caller", async () => {
    const calls: [string, RequestInit][] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        calls.push([url, init])
        return { ok: true }
      })
    )

    await updateUserRole('kestrelbindery', 'u1', 'moderator')

    const [url, init] = calls[0]
    expect(url).toContain('/kestrelbindery/core/User/u1')
    expect(url).not.toContain('/system/')
    expect(init.method).toBe('PUT')
    expect(init.credentials).toBe('include')
    expect(JSON.parse(String(init.body))).toEqual({ role: 'moderator' })
  })

  it('throws with the status when the write is refused', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 403 })))
    await expect(updateUserRole('t', 'u1', 'admin')).rejects.toThrow(
      'HTTP 403'
    )
  })
})
