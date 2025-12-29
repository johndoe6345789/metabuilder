import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deleteComment } from './delete-comment'

describe('deleteComment', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it.each([{ commentId: 'c1' }, { commentId: 'c2' }])(
    'should delete $commentId',
    async ({ commentId }) => {
      mockDelete.mockResolvedValue(undefined)

      await deleteComment(commentId)

      expect(mockDelete).toHaveBeenCalledWith('Comment', commentId)
    }
  )
})
