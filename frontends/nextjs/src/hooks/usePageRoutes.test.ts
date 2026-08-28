import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

import { usePageRoutes } from './usePageRoutes'

const page = (id: string, path = `/${id}`) => ({ id, path, title: id })

function mockFetch(body: unknown, ok = true, status = 200) {
  const calls: { url: string; method: string; body?: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method ?? 'GET',
        body: init?.body as string | undefined,
      })
      return {
        ok,
        status,
        json: async () => body,
        text: async () => 'server said no',
      } as Response
    })
  )
  return calls
}

const loaded = async (
  body: unknown = { success: true, data: { data: [page('a')] } }
) => {
  const calls = mockFetch(body)
  const hook = renderHook(() => usePageRoutes())
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return { ...hook, calls }
}

describe('usePageRoutes', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  describe('loading', () => {
    it('reads the pages out of the envelope', async () => {
      const { result } = await loaded()

      expect(result.current.pages).toEqual([page('a')])
      expect(result.current.error).toBeNull()
    })

    it('reads a two-level payload with no success key', async () => {
      // This used to answer [] -- the local unwrap required both `success`
      // and `data`, unlike every other reader. Now shared with them.
      const { result } = await loaded({ data: { data: [page('a')] } })

      expect(result.current.pages).toEqual([page('a')])
    })

    it('accepts a bare array', async () => {
      const { result } = await loaded([page('a')])

      expect(result.current.pages).toEqual([page('a')])
    })

    it('answers an empty list for a shape it does not recognise', async () => {
      const { result } = await loaded({ nonsense: true })

      expect(result.current.pages).toEqual([])
    })

    it('queries the tenant it was given', async () => {
      mockFetch({ success: true, data: { data: [] } })
      const { result } = renderHook(() => usePageRoutes('acme'))
      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(
        (globalThis.fetch as unknown as { mock: { calls: unknown[][] } }).mock
          .calls[0][0]
      ).toContain('/acme/core/PageConfig')
    })

    it('defaults to the system tenant', async () => {
      const { calls } = await loaded()

      expect(calls[0].url).toContain('/system/core/PageConfig')
    })

    it('reports a failed load and stops loading', async () => {
      mockFetch({}, false, 503)
      const { result } = renderHook(() => usePageRoutes())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.error).toBe('HTTP 503')
      expect(result.current.pages).toEqual([])
    })
  })

  describe('reload', () => {
    it('fetches again', async () => {
      const { result, calls } = await loaded()
      const before = calls.length

      act(() => result.current.reload())

      await waitFor(() => expect(calls.length).toBeGreaterThan(before))
    })
  })

  describe('create', () => {
    it('posts the page and refetches', async () => {
      const { result, calls } = await loaded()

      await act(async () => {
        await result.current.create({ path: '/new', title: 'New' } as never)
      })

      const post = calls.find(c => c.method === 'POST')
      expect(JSON.parse(post?.body ?? '{}')).toEqual({
        path: '/new',
        title: 'New',
      })
      await waitFor(() => {
        expect(calls.filter(c => c.method === 'GET').length).toBeGreaterThan(1)
      })
    })

    it('throws the server message rather than reporting success', async () => {
      const { result } = await loaded()
      mockFetch({}, false, 400)

      await expect(
        result.current.create({ path: '/x' } as never)
      ).rejects.toThrow('server said no')
    })
  })

  describe('update', () => {
    it('puts to the page url', async () => {
      const { result, calls } = await loaded()

      await act(async () => {
        await result.current.update('a', { title: 'Renamed' })
      })

      const put = calls.find(c => c.method === 'PUT')
      expect(put?.url).toMatch(/\/PageConfig\/a$/)
    })

    it('throws on failure', async () => {
      const { result } = await loaded()
      mockFetch({}, false, 409)

      await expect(result.current.update('a', {})).rejects.toThrow('HTTP 409')
    })
  })

  describe('remove', () => {
    it('deletes the page url', async () => {
      const { result, calls } = await loaded()

      await act(async () => {
        await result.current.remove('a')
      })

      expect(calls.find(c => c.method === 'DELETE')?.url).toMatch(
        /\/PageConfig\/a$/
      )
    })

    it('throws on failure', async () => {
      const { result } = await loaded()
      mockFetch({}, false, 404)

      await expect(result.current.remove('a')).rejects.toThrow('HTTP 404')
    })
  })
})
