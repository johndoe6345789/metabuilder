import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AutoSyncManager } from './autoSyncMiddleware'

const { syncToFlaskBulkMock } = vi.hoisted(() => ({
  syncToFlaskBulkMock: vi.fn(() => ({ type: 'sync/bulk' })),
}))

vi.mock('../slices/syncSlice', () => ({
  syncToFlaskBulk: syncToFlaskBulkMock,
  checkFlaskConnection: vi.fn(() => ({ type: 'sync/check' })),
}))

const nextTick = () => new Promise(resolve => setTimeout(resolve, 0))

const waitFor = async (assertion: () => void, attempts = 5) => {
  let lastError: unknown

  for (let i = 0; i < attempts; i += 1) {
    await nextTick()

    try {
      assertion()
      return
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

const createControlledPromise = () => {
  let resolve: () => void

  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise
  })

  return {
    promise,
    resolve: resolve!,
  }
}

describe('AutoSyncManager', () => {
  let manager: AutoSyncManager
  let dispatchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    manager = new AutoSyncManager()
    dispatchMock = vi.fn()
    manager.setDispatch(dispatchMock)
    syncToFlaskBulkMock.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('serializes performSync calls', async () => {
    const firstSync = createControlledPromise()
    dispatchMock
      .mockReturnValueOnce(firstSync.promise)
      .mockResolvedValueOnce(undefined)

    const firstRun = manager.syncNow()
    const secondRun = manager.syncNow()

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledTimes(1)
    })

    firstSync.resolve()
    await Promise.all([firstRun, secondRun])

    expect(dispatchMock).toHaveBeenCalledTimes(2)
  })

  it('resets changeCounter after a successful sync', async () => {
    dispatchMock.mockResolvedValue(undefined)

    manager.trackChange()
    manager.trackChange()

    await manager.syncNow()

    expect(manager.getStatus().changeCounter).toBe(0)
  })

  it('runs one pending sync after an in-flight sync finishes', async () => {
    const firstSync = createControlledPromise()
    dispatchMock
      .mockReturnValueOnce(firstSync.promise)
      .mockResolvedValueOnce(undefined)

    const syncPromise = manager.syncNow()

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledTimes(1)
    })

    manager.trackChange()
    manager.trackChange()

    firstSync.resolve()
    await syncPromise
    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledTimes(2)
    })
  })
})
