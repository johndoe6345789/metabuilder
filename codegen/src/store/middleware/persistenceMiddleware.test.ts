import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PersistenceQueue } from './persistenceMiddleware'

const { putMock, deleteMock, syncMock } = vi.hoisted(() => ({
  putMock: vi.fn<[string, unknown], Promise<void>>(),
  deleteMock: vi.fn<[string, string], Promise<void>>(),
  syncMock: vi.fn<[string, string, unknown, string], Promise<void>>()
}))

vi.mock('@/lib/db', () => ({
  db: {
    put: putMock,
    delete: deleteMock
  }
}))

vi.mock('./flaskSync', () => ({
  syncToFlask: syncMock
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
    resolve: resolve!
  }
}

describe('PersistenceQueue', () => {
  beforeEach(() => {
    putMock.mockReset()
    deleteMock.mockReset()
    syncMock.mockReset()
    syncMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('flushes new operations enqueued while processing after the first batch finishes', async () => {
    const queue = new PersistenceQueue()
    const controlled = createControlledPromise()

    putMock
      .mockReturnValueOnce(controlled.promise)
      .mockResolvedValueOnce(undefined)

    queue.enqueue({
      type: 'put',
      storeName: 'files',
      key: 'file-1',
      value: { id: 'file-1' },
      timestamp: Date.now(),
    }, 0)

    await waitFor(() => {
      expect(putMock).toHaveBeenCalledTimes(1)
    })

    queue.enqueue({
      type: 'put',
      storeName: 'files',
      key: 'file-2',
      value: { id: 'file-2' },
      timestamp: Date.now(),
    }, 0)

    await nextTick()
    expect(putMock).toHaveBeenCalledTimes(1)

    controlled.resolve()

    await waitFor(() => {
      expect(putMock).toHaveBeenCalledTimes(2)
    })
  })
})
