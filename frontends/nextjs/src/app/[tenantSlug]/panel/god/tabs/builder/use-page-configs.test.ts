import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePageConfigs } from './use-page-configs'

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePageConfigs', () => {
  it('starts empty and not loading', () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    const { result } = renderHook(() => usePageConfigs('acme'))
    expect(result.current.rows).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('loads, normalises, and sorts rows by path', async () => {
    mockFetch(
      async () =>
        ({
          ok: true,
          json: async () => ({
            data: {
              data: [
                { id: '2', path: '/z', pageTreeId: 'tree-2' },
                { id: '1', path: '/a', title: 'Alpha', component: 'Foo' },
              ],
            },
          }),
        }) as Response
    )

    const { result } = renderHook(() => usePageConfigs('acme'))
    await result.current.refresh()

    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2)
    })
    expect(result.current.rows[0]).toEqual({
      id: '1',
      path: '/a',
      title: 'Alpha',
      component: 'Foo',
      hasTree: false,
      pageTreeId: null,
      packageId: null,
    })
    expect(result.current.rows[1].hasTree).toBe(true)
    expect(result.current.rows[1].pageTreeId).toBe('tree-2')
    expect(result.current.loading).toBe(false)
  })

  it('defaults title to path when the row has none', async () => {
    mockFetch(
      async () =>
        ({
          ok: true,
          json: async () => ({ data: { data: [{ id: '1', path: '/x' }] } }),
        }) as Response
    )

    const { result } = renderHook(() => usePageConfigs('acme'))
    await result.current.refresh()

    await waitFor(() => expect(result.current.rows).toHaveLength(1))
    expect(result.current.rows[0].title).toBe('/x')
  })

  it('drops rows with no path', async () => {
    mockFetch(
      async () =>
        ({
          ok: true,
          json: async () => ({
            data: { data: [{ id: '1' }, { id: '2', path: '/ok' }] },
          }),
        }) as Response
    )

    const { result } = renderHook(() => usePageConfigs('acme'))
    await result.current.refresh()

    await waitFor(() => expect(result.current.rows).toHaveLength(1))
    expect(result.current.rows[0].path).toBe('/ok')
  })

  it('clears rows when the response is not ok', async () => {
    mockFetch(async () => ({ ok: false, status: 500 }) as Response)

    const { result } = renderHook(() => usePageConfigs('acme'))
    await result.current.refresh()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.rows).toEqual([])
  })

  it('clears rows and stops loading if the fetch throws', async () => {
    mockFetch(async () => {
      throw new Error('offline')
    })

    const { result } = renderHook(() => usePageConfigs('acme'))
    await result.current.refresh()

    expect(result.current.rows).toEqual([])
    expect(result.current.loading).toBe(false)
  })
})

/**
 * Every failure used to become an empty list, which is exactly what this
 * says when a community really has published nothing. So during an outage
 * the builder's route dropdown went blank and read as "nothing is
 * published" -- and the founder would republish over a path they believed
 * was free, taking over a page that was live.
 */
describe('when the route list cannot be read', () => {
  it('says so, rather than looking like an empty community', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 503 }))
    )
    const { result } = renderHook(() => usePageConfigs('acme'))

    await waitFor(() => {
      expect(result.current.unreachable).toBe(true)
    })
    expect(result.current.rows).toEqual([])
  })

  it('says so when nothing answers at all', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED')
      })
    )
    const { result } = renderHook(() => usePageConfigs('acme'))

    await waitFor(() => {
      expect(result.current.unreachable).toBe(true)
    })
  })

  it('does not say so for a community that has published nothing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ data: { data: [] } }), { status: 200 })
      )
    )
    const { result } = renderHook(() => usePageConfigs('acme'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.unreachable).toBe(false)
    expect(result.current.rows).toEqual([])
  })
})
