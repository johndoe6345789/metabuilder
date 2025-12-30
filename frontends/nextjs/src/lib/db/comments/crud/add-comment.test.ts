import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Comment } from '../../types/level-types'

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

  const cases: Array<{ name: string; comment: Comment }> = [
    {
      name: 'basic comment',
      comment: { id: 'c1', userId: 'u1', content: 'Hello', createdAt: 1000 },
    },
    {
      name: 'reply comment',
      comment: { id: 'c2', userId: 'u1', content: 'Reply', createdAt: 2000, parentId: 'c1' },
    },
  ]

  it.each(cases)('should add $name', async ({ comment }) => {
    mockCreate.mockResolvedValue(undefined)

    await addComment(comment)

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
