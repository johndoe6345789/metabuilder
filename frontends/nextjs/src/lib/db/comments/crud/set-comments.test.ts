import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Comment } from '@/lib/types/level-types'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete, create: mockCreate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setComments } from './set-comments'

describe('setComments', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockDelete.mockReset()
    mockCreate.mockReset()
  })

  it('should replace all comments', async () => {
    mockList.mockResolvedValue({ data: [{ id: 'old' }] })
    mockDelete.mockResolvedValue(undefined)
    mockCreate.mockResolvedValue(undefined)

    const testComment: Comment = { 
      id: 'new', 
      userId: 'u1', 
      entityType: 'test',
      entityId: 'test1',
      content: 'Hi', 
      createdAt: 1000 
    }
    await setComments([testComment])

    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
