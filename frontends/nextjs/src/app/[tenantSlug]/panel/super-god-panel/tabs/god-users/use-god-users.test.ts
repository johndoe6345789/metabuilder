import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGodUsers } from './use-god-users'

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useGodUsers', () => {
  it('starts empty before the fetch resolves', () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    const { result } = renderHook(() => useGodUsers())
    expect(result.current).toEqual([])
  })

  it('keeps only god and supergod users from the DBAL response', async () => {
    mockFetch(
      async () =>
        ({
          ok: true,
          json: async () => ({
            data: [
              { id: '1', username: 'a', email: 'a@x', role: 'god' },
              { id: '2', username: 'b', email: 'b@x', role: 'user' },
              { id: '3', username: 'c', email: 'c@x', role: 'supergod' },
            ],
          }),
        }) as Response
    )
    const { result } = renderHook(() => useGodUsers())

    await waitFor(() => expect(result.current).toHaveLength(2))
    expect(result.current.map(u => u.role)).toEqual(['god', 'supergod'])
  })

  it('falls back to the two placeholder accounts when DBAL is unreachable', async () => {
    mockFetch(async () => {
      throw new Error('offline')
    })
    const { result } = renderHook(() => useGodUsers())

    await waitFor(() => expect(result.current).toHaveLength(2))
    expect(result.current.map(u => u.username)).toEqual(['god', 'super'])
  })

  it('stays empty when the response is ok but has no data', async () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    const { result } = renderHook(() => useGodUsers())

    await new Promise(r => setTimeout(r, 10))
    expect(result.current).toEqual([])
  })

  it('stays empty when the response is not ok', async () => {
    mockFetch(async () => ({ ok: false, status: 500 }) as Response)
    const { result } = renderHook(() => useGodUsers())

    await new Promise(r => setTimeout(r, 10))
    expect(result.current).toEqual([])
  })
})
