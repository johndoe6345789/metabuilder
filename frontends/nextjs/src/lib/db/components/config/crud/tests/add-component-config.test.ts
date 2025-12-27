import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { addComponentConfig } from './add-component-config'

describe('addComponentConfig', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it('should add config', async () => {
    mockCreate.mockResolvedValue(undefined)

    await addComponentConfig({ id: 'cfg1', componentId: 'c1', props: {}, styles: {}, events: {} })

    expect(mockCreate).toHaveBeenCalledWith('ComponentConfig', expect.objectContaining({ id: 'cfg1' }))
  })
})
