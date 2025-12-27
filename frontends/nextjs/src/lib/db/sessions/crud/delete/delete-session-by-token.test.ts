import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deleteSessionByToken } from './delete-session-by-token'

describe('deleteSessionByToken', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockDelete.mockReset()
  })

  it('returns false when no session exists', async () => {
    mockList.mockResolvedValue({ data: [] })

    const result = await deleteSessionByToken('missing')

    expect(mockList).toHaveBeenCalledWith('Session', { filter: { token: 'missing' } })
    expect(result).toBe(false)
  })

  it('deletes session when token exists', async () => {
    mockList.mockResolvedValue({ data: [{ id: 'session_1' }] })
    mockDelete.mockResolvedValue(true)

    const result = await deleteSessionByToken('token')

    expect(mockDelete).toHaveBeenCalledWith('Session', 'session_1')
    expect(result).toBe(true)
  })
})
