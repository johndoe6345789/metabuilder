import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePublishPackage } from './use-publish-package'
import { testPackage as pkg } from './test-fixtures'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePublishPackage failure paths', () => {
  it('does nothing for an id that is not there', async () => {
    const persist = vi.fn()
    const { result } = renderHook(() =>
      usePublishPackage({ packages: [], persist })
    )

    await act(async () => {
      expect(await result.current.publish('missing')).toBe(false)
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('reports failure without throwing on a non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)
    const { result } = renderHook(() =>
      usePublishPackage({ packages: [pkg()], persist: vi.fn() })
    )

    await act(async () => {
      expect(await result.current.publish('p1')).toBe(false)
    })
  })

  it('reports failure rather than throwing when fetch rejects', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() =>
      usePublishPackage({ packages: [pkg()], persist: vi.fn() })
    )

    await act(async () => {
      expect(await result.current.publish('p1')).toBe(false)
    })
    expect(result.current.publishing).toBeNull()
  })
})
