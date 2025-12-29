import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deleteComponentConfig } from './delete-component-config'

describe('deleteComponentConfig', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it('should delete config', async () => {
    mockDelete.mockResolvedValue(undefined)

    await deleteComponentConfig('cfg1')

    expect(mockDelete).toHaveBeenCalledWith('ComponentConfig', 'cfg1')
  })
})
