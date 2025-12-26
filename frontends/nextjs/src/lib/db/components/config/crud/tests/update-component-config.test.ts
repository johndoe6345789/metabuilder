import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { updateComponentConfig } from './update-component-config'

describe('updateComponentConfig', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it('should update config', async () => {
    mockUpdate.mockResolvedValue(undefined)

    await updateComponentConfig('cfg1', { props: { color: 'red' } })

    expect(mockUpdate).toHaveBeenCalledWith('ComponentConfig', 'cfg1', expect.any(Object))
  })
})
