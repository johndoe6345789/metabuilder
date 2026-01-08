import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { updateComponentNode } from './update-component-node'

describe('updateComponentNode', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it('should update node', async () => {
    mockUpdate.mockResolvedValue(undefined)

    await updateComponentNode('n1', { type: 'Button' })

    expect(mockUpdate).toHaveBeenCalledWith('ComponentNode', 'n1', expect.any(Object))
  })
})
