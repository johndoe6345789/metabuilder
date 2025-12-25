import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getUsers } from './get-users'

describe('getUsers', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    {
      name: 'empty array when no users',
      dbData: [],
      expected: [],
      options: { scope: 'all' as const },
      expectedArgs: ['User'],
    },
    {
      name: 'single user',
      dbData: [
        {
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
      ],
      expected: [
        {
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
      ],
      options: { scope: 'all' as const },
      expectedArgs: ['User'],
    },
    {
      name: 'multiple users with all fields',
      dbData: [
        {
          id: 'user_1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          profilePicture: 'pic.jpg',
          bio: 'Admin bio',
          createdAt: BigInt(1000),
          tenantId: 'tenant_1',
          isInstanceOwner: false,
        },
        {
          id: 'user_2',
          username: 'supergod',
          email: 'sg@example.com',
          role: 'supergod',
          profilePicture: null,
          bio: null,
          createdAt: BigInt(2000),
          tenantId: null,
          isInstanceOwner: true,
        },
      ],
      expected: [
        {
          id: 'user_1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          profilePicture: 'pic.jpg',
          bio: 'Admin bio',
          createdAt: 1000,
          tenantId: 'tenant_1',
          isInstanceOwner: false,
        },
        {
          id: 'user_2',
          username: 'supergod',
          email: 'sg@example.com',
          role: 'supergod',
          profilePicture: undefined,
          bio: undefined,
          createdAt: 2000,
          tenantId: undefined,
          isInstanceOwner: true,
        },
      ],
      options: { scope: 'all' as const },
      expectedArgs: ['User'],
    },
    {
      name: 'filtered by tenant',
      dbData: [
        {
          id: 'user_1',
          username: 'tenant-user',
          email: 'tenant@example.com',
          role: 'admin',
          profilePicture: null,
          bio: null,
          createdAt: BigInt(3000),
          tenantId: 'tenant_2',
          isInstanceOwner: false,
        },
      ],
      expected: [
        {
          id: 'user_1',
          username: 'tenant-user',
          email: 'tenant@example.com',
          role: 'admin',
          profilePicture: undefined,
          bio: undefined,
          createdAt: 3000,
          tenantId: 'tenant_2',
          isInstanceOwner: false,
        },
      ],
      options: { tenantId: 'tenant_2' },
      expectedArgs: ['User', { filter: { tenantId: 'tenant_2' } }],
    },
  ])('should return $name', async ({ dbData, expected, options, expectedArgs }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getUsers(options)

    expect(mockList).toHaveBeenCalledWith(...expectedArgs)
    expect(result).toEqual(expected)
  })
})
