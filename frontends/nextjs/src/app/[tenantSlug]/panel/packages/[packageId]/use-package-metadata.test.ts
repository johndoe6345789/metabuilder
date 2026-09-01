import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePackageMetadata } from './use-package-metadata'

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const META = {
  packageId: 'blog',
  name: 'Blog',
  version: '2.0.0',
  description: 'A blog package',
  dependencies: [],
  level: 2,
  category: 'content',
  icon: 'B',
}

describe('usePackageMetadata', () => {
  it('starts loading with no metadata', () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    const { result } = renderHook(() => usePackageMetadata('blog'))
    expect(result.current.loading).toBe(true)
    expect(result.current.metadata).toBeNull()
  })

  it('adopts the DBAL row when one exists', async () => {
    mockFetch(
      async () => ({ ok: true, json: async () => ({ data: META }) }) as Response
    )
    const { result } = renderHook(() => usePackageMetadata('blog'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.metadata).toEqual(META)
  })

  it('falls back to a derived placeholder when the fetch throws', async () => {
    mockFetch(async () => {
      throw new Error('offline')
    })
    const { result } = renderHook(() => usePackageMetadata('my_package'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.metadata).toEqual({
      packageId: 'my_package',
      name: 'My Package',
      version: '1.0.0',
      description: 'Package: my_package',
      dependencies: [],
      level: 2,
      category: 'general',
      icon: 'M',
    })
  })

  it('stops loading with no metadata when the response is ok but empty', async () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    const { result } = renderHook(() => usePackageMetadata('blog'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.metadata).toBeNull()
  })

  it('stops loading with no metadata when the response is not ok', async () => {
    mockFetch(async () => ({ ok: false, status: 404 }) as Response)
    const { result } = renderHook(() => usePackageMetadata('blog'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.metadata).toBeNull()
  })

  it('refetches when packageId changes', async () => {
    const fetchFn = vi.fn(
      async () => ({ ok: true, json: async () => ({ data: META }) }) as Response
    )
    mockFetch(fetchFn)
    const { rerender } = renderHook(
      ({ id }) => usePackageMetadata(id),
      { initialProps: { id: 'blog' } }
    )

    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1))

    rerender({ id: 'shop' })

    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2))
    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.stringContaining('/shop'),
      expect.anything()
    )
  })
})
