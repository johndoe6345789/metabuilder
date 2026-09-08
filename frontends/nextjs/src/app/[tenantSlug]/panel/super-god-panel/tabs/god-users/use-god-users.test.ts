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

/**
 * Two bugs in one line: the path said `core/user` where the entity is
 * `User`, so DBAL refused it and the tab silently showed nothing -- and
 * when something did answer, `json.data` on the real envelope is an
 * object, so `.filter` threw and took the tab down.
 */
describe('what it asks for, and how it reads the answer', () => {
  it('asks for the entity by the name the schema declares', async () => {
    const fn = vi.fn(
      async () =>
        ({ ok: true, json: async () => ({ data: { data: [] } }) }) as Response
    )
    vi.stubGlobal('fetch', fn)

    renderHook(() => useGodUsers())
    await new Promise(r => setTimeout(r, 10))

    expect(String(fn.mock.calls[0]?.[0])).toContain('/system/core/User')
  })

  it('reads gods out of the real two-level envelope', async () => {
    mockFetch(
      async () =>
        ({
          ok: true,
          json: async () => ({
            data: {
              data: [
                { id: '1', username: 'rosa', email: 'r@x', role: 'god' },
                { id: '2', username: 'sam', email: 's@x', role: 'user' },
              ],
            },
          }),
        }) as Response
    )

    const { result } = renderHook(() => useGodUsers())
    await new Promise(r => setTimeout(r, 10))

    expect(result.current.map(u => u.username)).toEqual(['rosa'])
  })
})
