import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRead = vi.fn()
const mockFindFirst = vi.fn()
const mockAdapter = { read: mockRead, findFirst: mockFindFirst }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getUserById } from './get-user-by-id'

describe('getUserById', () => {
  beforeEach(() => {
    mockRead.mockReset()
    mockFindFirst.mockReset()
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
    expect(mockFindFirst).not.toHaveBeenCalled()
    expect(result).toEqual(expected)
  })

  it.each([
    {
      name: 'use tenant filter when provided',
      userId: 'user_3',
      tenantId: 'tenant_2',
      dbData: {
        id: 'user_3',
        username: 'tenant-user',
        email: 'tenant@example.com',
        role: 'admin',
        profilePicture: null,
        bio: null,
        createdAt: BigInt(3000),
        tenantId: 'tenant_2',
        isInstanceOwner: false,
      },
      expected: {
        id: 'user_3',
        username: 'tenant-user',
        email: 'tenant@example.com',
        role: 'admin',
        profilePicture: undefined,
        bio: undefined,
        createdAt: 3000,
        tenantId: 'tenant_2',
        isInstanceOwner: false,
      },
    },
  ])('should $name', async ({ userId, tenantId, dbData, expected }) => {
    mockFindFirst.mockResolvedValue(dbData)

    const result = await getUserById(userId, { tenantId })

    expect(mockFindFirst).toHaveBeenCalledWith('User', { where: { id: userId, tenantId } })
    expect(mockRead).not.toHaveBeenCalled()
    expect(result).toEqual(expected)
  })
})
