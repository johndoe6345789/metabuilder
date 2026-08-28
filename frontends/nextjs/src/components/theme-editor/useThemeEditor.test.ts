import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const theme = vi.hoisted(() => ({
  resolveTenantTheme: vi.fn(),
  applyTenantTheme: vi.fn(),
  applyColorsToRoot: vi.fn(),
}))

vi.mock('./apply-tenant-theme', () => theme)

import { useThemeEditor } from './useThemeEditor'

const light = { '--bg': '#fff' }
const dark = { '--bg': '#000' }

function mockFetch(status = 200) {
  const calls: { url: string; method: string; body?: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method ?? 'GET',
        body: init?.body as string | undefined,
      })
      return { ok: status < 400, status } as Response
    })
  )
  return calls
}

const ready = async () => {
  const hook = renderHook(() => useThemeEditor())
  await waitFor(() => expect(theme.resolveTenantTheme).toHaveBeenCalled())
  return hook
}

describe('useThemeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    theme.resolveTenantTheme.mockResolvedValue({ light, dark })
    mockFetch()
  })

  afterEach(() => vi.unstubAllGlobals())

  describe('loading the tenant theme', () => {
    it('adopts the resolved colours', async () => {
      const { result } = await ready()

      await waitFor(() => {
        expect(result.current.lightColors).toEqual(light)
      })
      expect(result.current.darkColors).toEqual(dark)
    })

    it('applies the theme so the page matches the swatches', async () => {
      await ready()

      await waitFor(() => expect(theme.applyTenantTheme).toHaveBeenCalled())
    })

    it('applies the dark variant when the document is dark', async () => {
      document.documentElement.setAttribute('data-theme', 'dark')

      await ready()

      await waitFor(() => {
        expect(theme.applyTenantTheme).toHaveBeenCalledWith(
          expect.anything(),
          'dark'
        )
      })
      document.documentElement.removeAttribute('data-theme')
    })

    it('survives a failed resolve', async () => {
      theme.resolveTenantTheme.mockRejectedValue(new Error('offline'))

      const { result } = await ready()

      // resolveTenantTheme falls back internally; the editor keeps defaults.
      expect(result.current.lightColors).toBeTruthy()
    })
  })

  describe('starting state', () => {
    it('opens on the light tab', async () => {
      const { result } = await ready()
      expect(result.current.activeTab).toBe('light')
    })
  })

  describe('updateColor', () => {
    it('changes only the named light key', async () => {
      const { result } = await ready()
      await waitFor(() => expect(result.current.lightColors).toEqual(light))

      act(() => result.current.updateColor('light', '--bg', '#eee'))

      expect(result.current.lightColors['--bg']).toBe('#eee')
      expect(result.current.darkColors['--bg']).toBe('#000')
    })

    it('changes only the named dark key', async () => {
      const { result } = await ready()
      await waitFor(() => expect(result.current.darkColors).toEqual(dark))

      act(() => result.current.updateColor('dark', '--bg', '#111'))

      expect(result.current.darkColors['--bg']).toBe('#111')
      expect(result.current.lightColors['--bg']).toBe('#fff')
    })

    it('adds a key that was not there before', async () => {
      const { result } = await ready()

      act(() => result.current.updateColor('light', '--new', '#123456'))

      expect(result.current.lightColors['--new']).toBe('#123456')
    })
  })

  describe('saveColors', () => {
    it('writes to localStorage first, so the change survives a failed POST', async () => {
      const { result } = await ready()

      act(() => result.current.saveColors(light, dark))

      const stored = JSON.parse(
        localStorage.getItem('pg-theme-overrides') ?? '{}'
      )
      expect(stored.light).toEqual(light)
    })

    it('posts the theme to DBAL', async () => {
      const calls = mockFetch()
      const { result } = await ready()

      act(() => result.current.saveColors(light, dark))

      await waitFor(() => {
        expect(calls.some(c => c.method === 'POST')).toBe(true)
      })
      const body = JSON.parse(
        calls.find(c => c.method === 'POST')?.body ?? '{}'
      )
      expect(JSON.parse(body.lightColors)).toEqual(light)
    })

    it('falls back to PUT when the row already exists', async () => {
      // A 409 means a theme row is already there; the save must update it.
      const calls = mockFetch(409)
      const { result } = await ready()

      act(() => result.current.saveColors(light, dark))

      await waitFor(() => {
        expect(calls.some(c => c.method === 'PUT')).toBe(true)
      })
    })

    it('does not throw when DBAL is unreachable', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('offline')
        })
      )
      const { result } = await ready()

      expect(() => {
        act(() => result.current.saveColors(light, dark))
      }).not.toThrow()

      // The localStorage copy still applies for this browser.
      expect(localStorage.getItem('pg-theme-overrides')).not.toBeNull()
    })
  })

  describe('resetColors', () => {
    it('clears the stored theme', async () => {
      const { result } = await ready()
      act(() => result.current.saveColors(light, dark))

      act(() => result.current.resetColors())

      expect(localStorage.getItem('pg-theme-overrides')).toBeNull()
    })

    it('returns the swatches to the defaults', async () => {
      const { result } = await ready()
      await waitFor(() => expect(result.current.lightColors).toEqual(light))

      act(() => result.current.updateColor('light', '--bg', '#eee'))
      act(() => result.current.resetColors())

      expect(result.current.lightColors['--bg']).not.toBe('#eee')
    })
  })
})
