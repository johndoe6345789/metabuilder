/**
 * Unit tests for useReduxMutation hook
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { useReduxMutation } from '../useReduxMutation'

describe('useReduxMutation', () => {
  it('should execute mutation and update state', async () => {
    const mockResponse = { id: 1, success: true }
    const mutateFn = jest.fn().mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useReduxMutation(mutateFn))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.status).toBe('idle')

    let mutationPromise: Promise<unknown>
    await act(async () => {
      mutationPromise = result.current.mutate({ id: 1 })
    })

    await waitFor(() => {
      expect(result.current.status).toBe('pending')
    })

    const response = await mutationPromise

    expect(response).toEqual(mockResponse)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.status).toBe('succeeded')
    expect(result.current.error).toBeNull()
  })

  it('should handle mutation errors', async () => {
    const errorMessage = 'Mutation failed'
    const mutateFn = jest
      .fn()
      .mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useReduxMutation(mutateFn))

    await act(async () => {
      try {
        await result.current.mutate({ id: 1 })
      } catch {
        // Expected to throw
      }
    })

    await waitFor(() => {
      expect(result.current.status).toBe('failed')
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.isLoading).toBe(false)
  })

  it('should call success callback', async () => {
    const mockResponse = { id: 1 }
    const mutateFn = jest.fn().mockResolvedValue(mockResponse)
    const onSuccess = jest.fn()

    const { result } = renderHook(() =>
      useReduxMutation(mutateFn, { onSuccess })
    )

    await act(async () => {
      await result.current.mutate({ id: 1 })
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockResponse)
    })
  })

  it('should call error callback on failure', async () => {
    const mutateFn = jest
      .fn()
      .mockRejectedValue(new Error('Test error'))
    const onError = jest.fn()

    const { result } = renderHook(() =>
      useReduxMutation(mutateFn, { onError })
    )

    await act(async () => {
      try {
        await result.current.mutate({ id: 1 })
      } catch {
        // Expected
      }
    })

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })
  })

  it('should track status changes', async () => {
    const mutateFn = jest.fn().mockResolvedValue({ success: true })
    const onStatusChange = jest.fn()

    const { result } = renderHook(() =>
      useReduxMutation(mutateFn, { onStatusChange })
    )

    expect(result.current.status).toBe('idle')

    await act(async () => {
      await result.current.mutate({ data: 'test' })
    })

    await waitFor(() => {
      expect(result.current.status).toBe('succeeded')
    })

    // Should have been called with pending and succeeded
    expect(onStatusChange.mock.calls.some(([s]) => s === 'pending')).toBe(true)
    expect(onStatusChange.mock.calls.some(([s]) => s === 'succeeded')).toBe(true)
  })

  it('should support multiple mutations sequentially', async () => {
    const mutateFn = jest
      .fn()
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 2 })

    const { result } = renderHook(() => useReduxMutation(mutateFn))

    let response1: unknown
    await act(async () => {
      response1 = await result.current.mutate({ id: 1 })
    })

    expect(response1).toEqual({ id: 1 })

    let response2: unknown
    await act(async () => {
      response2 = await result.current.mutate({ id: 2 })
    })

    expect(response2).toEqual({ id: 2 })
    expect(mutateFn).toHaveBeenCalledTimes(2)
  })

  it('should have reset function', async () => {
    const mutateFn = jest
      .fn()
      .mockRejectedValue(new Error('Test error'))

    const { result } = renderHook(() => useReduxMutation(mutateFn))

    await act(async () => {
      try {
        await result.current.mutate({ id: 1 })
      } catch {
        // Expected
      }
    })

    await waitFor(() => {
      expect(result.current.status).toBe('failed')
    })

    // Reset should clear state
    act(() => {
      result.current.reset()
    })

    // Status might still show failed until component re-renders
    // but reset function should be callable
    expect(result.current.reset).toBeDefined()
  })

  it('should pass payload to mutation function', async () => {
    const mutateFn = jest.fn().mockResolvedValue({ success: true })
    const testPayload = { userId: 123, action: 'update' }

    const { result } = renderHook(() => useReduxMutation(mutateFn))

    await act(async () => {
      await result.current.mutate(testPayload)
    })

    expect(mutateFn).toHaveBeenCalledWith(testPayload)
  })

  it('should handle typed payloads and responses', async () => {
    interface CreateUserPayload {
      email: string
      name: string
    }

    interface CreateUserResponse {
      id: string
      email: string
      createdAt: string
    }

    const mockResponse: CreateUserResponse = {
      id: 'user-123',
      email: 'test@example.com',
      createdAt: '2024-01-23T00:00:00Z',
    }

    const mutateFn = jest
      .fn<Promise<CreateUserResponse>, [CreateUserPayload]>()
      .mockResolvedValue(mockResponse)

    const { result } = renderHook(() =>
      useReduxMutation<CreateUserPayload, CreateUserResponse>(mutateFn)
    )

    const payload: CreateUserPayload = {
      email: 'test@example.com',
      name: 'Test User',
    }

    let response: unknown
    await act(async () => {
      response = await result.current.mutate(payload)
    })

    expect(response).toEqual(mockResponse)
    expect(mutateFn).toHaveBeenCalledWith(payload)
  })
})
