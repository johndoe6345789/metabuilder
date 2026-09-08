import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useTenants } from './use-tenants'

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * There is no Tenant entity to list. This asked `/system/core/tenant`,
 * read the 404 as "no tenants", and left the instance owner looking at an
 * empty list for the whole life of the panel. Communities are worked out
 * from who has an account, the rule the rest of the app applies.
 */
const users = [
  {
    id: 'u1',
    username: 'rosa',
    role: 'god',
    tenantId: 'acme',
    createdAt: 1751500000,
  },
  {
    id: 'u2',
    username: 'sam',
    role: 'user',
    tenantId: 'acme',
    createdAt: 1751600000,
  },
]

describe('useTenants', () => {
  it('lists a community per set of accounts, with its founder', async () => {
    mockFetch(
      async () =>
        ({
          ok: true,
          json: async () => ({ data: { data: users } }),
        }) as Response
    )
    const { result } = renderHook(() => useTenants('u1'))

    await waitFor(() => expect(result.current.tenants).toHaveLength(1))
    expect(result.current.tenants[0]).toMatchObject({
      id: 'acme',
      ownerName: 'rosa',
      members: 2,
    })
  })

  it('asks for the entity that exists, not a Tenant table', async () => {
    const fn = vi.fn(
      async () =>
        ({ ok: true, json: async () => ({ data: { data: [] } }) }) as Response
    )
    vi.stubGlobal('fetch', fn)

    renderHook(() => useTenants('u1'))
    await new Promise(r => setTimeout(r, 10))

    const asked = String(fn.mock.calls[0]?.[0])
    expect(asked).toContain('/system/core/User')
    expect(asked).not.toContain('/tenant')
  })

  // An empty list and an unreadable one look identical on screen, and
  // this is the instance owner's only view of what exists.
  it('says when it could not read the list at all', async () => {
    mockFetch(async () => ({ ok: false, status: 500 }) as Response)
    const { result } = renderHook(() => useTenants('u1'))

    await waitFor(() => expect(result.current.unreachable).toBe(true))
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

  it('create shows a community that does not exist yet', () => {
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
