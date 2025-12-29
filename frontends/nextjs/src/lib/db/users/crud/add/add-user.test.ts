import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { addUser } from './add-user'

describe('addUser', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it.each([
    {
      name: 'basic user',
      user: {
        id: 'user_1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user' as const,
        createdAt: 1000000,
      },
      expectedData: {
        id: 'user_1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        profilePicture: undefined,
        bio: undefined,
        createdAt: BigInt(1000000),
        tenantId: undefined,
        isInstanceOwner: false,
      },
    },
    {
      name: 'user with all fields',
      user: {
        id: 'user_2',
        username: 'fulluser',
        email: 'full@example.com',
        role: 'admin' as const,
        profilePicture: 'https://example.com/pic.jpg',
        bio: 'Test bio',
        createdAt: 2000000,
        tenantId: 'tenant_1',
        isInstanceOwner: true,
      },
      expectedData: {
        id: 'user_2',
        username: 'fulluser',
        email: 'full@example.com',
        role: 'admin',
        profilePicture: 'https://example.com/pic.jpg',
        bio: 'Test bio',
        createdAt: BigInt(2000000),
        tenantId: 'tenant_1',
        isInstanceOwner: true,
      },
    },
  ])('should add $name', async ({ user, expectedData }) => {
    mockCreate.mockResolvedValue(undefined)

    await addUser(user)

    expect(mockCreate).toHaveBeenCalledWith('User', expectedData)
  })

  it('should propagate adapter errors', async () => {
    mockCreate.mockRejectedValue(new Error('DB error'))

    await expect(
      addUser({
        id: 'user_1',
        username: 'test',
        email: 'test@example.com',
        role: 'user',
        createdAt: 1000,
      })
    ).rejects.toThrow('DB error')
  })
})
