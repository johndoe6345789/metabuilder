import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useDbalCollection } from './use-dbal-collection'

const row = (id: string) => ({ id, name: id })

function mockFetch(body: unknown, ok = true, status = 200, text = '') {
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
        text: async () => text,
      } as Response
    })
  )
  return calls
}

const ready = async (
  body: unknown = { data: { data: [row('a')] } },
  options = {}
) => {
  const calls = mockFetch(body)
  const hook = renderHook(() =>
    useDbalCollection({ tenant: 'acme', entity: 'PageConfig', ...options })
  )
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return { ...hook, calls }
}

describe('useDbalCollection', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  describe('loading', () => {
    it('lists the rows', async () => {
      const { result } = await ready()

      expect(result.current.items).toEqual([row('a')])
      expect(result.current.error).toBeNull()
    })

    it('builds the DBAL path from tenant, package and entity', async () => {
      const { calls } = await ready()

      expect(calls[0].url).toContain('/acme/core/PageConfig')
    })

    it('defaults the package to core', async () => {
      const { calls } = await ready(undefined, { entity: 'User' })

      expect(calls[0].url).toContain('/core/User')
    })

    it('takes an explicit package', async () => {
      const { calls } = await ready(undefined, {
        package: 'access',
        entity: 'PageConfig',
      })

      expect(calls[0].url).toContain('/acme/access/PageConfig')
    })

    it('reads every envelope shape, via the shared reader', async () => {
      const { result } = await ready([row('a')])

      expect(result.current.items).toEqual([row('a')])
    })

    it('reports a failed load and empties the list', async () => {
      mockFetch({}, false, 503)
      const hook = renderHook(() =>
        useDbalCollection({ tenant: 'acme', entity: 'PageConfig' })
      )

      await waitFor(() => expect(hook.result.current.loading).toBe(false))
      expect(hook.result.current.error).toBe('HTTP 503')
      expect(hook.result.current.items).toEqual([])
    })

    it('reports a network failure', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('ECONNREFUSED')
        })
      )
      const hook = renderHook(() =>
        useDbalCollection({ tenant: 'acme', entity: 'PageConfig' })
      )

      await waitFor(() => expect(hook.result.current.loading).toBe(false))
      expect(hook.result.current.error).toBe('ECONNREFUSED')
    })
  })

  describe('reload', () => {
    it('fetches again', async () => {
      const { result, calls } = await ready()
      const before = calls.length

      act(() => result.current.reload())

      await waitFor(() => expect(calls.length).toBeGreaterThan(before))
    })
  })

  describe('writing', () => {
    it('posts a new row and refetches', async () => {
      const { result, calls } = await ready()

      await act(async () => {
        await result.current.create({ path: '/x' })
      })

      const post = calls.find(c => c.method === 'POST')
      expect(JSON.parse(post?.body ?? '{}')).toEqual({ path: '/x' })
      await waitFor(() => {
        expect(calls.filter(c => c.method === 'GET').length).toBeGreaterThan(1)
      })
    })

    it('puts to the row url', async () => {
      const { result, calls } = await ready()

      await act(async () => {
        await result.current.update('a', { title: 'T' })
      })

      expect(calls.find(c => c.method === 'PUT')?.url).toMatch(
        /\/PageConfig\/a$/
      )
    })

    it('deletes the row url with no body', async () => {
      const { result, calls } = await ready()

      await act(async () => {
        await result.current.remove('a')
      })

      const del = calls.find(c => c.method === 'DELETE')
      expect(del?.url).toMatch(/\/PageConfig\/a$/)
      expect(del?.body).toBeUndefined()
    })

    it.each([
      ['create', (c: ReturnType<typeof useDbalCollection>) => c.create({})],
      ['update', (c: ReturnType<typeof useDbalCollection>) => c.update('a', {})],
      ['remove', (c: ReturnType<typeof useDbalCollection>) => c.remove('a')],
    ])('%s throws rather than reporting a silent success', async (_l, run) => {
      const { result } = await ready()
      mockFetch({}, false, 409)

      await expect(run(result.current as never)).rejects.toThrow('HTTP 409')
    })

    it('prefers the server message over the status', async () => {
      const { result } = await ready()
      mockFetch({}, false, 400, 'path already exists')

      await expect(result.current.create({})).rejects.toThrow(
        'path already exists'
      )
    })
  })
})
