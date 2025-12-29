import { beforeEach,describe, expect, it, vi } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { addComponentNode } from './add-component-node'

describe('addComponentNode', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it('should add node', async () => {
    mockCreate.mockResolvedValue(undefined)

    await addComponentNode({ id: 'n1', type: 'Container', childIds: [], order: 0, pageId: 'p1' })

    expect(mockCreate).toHaveBeenCalledWith('ComponentNode', expect.objectContaining({ id: 'n1' }))
  })
})
