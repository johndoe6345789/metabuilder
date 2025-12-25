import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRead = vi.fn()
const mockAdapter = { read: mockRead }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getUserById } from './get-user-by-id'

describe('getUserById', () => {
  beforeEach(() => {
    mockRead.mockReset()
  })

  it.each([
    {
      name: 'null when user missing',
      userId: 'missing_user',
      dbData: null,
      expected: null,
    },
    {
      name: 'user with optional fields missing',
      userId: 'user_1',
      dbData: {
        id: 'user_1',
        username: 'test',
        email: 'test@example.com',
        role: 'user',
        profilePicture: null,
        bio: null,
        createdAt: BigInt(1000),
        tenantId: null,
        isInstanceOwner: false,
      },
      expected: {
        id: 'user_1',
        username: 'test',
        email: 'test@example.com',
        role: 'user',
        profilePicture: undefined,
        bio: undefined,
        createdAt: 1000,
        tenantId: undefined,
        isInstanceOwner: false,
      },
    },
    {
      name: 'user with all fields',
      userId: 'user_2',
      dbData: {
        id: 'user_2',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        profilePicture: 'pic.jpg',
        bio: 'Admin bio',
        createdAt: BigInt(2000),
        tenantId: 'tenant_1',
        isInstanceOwner: true,
      },
      expected: {
        id: 'user_2',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        profilePicture: 'pic.jpg',
        bio: 'Admin bio',
        createdAt: 2000,
        tenantId: 'tenant_1',
        isInstanceOwner: true,
      },
    },
  ])('should return $name', async ({ userId, dbData, expected }) => {
    mockRead.mockResolvedValue(dbData)

    const result = await getUserById(userId)

    expect(mockRead).toHaveBeenCalledWith('User', userId)
    expect(result).toEqual(expected)
  })
})
