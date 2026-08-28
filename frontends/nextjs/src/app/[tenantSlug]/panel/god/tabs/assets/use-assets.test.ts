import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useAssets } from './use-assets'

const asset = (key: string) => ({ key, size: 10 })

function mockFetch(
  routes: { match: string; body?: unknown; ok?: boolean; status?: number }[]
) {
  const calls: { url: string; method: string; body?: unknown }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const u = String(url)
      calls.push({ url: u, method: init?.method ?? 'GET', body: init?.body })
      const route =
        routes.find(r => u.includes(r.match) && r.match !== '') ?? routes[0]
      const ok = route?.ok ?? true
      return {
        ok,
        status: route?.status ?? (ok ? 200 : 400),
        json: async () => route?.body ?? { objects: [] },
      } as Response
    })
  )
  return calls
}

const listed = (...rows: ReturnType<typeof asset>[]) => ({
  match: '/api/assets',
  body: { objects: rows },
})

const ready = async () => {
  const hook = renderHook(() => useAssets('acme'))
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

describe('useAssets', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  describe('listing', () => {
    it('lists what the store returned', async () => {
      mockFetch([listed(asset('logo.png'))])
      const { result } = await ready()

      expect(result.current.assets).toEqual([asset('logo.png')])
      expect(result.current.error).toBeNull()
    })

    it('scopes the request to the tenant', async () => {
      const calls = mockFetch([listed()])
      await ready()

      expect(calls[0].url).toContain('tenant=acme')
    })

    it('url-encodes a tenant that needs it', async () => {
      const calls = mockFetch([listed()])
      const hook = renderHook(() => useAssets('a b/c'))
      await waitFor(() => expect(hook.result.current.loading).toBe(false))

      expect(calls[0].url).toContain('tenant=a%20b%2Fc')
    })

    it('shows the server reason for a failed list', async () => {
      mockFetch([
        { match: '/api/assets', ok: false, body: { error: 'Not signed in' } },
      ])
      const { result } = await ready()

      expect(result.current.error).toBe('Not signed in')
    })

    it('falls back to a generic message when none is given', async () => {
      mockFetch([{ match: '/api/assets', ok: false, body: {} }])
      const { result } = await ready()

      expect(result.current.error).toBe('Could not list files')
    })

    it('reports an unreachable store', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('ECONNREFUSED')
        })
      )
      const { result } = await ready()

      expect(result.current.error).toBe('Could not reach the file store')
    })

    it('shows an empty list when the payload has no objects', async () => {
      mockFetch([{ match: '/api/assets', body: {} }])
      const { result } = await ready()

      expect(result.current.assets).toEqual([])
    })
  })

  describe('upload', () => {
    const file = () => new File(['x'], 'logo.png', { type: 'image/png' })

    it('posts the file and the tenant as form data', async () => {
      const calls = mockFetch([listed()])
      const { result } = await ready()

      await act(async () => {
        await result.current.upload(file())
      })

      const post = calls.find(c => c.method === 'POST')
      expect(post?.body).toBeInstanceOf(FormData)
      expect((post?.body as FormData).get('tenant')).toBe('acme')
      expect((post?.body as FormData).get('file')).toBeInstanceOf(File)
    })

    it('reports success and refreshes the list', async () => {
      const calls = mockFetch([listed()])
      const { result } = await ready()
      const before = calls.length

      let ok = false
      await act(async () => {
        ok = await result.current.upload(file())
      })

      expect(ok).toBe(true)
      expect(calls.length).toBeGreaterThan(before + 1)
    })

    it('shows the server reason rather than a generic failure', async () => {
      // "File too large" or "wrong type" is the useful message.
      mockFetch([
        {
          match: '/api/assets',
          ok: false,
          status: 413,
          body: { error: 'File too large' },
        },
      ])
      const { result } = await ready()

      let ok = true
      await act(async () => {
        ok = await result.current.upload(file())
      })

      expect(ok).toBe(false)
      expect(result.current.error).toBe('File too large')
    })

    it('names the status when the server gives no reason', async () => {
      mockFetch([
        { match: '/api/assets', ok: false, status: 500, body: {} },
      ])
      const { result } = await ready()

      await act(async () => {
        await result.current.upload(file())
      })

      expect(result.current.error).toContain('500')
    })

    it('clears busy even when the upload throws', async () => {
      mockFetch([listed()])
      const { result } = await ready()
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('offline')
        })
      )

      await act(async () => {
        await result.current.upload(file())
      })

      expect(result.current.busy).toBe(false)
      expect(result.current.error).toBe('Upload failed')
    })
  })

  describe('remove', () => {
    it('deletes the asset and refreshes', async () => {
      const calls = mockFetch([listed(asset('logo.png'))])
      const { result } = await ready()

      await act(async () => {
        await result.current.remove('logo.png')
      })

      expect(calls.some(c => c.method === 'DELETE')).toBe(true)
      expect(result.current.busy).toBe(false)
    })
  })
})
