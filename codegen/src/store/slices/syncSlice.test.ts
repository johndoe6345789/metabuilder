import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockFetchAllFromFlask,
  mockDbPut,
  mockDbGetAll,
  mockDbDelete
} = vi.hoisted(() => {
  return {
    mockFetchAllFromFlask: vi.fn<[], Promise<Record<string, any>>>(),
    mockDbPut: vi.fn<[string, any], Promise<void>>(),
    mockDbGetAll: vi.fn<[string], Promise<any[]>>(),
    mockDbDelete: vi.fn<[string, string], Promise<void>>()
  }
})

vi.mock('@/store/middleware/flaskSync', () => ({
  fetchAllFromFlask: mockFetchAllFromFlask
}))

vi.mock('@/lib/db', () => ({
  db: {
    put: mockDbPut,
    getAll: mockDbGetAll,
    delete: mockDbDelete
  }
}))

import { syncFromFlaskBulk } from './syncSlice'

describe('syncFromFlaskBulk', () => {
  const dispatch = vi.fn()
  const getState = vi.fn()

  beforeEach(() => {
    mockFetchAllFromFlask.mockReset()
    mockDbPut.mockReset()
    mockDbGetAll.mockReset()
    mockDbDelete.mockReset()
    dispatch.mockReset()
    getState.mockReset()
  })

  it('ignores invalid keys from Flask', async () => {
    mockFetchAllFromFlask.mockResolvedValue({
      'unknown:1': { id: '1' },
      'files': { id: 'missing-colon' },
      'models:': { id: 'empty-id' },
      'components:abc:extra': { id: 'abc' }
    })
    mockDbGetAll.mockResolvedValue([])

    const action = await syncFromFlaskBulk()(dispatch, getState, undefined)

    expect(action.type).toBe('sync/syncFromFlaskBulk/fulfilled')
    expect(mockDbPut).not.toHaveBeenCalled()
    expect(mockDbDelete).not.toHaveBeenCalled()
  })

  it('updates local DB for valid keys', async () => {
    const file = { id: 'file-1', name: 'File 1' }
    const model = { id: 'model-1', name: 'Model 1' }

    mockFetchAllFromFlask.mockResolvedValue({
      'files:file-1': file,
      'models:model-1': model
    })
    mockDbGetAll.mockResolvedValue([])

    const action = await syncFromFlaskBulk()(dispatch, getState, undefined)

    expect(action.type).toBe('sync/syncFromFlaskBulk/fulfilled')
    expect(mockDbPut).toHaveBeenCalledWith('files', file)
    expect(mockDbPut).toHaveBeenCalledWith('models', model)
  })

  it('deletes local entries missing from Flask data', async () => {
    const file = { id: 'keep', name: 'Keep' }

    mockFetchAllFromFlask.mockResolvedValue({
      'files:keep': file
    })
    mockDbGetAll.mockImplementation((storeName) => {
      if (storeName === 'files') {
        return Promise.resolve([file, { id: 'stale', name: 'Stale' }])
      }
      return Promise.resolve([])
    })

    const action = await syncFromFlaskBulk()(dispatch, getState, undefined)

    expect(action.type).toBe('sync/syncFromFlaskBulk/fulfilled')
    expect(mockDbPut).toHaveBeenCalledWith('files', file)
    expect(mockDbDelete).toHaveBeenCalledTimes(1)
    expect(mockDbDelete).toHaveBeenCalledWith('files', 'stale')
    expect(mockDbDelete).not.toHaveBeenCalledWith('files', 'keep')
  })
})
