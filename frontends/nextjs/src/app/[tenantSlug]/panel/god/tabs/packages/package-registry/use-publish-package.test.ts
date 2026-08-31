import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePublishPackage } from './use-publish-package'
import { testPackage as pkg } from './test-fixtures'

const okResponse = (body: unknown) =>
  ({ ok: true, json: () => Promise.resolve(body) }) as Response

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePublishPackage', () => {
  it('POSTs a new package and records the returned id', async () => {
    vi.mocked(fetch).mockResolvedValue(okResponse({ data: { id: 'gp1' } }))
    const persist = vi.fn()
    const packages = [pkg()]
    const { result } = renderHook(() =>
      usePublishPackage({ packages, persist })
    )

    await act(async () => {
      expect(await result.current.publish('p1')).toBe(true)
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/system\/core\/GodPackage$/),
      expect.objectContaining({ method: 'POST' })
    )
    expect(persist).toHaveBeenCalledWith([
      { ...packages[0], publishedId: 'gp1' },
    ])
  })

  it('PUTs an already-published package without re-persisting', async () => {
    vi.mocked(fetch).mockResolvedValue(okResponse({}))
    const persist = vi.fn()
    const packages = [pkg({ publishedId: 'gp1' })]
    const { result } = renderHook(() =>
      usePublishPackage({ packages, persist })
    )

    await act(async () => {
      expect(await result.current.publish('p1')).toBe(true)
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/GodPackage\/gp1$/),
      expect.objectContaining({ method: 'PUT' })
    )
    expect(persist).not.toHaveBeenCalled()
  })
})
