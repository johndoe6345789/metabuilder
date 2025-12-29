import { beforeEach,describe, expect, it, vi } from 'vitest'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete, create: mockCreate }

vi.mock('../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setAppConfig } from './set-app-config'

describe('setAppConfig', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockDelete.mockReset()
    mockCreate.mockReset()
  })

  it('should replace config', async () => {
    mockList.mockResolvedValue({ data: [{ id: 'old' }] })
    mockDelete.mockResolvedValue(undefined)
    mockCreate.mockResolvedValue(undefined)

    await setAppConfig({
      id: 'app1',
      name: 'New App',
      schemas: [],
      workflows: [],
      luaScripts: [],
      pages: [],
      theme: { colors: {}, fonts: {} },
    })

    expect(mockDelete).toHaveBeenCalled()
    expect(mockCreate).toHaveBeenCalledWith(
      'AppConfiguration',
      expect.objectContaining({ id: 'app1' })
    )
  })
})
