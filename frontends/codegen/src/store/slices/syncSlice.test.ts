import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockFetchAllFromDBAL,
} = vi.hoisted(() => {
  return {
    mockFetchAllFromDBAL: vi.fn(),
  }
})

vi.mock('@/store/middleware/dbalSync', () => ({
  fetchAllFromDBAL: mockFetchAllFromDBAL,
  getDBALHealth: vi.fn(),
  getDBALConfig: vi.fn(),
  getDBALAdapters: vi.fn(),
  syncAllToDBAL: vi.fn(),
  testDBALConnection: vi.fn(),
  switchDBALAdapter: vi.fn(),
  seedDBAL: vi.fn(),
}))

import { syncFromDBALBulk } from './dbalSlice'

describe('syncFromDBALBulk', () => {
  const dispatch = vi.fn()
  const getState = vi.fn()

  beforeEach(() => {
    mockFetchAllFromDBAL.mockReset()
    dispatch.mockReset()
    getState.mockReset()
  })

  it('returns empty arrays when DBAL has no data', async () => {
    mockFetchAllFromDBAL.mockResolvedValue({
      files: [],
      models: [],
      components: [],
      workflows: [],
      componentTrees: [],
      lambdas: [],
      project: [],
      kv: [],
    })

    const action = await syncFromDBALBulk()(dispatch, getState, undefined)

    expect(action.type).toBe('dbal/syncFromDBALBulk/fulfilled')
    const payload = action.payload as any
    expect(payload.data.files).toHaveLength(0)
    expect(payload.data.models).toHaveLength(0)
    expect(payload.data.components).toHaveLength(0)
    expect(payload.data.workflows).toHaveLength(0)
  })

  it('organizes DBAL records into data collections', async () => {
    const file = { id: 'file-1', name: 'File 1' }
    const model = { id: 'model-1', name: 'Model 1' }

    mockFetchAllFromDBAL.mockResolvedValue({
      files: [file],
      models: [model],
      components: [],
      workflows: [],
      componentTrees: [],
      lambdas: [],
      project: [],
      kv: [],
    })

    const action = await syncFromDBALBulk()(dispatch, getState, undefined)

    expect(action.type).toBe('dbal/syncFromDBALBulk/fulfilled')
    const payload = action.payload as any
    expect(payload.data.files).toEqual([file])
    expect(payload.data.models).toEqual([model])
    expect(payload.data.components).toHaveLength(0)
    expect(payload.data.workflows).toHaveLength(0)
    expect(payload.timestamp).toBeGreaterThan(0)
  })

  it('returns all items for a store (server is source of truth)', async () => {
    const file1 = { id: 'keep', name: 'Keep' }
    const file2 = { id: 'new', name: 'New' }

    mockFetchAllFromDBAL.mockResolvedValue({
      files: [file1, file2],
      models: [],
      components: [],
      workflows: [],
      componentTrees: [],
      lambdas: [],
      project: [],
      kv: [],
    })

    const action = await syncFromDBALBulk()(dispatch, getState, undefined)

    expect(action.type).toBe('dbal/syncFromDBALBulk/fulfilled')
    const payload = action.payload as any
    expect(payload.data.files).toHaveLength(2)
    expect(payload.data.files).toContainEqual(file1)
    expect(payload.data.files).toContainEqual(file2)
  })
})
