import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const auth = vi.hoisted(() => ({ getAuthToken: vi.fn(() => 'tok') }))
vi.mock('@metabuilder/dbal-sso/core', () => auth)

import { useStreamApps } from './useStreamApps'

const app = (id: string, sortOrder?: number) => ({
  id,
  name: id,
  url: `https://${id}`,
  bgColor: '#000',
  fgColor: '#fff',
  embedMode: 'iframe' as const,
  ...(sortOrder === undefined ? {} : { sortOrder }),
})

function mockFetch(body: unknown, ok = true, status = 200) {
  const calls: {
    url: string
    method: string
    auth?: string
    body?: string
  }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const h = (init?.headers ?? {}) as Record<string, string>
      calls.push({
        url: String(url),
        method: init?.method ?? 'GET',
        auth: h.Authorization,
        body: init?.body as string | undefined,
      })
      return { ok, status, json: async () => body } as Response
    })
  )
  return calls
}

const ready = async (body: unknown = { data: [app('a')] }) => {
  const calls = mockFetch(body)
  const hook = renderHook(() => useStreamApps())
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return { ...hook, calls }
}

describe('useStreamApps', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    auth.getAuthToken.mockReturnValue('tok')
  })

  afterEach(() => vi.unstubAllGlobals())

  describe('loading', () => {
    it('lists the apps', async () => {
      const { result } = await ready()

      expect(result.current.apps).toHaveLength(1)
      expect(result.current.error).toBeNull()
    })

    it('accepts a bare array as well as an envelope', async () => {
      const { result } = await ready([app('a')])

      expect(result.current.apps).toHaveLength(1)
    })

    it('orders by sortOrder', async () => {
      const { result } = await ready({
        data: [app('third', 3), app('first', 1), app('second', 2)],
      })

      expect(result.current.apps.map(a => a.id)).toEqual([
        'first',
        'second',
        'third',
      ])
    })

    it('treats a missing sortOrder as zero rather than dropping the app', async () => {
      const { result } = await ready({ data: [app('later', 5), app('none')] })

      expect(result.current.apps.map(a => a.id)).toEqual(['none', 'later'])
    })

    it('sends the bearer token', async () => {
      const { calls } = await ready()

      expect(calls[0].auth).toBe('Bearer tok')
    })

    it('sends no Authorization header when signed out', async () => {
      auth.getAuthToken.mockReturnValue(null)
      const { calls } = await ready()

      expect(calls[0].auth).toBeUndefined()
    })

    it('reports a failed load', async () => {
      mockFetch({}, false, 503)
      const hook = renderHook(() => useStreamApps())

      await waitFor(() => expect(hook.result.current.loading).toBe(false))
      expect(hook.result.current.error).toBe('HTTP 503')
    })
  })

  describe('writing', () => {
    it('posts a new app and refetches', async () => {
      const { result, calls } = await ready()

      await act(async () => {
        await result.current.createApp(app('new'))
      })

      expect(calls.some(c => c.method === 'POST')).toBe(true)
      await waitFor(() => {
        expect(calls.filter(c => c.method === 'GET').length).toBeGreaterThan(1)
      })
    })

    it('puts a patch to the app url', async () => {
      const { result, calls } = await ready()

      await act(async () => {
        await result.current.updateApp('a', { name: 'Renamed' })
      })

      const put = calls.find(c => c.method === 'PUT')
      expect(put?.url).toMatch(/\/a$/)
      expect(JSON.parse(put?.body ?? '{}')).toEqual({ name: 'Renamed' })
    })

    it('deletes the app url', async () => {
      const { result, calls } = await ready()

      await act(async () => {
        await result.current.deleteApp('a')
      })

      expect(calls.find(c => c.method === 'DELETE')?.url).toMatch(/\/a$/)
    })

    it.each([
      ['createApp', (r: ReturnType<typeof useStreamApps>) => r.createApp(app('x'))],
      ['updateApp', (r: ReturnType<typeof useStreamApps>) => r.updateApp('a', {})],
      ['deleteApp', (r: ReturnType<typeof useStreamApps>) => r.deleteApp('a')],
    ])('%s throws rather than failing silently', async (_l, run) => {
      const { result } = await ready()
      mockFetch({}, false, 403)

      await expect(run(result.current)).rejects.toThrow('HTTP 403')
    })
  })
})
