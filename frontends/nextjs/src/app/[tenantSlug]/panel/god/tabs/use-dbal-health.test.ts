import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useDbalHealth } from './use-dbal-health'

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useDbalHealth', () => {
  it('starts in the checking state', () => {
    mockFetch(async () => ({ ok: true }) as Response)
    const { result } = renderHook(() => useDbalHealth())
    expect(result.current.status).toBe('checking')
  })

  it('reports online once the health check succeeds', async () => {
    mockFetch(async () => ({ ok: true }) as Response)
    const { result } = renderHook(() => useDbalHealth())

    await waitFor(() => expect(result.current.status).toBe('online'))
    expect(result.current.message).toBeNull()
  })

  it('reports offline with the HTTP status when the response is not ok', async () => {
    mockFetch(async () => ({ ok: false, status: 503 }) as Response)
    const { result } = renderHook(() => useDbalHealth())

    await waitFor(() => expect(result.current.status).toBe('offline'))
    expect(result.current.message).toBe('HTTP 503')
  })

  it('reports offline with a generic message for a non-Error rejection', async () => {
    class NotAnError {
      message = 'boom'
    }
    mockFetch(() => Promise.reject(new NotAnError()) as Promise<Response>)
    const { result } = renderHook(() => useDbalHealth())

    await waitFor(() => expect(result.current.status).toBe('offline'))
    expect(result.current.message).toBe('DBAL health check failed')
  })

  it('refresh goes back to checking, then resolves again', async () => {
    mockFetch(async () => ({ ok: true }) as Response)
    const { result } = renderHook(() => useDbalHealth())
    await waitFor(() => expect(result.current.status).toBe('online'))

    mockFetch(async () => ({ ok: false, status: 500 }) as Response)
    act(() => {
      result.current.refresh()
    })

    await waitFor(() => expect(result.current.status).toBe('offline'))
    expect(result.current.message).toBe('HTTP 500')
  })
})
