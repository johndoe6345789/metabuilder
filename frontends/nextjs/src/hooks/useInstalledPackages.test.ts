import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useInstalledPackages } from './useInstalledPackages'

const row = (packageId: string, enabled = true) => ({
  id: `ip_${packageId}`,
  packageId,
  tenantId: 'acme',
  version: '1.0.0',
  enabled,
})

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
      return { ok, status, json: async () => body } as Response
    })
  )
  return calls
}

const ready = async (body: unknown = { data: { data: [row('forum')] } }) => {
  const calls = mockFetch(body)
  const hook = renderHook(() => useInstalledPackages('acme'))
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return { ...hook, calls }
}

describe('useInstalledPackages', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  describe('loading', () => {
    it('lists what is installed', async () => {
      const { result } = await ready()

      expect(result.current.installed).toHaveLength(1)
      expect(result.current.error).toBeNull()
    })

    it('queries the tenant it was given', async () => {
      const { calls } = await ready()

      expect(calls[0].url).toContain('/acme/core/InstalledPackage')
    })

    it('reports a failed load', async () => {
      mockFetch({}, false, 503)
      const hook = renderHook(() => useInstalledPackages('acme'))

      await waitFor(() => expect(hook.result.current.loading).toBe(false))
      expect(hook.result.current.error).toBe('HTTP 503')
    })

    it('accepts the single-level envelope too', async () => {
      const { result } = await ready({ data: [row('forum')] })

      expect(result.current.installed).toHaveLength(1)
    })

    it('accepts a bare array', async () => {
      const { result } = await ready([row('forum')])

      expect(result.current.installed).toHaveLength(1)
    })

    it('answers an empty list for an unrecognised shape', async () => {
      const { result } = await ready({ nonsense: true })

      expect(result.current.installed).toEqual([])
    })
  })

  describe('isInstalled', () => {
    it('is true for an enabled package', async () => {
      const { result } = await ready()

      expect(result.current.isInstalled('forum')).toBe(true)
    })

    it('is false for a package that is present but disabled', async () => {
      // A disabled row means installed-but-off, which must not count as on.
      const { result } = await ready({
        data: { data: [row('forum', false)] },
      })

      expect(result.current.isInstalled('forum')).toBe(false)
    })

    it('is false for a package that is absent', async () => {
      const { result } = await ready()

      expect(result.current.isInstalled('nope')).toBe(false)
    })
  })

  describe('installedRecord', () => {
    it('finds the row for a package', async () => {
      const { result } = await ready()

      expect(result.current.installedRecord('forum')?.id).toBe('ip_forum')
    })

    it('answers undefined for one that is not there', async () => {
      const { result } = await ready()

      expect(result.current.installedRecord('nope')).toBeUndefined()
    })
  })

  describe('install', () => {
    it('posts the package scoped to the tenant', async () => {
      const { result, calls } = await ready()

      await act(async () => {
        await result.current.install('blog')
      })

      const post = calls.find(c => c.method === 'POST')
      const body = JSON.parse(post?.body ?? '{}')
      expect(body).toMatchObject({
        packageId: 'blog',
        tenantId: 'acme',
        enabled: true,
      })
    })

    it('refetches after installing', async () => {
      const { result, calls } = await ready()
      const before = calls.filter(c => c.method === 'GET').length

      await act(async () => {
        await result.current.install('blog')
      })

      await waitFor(() => {
        expect(calls.filter(c => c.method === 'GET').length).toBeGreaterThan(
          before
        )
      })
    })

    it('throws rather than reporting a silent success', async () => {
      const { result } = await ready()
      mockFetch({}, false, 409)

      // The shared collection hook reports the server's own message where
      // there is one, falling back to the status.
      await expect(result.current.install('blog')).rejects.toThrow()
    })
  })

  describe('uninstall', () => {
    it('deletes the row by id', async () => {
      const { result, calls } = await ready()

      await act(async () => {
        await result.current.uninstall('ip_forum')
      })

      const del = calls.find(c => c.method === 'DELETE')
      expect(del?.url).toMatch(/\/InstalledPackage\/ip_forum$/)
    })

    it('throws on failure', async () => {
      const { result } = await ready()
      mockFetch({}, false, 404)

      await expect(result.current.uninstall('ip_forum')).rejects.toThrow()
    })
  })
})
