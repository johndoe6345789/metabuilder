import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete, create: mockCreate }

vi.mock('../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setUsers } from './set-users'

describe('setUsers', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockDelete.mockReset()
    mockCreate.mockReset()
  })

  it.each([
    {
      name: 'empty users replacing empty',
      existingUsers: [],
      newUsers: [],
      expectedDeletes: 0,
      expectedCreates: 0,
    },
    {
      name: 'new users replacing empty',
      existingUsers: [],
      newUsers: [
        {
          id: 'u1',
          username: 'user1',
          email: 'u1@test.com',
          role: 'user' as const,
          createdAt: 1000,
        },
      ],
      expectedDeletes: 0,
      expectedCreates: 1,
    },
    {
      name: 'empty users replacing existing',
      existingUsers: [{ id: 'old1' }, { id: 'old2' }],
      newUsers: [],
      expectedDeletes: 2,
      expectedCreates: 0,
    },
    {
      name: 'new users replacing existing',
      existingUsers: [{ id: 'old1' }],
      newUsers: [
        {
          id: 'new1',
          username: 'newuser',
          email: 'new@test.com',
          role: 'admin' as const,
          createdAt: 2000,
        },
      ],
      expectedDeletes: 1,
      expectedCreates: 1,
    },
  ])(
    'should handle $name',
    async ({ existingUsers, newUsers, expectedDeletes, expectedCreates }) => {
      mockList.mockResolvedValue({ data: existingUsers })
      mockDelete.mockResolvedValue(undefined)
      mockCreate.mockResolvedValue(undefined)

      await setUsers(newUsers)

      expect(mockList).toHaveBeenCalledWith('User')
      expect(mockDelete).toHaveBeenCalledTimes(expectedDeletes)
      expect(mockCreate).toHaveBeenCalledTimes(expectedCreates)
    }
  )
})
