import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deleteSchema } from './delete-schema'

describe('deleteSchema', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it.each([{ name: 'User' }, { name: 'Post' }])('should delete $name', async ({ name }) => {
    mockDelete.mockResolvedValue(undefined)

    await deleteSchema(name)

    expect(mockDelete).toHaveBeenCalledWith('ModelSchema', name)
  })
})
