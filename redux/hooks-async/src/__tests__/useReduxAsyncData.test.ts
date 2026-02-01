/**
 * Unit tests for useReduxAsyncData hook
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useReduxAsyncData } from '../useReduxAsyncData'

describe('useReduxAsyncData', () => {
  it('should fetch data and update state', async () => {
    const mockData = { id: 1, name: 'Test' }
    const fetchFn = jest.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() => useReduxAsyncData(fetchFn))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('should handle fetch errors', async () => {
    const errorMessage = 'Fetch failed'
    const fetchFn = jest.fn().mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useReduxAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeTruthy()
  })

  it('should call success callback', async () => {
    const mockData = { id: 1 }
    const fetchFn = jest.fn().mockResolvedValue(mockData)
    const onSuccess = jest.fn()

    const { result } = renderHook(() =>
      useReduxAsyncData(fetchFn, { onSuccess })
    )

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData)
    })
  })

  it('should call error callback on failure', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('Test error'))
    const onError = jest.fn()

    const { result } = renderHook(() => useReduxAsyncData(fetchFn, { onError }))

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })
  })

  it('should support manual refetch', async () => {
    const mockData1 = { version: 1 }
    const mockData2 = { version: 2 }
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2)

    const { result } = renderHook(() => useReduxAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1)
    })

    // Manual refetch
    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2)
    })

    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('should support manual retry', async () => {
    const mockData = { id: 1 }
    const fetchFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useReduxAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    // Manual retry
    await result.current.retry()

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData)
      expect(result.current.error).toBeNull()
    })
  })

  it('should respect maxRetries option', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('Persistent error'))

    const { result } = renderHook(() =>
      useReduxAsyncData(fetchFn, { maxRetries: 2, retryDelay: 10 })
    )

    await waitFor(
      () => {
        expect(result.current.error).toBeTruthy()
      },
      { timeout: 200 }
    )

    // Should not retry indefinitely
    expect(fetchFn.mock.calls.length).toBeLessThanOrEqual(3) // initial + 2 retries
  })

  it('should indicate refetching state', async () => {
    const mockData = { id: 1 }
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(mockData)
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockData), 100)
          )
      )

    const { result } = renderHook(() => useReduxAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData)
    })

    const refetchPromise = result.current.refetch()

    await waitFor(() => {
      expect(result.current.isRefetching).toBe(true)
      expect(result.current.data).toEqual(mockData) // Stale data preserved
    })

    await refetchPromise
  })

  it('should handle dependencies array', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ id: 1 })

    const { result, rerender } = renderHook(
      ({ dep }) => useReduxAsyncData(fetchFn, { dependencies: [dep] }),
      { initialProps: { dep: 'value1' } }
    )

    await waitFor(() => {
      expect(result.current.data).toBeTruthy()
    })

    const callCount1 = fetchFn.mock.calls.length

    rerender({ dep: 'value2' })

    await waitFor(() => {
      expect(fetchFn.mock.calls.length).toBeGreaterThan(callCount1)
    })
  })
})
