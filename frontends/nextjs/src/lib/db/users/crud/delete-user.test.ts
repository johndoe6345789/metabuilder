import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deleteUser } from './delete-user'

describe('deleteUser', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it.each([{ userId: 'user_1' }, { userId: 'user_abc123' }, { userId: 'some-uuid-format' }])(
    'should delete user with id $userId',
    async ({ userId }) => {
      mockDelete.mockResolvedValue(undefined)

      await deleteUser(userId)

      expect(mockDelete).toHaveBeenCalledWith('User', userId)
    }
  )

  it('should propagate adapter errors', async () => {
    mockDelete.mockRejectedValue(new Error('User not found'))

    await expect(deleteUser('nonexistent')).rejects.toThrow('User not found')
  })
})
