import { beforeEach,describe, expect, it, vi } from 'vitest'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { updateUser } from './update-user'

describe('updateUser', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it.each([
    {
      name: 'username only',
      userId: 'user_1',
      updates: { username: 'newname' },
      expectedData: {
        username: 'newname',
        email: undefined,
        role: undefined,
        profilePicture: undefined,
        bio: undefined,
        tenantId: undefined,
        isInstanceOwner: undefined,
      },
    },
    {
      name: 'multiple fields',
      userId: 'user_2',
      updates: { email: 'new@example.com', role: 'admin' as const, bio: 'New bio' },
      expectedData: {
        username: undefined,
        email: 'new@example.com',
        role: 'admin',
        profilePicture: undefined,
        bio: 'New bio',
        tenantId: undefined,
        isInstanceOwner: undefined,
      },
    },
    {
      name: 'all fields',
      userId: 'user_3',
      updates: {
        username: 'full',
        email: 'full@example.com',
        role: 'god' as const,
        profilePicture: 'pic.jpg',
        bio: 'Bio',
        tenantId: 'tenant_1',
        isInstanceOwner: true,
      },
      expectedData: {
        username: 'full',
        email: 'full@example.com',
        role: 'god',
        profilePicture: 'pic.jpg',
        bio: 'Bio',
        tenantId: 'tenant_1',
        isInstanceOwner: true,
      },
    },
  ])('should update $name', async ({ userId, updates, expectedData }) => {
    mockUpdate.mockResolvedValue(undefined)

    await updateUser(userId, updates)

    expect(mockUpdate).toHaveBeenCalledWith('User', userId, expectedData)
  })

  it('should propagate adapter errors', async () => {
    mockUpdate.mockRejectedValue(new Error('Update failed'))

    await expect(updateUser('user_1', { username: 'test' })).rejects.toThrow('Update failed')
  })
})
