import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deleteWorkflow } from './delete-workflow'

describe('deleteWorkflow', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it.each([{ id: 'w1' }, { id: 'w2' }])('should delete $id', async ({ id }) => {
    mockDelete.mockResolvedValue(undefined)

    await deleteWorkflow(id)

    expect(mockDelete).toHaveBeenCalledWith('Workflow', id)
  })
})
