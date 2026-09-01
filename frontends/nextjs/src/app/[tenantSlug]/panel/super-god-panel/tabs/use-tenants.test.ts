import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useTenants } from './use-tenants'

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const TENANT = {
  id: 't1',
  name: 'Acme',
  ownerId: 'u1',
  createdAt: 1,
}

describe('useTenants', () => {
  it('starts empty and loads tenants on mount', async () => {
    mockFetch(
      async () =>
        ({ ok: true, json: async () => ({ data: [TENANT] }) }) as Response
    )
    const { result } = renderHook(() => useTenants('u1'))

    await waitFor(() => expect(result.current.tenants).toHaveLength(1))
    expect(result.current.tenants[0]).toEqual(TENANT)
  })

  it('leaves the list empty when the response is not ok', async () => {
    mockFetch(async () => ({ ok: false, status: 500 }) as Response)
    const { result } = renderHook(() => useTenants('u1'))

    await new Promise(r => setTimeout(r, 10))
    expect(result.current.tenants).toEqual([])
  })

  it('leaves the list empty when the fetch throws', async () => {
    mockFetch(async () => {
      throw new Error('offline')
    })
    const { result } = renderHook(() => useTenants('u1'))

    await new Promise(r => setTimeout(r, 10))
    expect(result.current.tenants).toEqual([])
  })

  it('create adds a locally-generated tenant owned by the given owner', () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    const { result } = renderHook(() => useTenants('u1'))

    act(() => result.current.create('New Co'))

    expect(result.current.tenants).toHaveLength(1)
    expect(result.current.tenants[0]).toMatchObject({
      name: 'New Co',
      ownerId: 'u1',
    })
  })

  it('create falls back to "unknown" when there is no owner', () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    const { result } = renderHook(() => useTenants(undefined))

    act(() => result.current.create('New Co'))

    expect(result.current.tenants[0].ownerId).toBe('unknown')
  })

  it('remove drops the tenant with the matching id', () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    const { result } = renderHook(() => useTenants('u1'))

    act(() => result.current.create('New Co'))
    const [added] = result.current.tenants

    act(() => result.current.remove(added.id))

    expect(result.current.tenants).toHaveLength(0)
  })
})
