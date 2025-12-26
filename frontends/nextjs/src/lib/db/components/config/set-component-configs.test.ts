import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete, create: mockCreate }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setComponentConfigs } from './set-component-configs'

describe('setComponentConfigs', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockDelete.mockReset()
    mockCreate.mockReset()
  })

  it('should replace configs', async () => {
    mockList.mockResolvedValue({ data: [{ id: 'old' }] })
    mockDelete.mockResolvedValue(undefined)
    mockCreate.mockResolvedValue(undefined)

    await setComponentConfigs({ cfg1: { id: 'cfg1', componentId: 'c1', props: {}, styles: {}, events: {} } })

    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
