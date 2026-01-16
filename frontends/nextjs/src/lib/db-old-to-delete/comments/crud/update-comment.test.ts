import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Comment } from '@/lib/types/level-types'

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

  const cases: Array<{ commentId: string; updates: Partial<Comment> }> = [
    { commentId: 'c1', updates: { content: 'Updated' } },
    { commentId: 'c2', updates: { content: 'New text', updatedAt: 2000 } },
  ]

  it.each(cases)('should update $commentId', async ({ commentId, updates }) => {
    mockUpdate.mockResolvedValue(undefined)

    await updateComment(commentId, updates)

    expect(mockUpdate).toHaveBeenCalledWith('Comment', commentId, expect.any(Object))
  })
})
