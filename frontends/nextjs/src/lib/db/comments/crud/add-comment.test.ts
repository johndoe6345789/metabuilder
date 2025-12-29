import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { addComment } from './add-comment'

describe('addComment', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it.each([
    {
      name: 'basic comment',
      comment: { id: 'c1', userId: 'u1', content: 'Hello', createdAt: 1000 },
    },
    {
      name: 'reply comment',
      comment: { id: 'c2', userId: 'u1', content: 'Reply', createdAt: 2000, parentId: 'c1' },
    },
  ])('should add $name', async ({ comment }) => {
    mockCreate.mockResolvedValue(undefined)

    await addComment(comment as any)

    expect(mockCreate).toHaveBeenCalledWith(
      'Comment',
      expect.objectContaining({
        id: comment.id,
        userId: comment.userId,
        content: comment.content,
      })
    )
  })
})
