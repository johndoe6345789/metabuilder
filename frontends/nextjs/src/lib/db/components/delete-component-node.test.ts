import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deleteComponentNode } from './delete-component-node'

describe('deleteComponentNode', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it('should delete node', async () => {
    mockDelete.mockResolvedValue(undefined)

    await deleteComponentNode('n1')

    expect(mockDelete).toHaveBeenCalledWith('ComponentNode', 'n1')
  })
})
