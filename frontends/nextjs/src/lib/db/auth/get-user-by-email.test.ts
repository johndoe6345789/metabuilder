import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindFirst = vi.fn()
const mockAdapter = { findFirst: mockFindFirst }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getUserByEmail } from './get-user-by-email'

describe('getUserByEmail', () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
  })

  it('returns null when user not found', async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await getUserByEmail('missing@example.com')

    expect(mockFindFirst).toHaveBeenCalledWith('User', { where: { email: 'missing@example.com' } })
    expect(result).toBeNull()
  })

  it('returns user when found', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'user_2',
      username: 'bob',
      email: 'bob@example.com',
      role: 'user',
      profilePicture: 'pic.png',
      bio: null,
      createdAt: BigInt(2000),
      tenantId: 'tenant_2',
      isInstanceOwner: true,
    })

    const result = await getUserByEmail('bob@example.com')

    expect(result).toEqual({
      id: 'user_2',
      username: 'bob',
      email: 'bob@example.com',
      role: 'user',
      profilePicture: 'pic.png',
      bio: undefined,
      createdAt: 2000,
      tenantId: 'tenant_2',
      isInstanceOwner: true,
    })
  })

  it('includes tenant filter when provided', async () => {
    mockFindFirst.mockResolvedValue(null)

    await getUserByEmail('bob@example.com', { tenantId: 'tenant_2' })

    expect(mockFindFirst).toHaveBeenCalledWith('User', {
      where: { email: 'bob@example.com', tenantId: 'tenant_2' },
    })
  })
})
