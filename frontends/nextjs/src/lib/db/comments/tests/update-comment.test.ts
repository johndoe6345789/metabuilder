import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { updateComment } from './update-comment'

describe('updateComment', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it.each([
    { commentId: 'c1', updates: { content: 'Updated' } },
    { commentId: 'c2', updates: { content: 'New text', updatedAt: 2000 } },
  ])('should update $commentId', async ({ commentId, updates }) => {
    mockUpdate.mockResolvedValue(undefined)

    await updateComment(commentId, updates as any)

    expect(mockUpdate).toHaveBeenCalledWith('Comment', commentId, expect.any(Object))
  })
})
