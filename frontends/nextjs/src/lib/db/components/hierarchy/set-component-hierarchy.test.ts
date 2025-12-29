import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete, create: mockCreate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setComponentHierarchy } from './set-component-hierarchy'

describe('setComponentHierarchy', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockDelete.mockReset()
    mockCreate.mockReset()
  })

  it('should replace hierarchy', async () => {
    mockList.mockResolvedValue({ data: [{ id: 'old' }] })
    mockDelete.mockResolvedValue(undefined)
    mockCreate.mockResolvedValue(undefined)

    await setComponentHierarchy({
      node1: { id: 'node1', type: 'Container', childIds: [], order: 0, pageId: 'p1' },
    })

    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
