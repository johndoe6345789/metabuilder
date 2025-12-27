import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deleteSession } from './delete-session'

describe('deleteSession', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it('deletes session by id', async () => {
    mockDelete.mockResolvedValue(true)

    const result = await deleteSession('session_1')

    expect(mockDelete).toHaveBeenCalledWith('Session', 'session_1')
    expect(result).toBe(true)
  })
})
