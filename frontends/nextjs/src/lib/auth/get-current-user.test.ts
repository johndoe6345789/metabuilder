import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchSession = vi.hoisted(() => ({ fetchSession: vi.fn() }))
vi.mock('@/lib/auth/api/fetch-session', () => fetchSession)

import { getCurrentUser } from './get-current-user'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCurrentUser', () => {
  it('returns null when there is no token', async () => {
    fetchSession.fetchSession.mockResolvedValue(null)
    expect(await getCurrentUser(null)).toBeNull()
  })

  it('returns null when the session has no user record', async () => {
    fetchSession.fetchSession.mockResolvedValue(null)
    expect(await getCurrentUser('tok')).toBeNull()
  })

  it.each(['id', 'username', 'email', 'role'])(
    'returns null when the user record is missing %s',
    async field => {
      const user: Record<string, unknown> = {
        id: 'u1',
        username: 'alex',
        email: 'a@x',
        role: 'admin',
      }
      delete user[field]
      fetchSession.fetchSession.mockResolvedValue(user)
      expect(await getCurrentUser('tok')).toBeNull()
    }
  )

  it('maps a full record and computes the role level', async () => {
    fetchSession.fetchSession.mockResolvedValue({
      id: 'u1',
      username: 'alex',
      email: 'a@x',
      role: 'admin',
      isInstanceOwner: true,
      profilePicture: 'pic.png',
      bio: 'hi',
      createdAt: '1700000000',
      tenantId: 'acme',
    })

    const result = await getCurrentUser('tok')

    expect(result).toEqual({
      id: 'u1',
      username: 'alex',
      email: 'a@x',
      role: 'admin',
      isInstanceOwner: true,
      profilePicture: 'pic.png',
      bio: 'hi',
      createdAt: 1700000000,
      tenantId: 'acme',
      level: expect.any(Number),
    })
  })

  it('defaults optional fields for a minimal record', async () => {
    fetchSession.fetchSession.mockResolvedValue({
      id: 'u1',
      username: 'alex',
      email: 'a@x',
      role: 'user',
      createdAt: 1,
    })

    const result = await getCurrentUser('tok')

    expect(result?.isInstanceOwner).toBe(false)
    expect(result?.profilePicture).toBeNull()
    expect(result?.bio).toBeNull()
    expect(result?.tenantId).toBeNull()
  })

  it('returns null and logs when fetchSession throws', async () => {
    fetchSession.fetchSession.mockRejectedValue(new Error('offline'))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(await getCurrentUser('tok')).toBeNull()
    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })
})
