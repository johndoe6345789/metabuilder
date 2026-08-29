import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useSchemaEditor } from './useSchemaEditor'

const model = (id: string) => ({ id, name: id, fields: '[]' })

function mockFetch(body: unknown, ok = true) {
  const calls: { url: string; method: string; body?: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method ?? 'GET',
        body: init?.body as string | undefined,
      })
      if (!ok) throw new Error('offline')
      return { ok, json: async () => body } as Response
    })
  )
  return calls
}

const ready = async (body: unknown = { data: [model('Post')] }, ok = true) => {
  const calls = mockFetch(body, ok)
  const hook = renderHook(() => useSchemaEditor('acme'))
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return { ...hook, calls }
}

describe('useSchemaEditor', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => vi.unstubAllGlobals())

  describe('loading', () => {
    it('uses what DBAL returned', async () => {
      const { result } = await ready()

      expect(result.current.models).toEqual([model('Post')])
      expect(result.current.offline).toBe(false)
    })

    it('scopes the request to the tenant', async () => {
      const { calls } = await ready()

      expect(calls[0].url).toContain('/acme/core/entity_schema')
    })

    it('goes offline when DBAL is unreachable', async () => {
      const { result } = await ready({}, false)

      expect(result.current.offline).toBe(true)
    })

    it('goes offline on a non-ok response too', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ ok: false, json: async () => ({}) }) as Response)
      )
      const hook = renderHook(() => useSchemaEditor('acme'))

      await waitFor(() => expect(hook.result.current.loading).toBe(false))
      expect(hook.result.current.offline).toBe(true)
    })

    it('falls back to the local copy when DBAL returns none', async () => {
      // An empty server list must not wipe work saved locally.
      localStorage.setItem(
        'app-schemas-acme',
        JSON.stringify([model('Local')])
      )

      const { result } = await ready({ data: [] })

      expect(result.current.models).toEqual([model('Local')])
    })

    it('reads the local copy when offline', async () => {
      localStorage.setItem(
        'app-schemas-acme',
        JSON.stringify([model('Local')])
      )

      const { result } = await ready({}, false)

      expect(result.current.models).toEqual([model('Local')])
    })
  })

  describe('saving', () => {
    it('writes locally before attempting DBAL', async () => {
      const { result } = await ready()

      await act(async () => {
        await result.current.saveModels([model('New')])
      })

      expect(localStorage.getItem('app-schemas-acme')).toContain('New')
      expect(result.current.models).toEqual([model('New')])
    })

    it('puts the models to DBAL when online', async () => {
      const { result, calls } = await ready()

      await act(async () => {
        await result.current.saveModels([model('New')])
      })

      const put = calls.find(c => c.method === 'PUT')
      expect(JSON.parse(put?.body ?? '{}')).toMatchObject({
        tenantId: 'acme',
        data: [model('New')],
      })
    })

    it('does not attempt DBAL while offline', async () => {
      const { result, calls } = await ready({}, false)
      const before = calls.length

      await act(async () => {
        await result.current.saveModels([model('New')])
      })

      expect(calls.length).toBe(before)
    })

    it('keeps the local write when the DBAL put fails', async () => {
      const { result } = await ready()
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('gone')
        })
      )

      await act(async () => {
        await result.current.saveModels([model('New')])
      })

      expect(localStorage.getItem('app-schemas-acme')).toContain('New')
      expect(result.current.models).toEqual([model('New')])
    })
  })
})
