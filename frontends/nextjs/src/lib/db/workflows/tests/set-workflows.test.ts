import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete, create: mockCreate }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setWorkflows } from './set-workflows'

describe('setWorkflows', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockDelete.mockReset()
    mockCreate.mockReset()
  })

  it('should replace all workflows', async () => {
    mockList.mockResolvedValue({ data: [{ id: 'old' }] })
    mockDelete.mockResolvedValue(undefined)
    mockCreate.mockResolvedValue(undefined)

    await setWorkflows([{ id: 'new', name: 'New', nodes: [], edges: [], enabled: true }] as any)

    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
