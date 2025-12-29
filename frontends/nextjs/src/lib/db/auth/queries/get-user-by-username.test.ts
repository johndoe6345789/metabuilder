import { beforeEach,describe, expect, it, vi } from 'vitest'

const mockFindFirst = vi.fn()
const mockAdapter = { findFirst: mockFindFirst }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getUserByUsername } from './get-user-by-username'

describe('getUserByUsername', () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
  })

  it('returns null when user not found', async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await getUserByUsername('missing')

    expect(mockFindFirst).toHaveBeenCalledWith('User', { where: { username: 'missing' } })
    expect(result).toBeNull()
  })

  it('returns user when found', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'user_1',
      username: 'alice',
      email: 'alice@example.com',
      role: 'admin',
      profilePicture: null,
      bio: 'Bio',
      createdAt: BigInt(1000),
      tenantId: null,
      isInstanceOwner: false,
    })

    const result = await getUserByUsername('alice')

    expect(result).toEqual({
      id: 'user_1',
      username: 'alice',
      email: 'alice@example.com',
      role: 'admin',
      profilePicture: undefined,
      bio: 'Bio',
      createdAt: 1000,
      tenantId: undefined,
      isInstanceOwner: false,
    })
  })

  it('includes tenant filter when provided', async () => {
    mockFindFirst.mockResolvedValue(null)

    await getUserByUsername('alice', { tenantId: 'tenant_1' })

    expect(mockFindFirst).toHaveBeenCalledWith('User', {
      where: { username: 'alice', tenantId: 'tenant_1' },
    })
  })
})
