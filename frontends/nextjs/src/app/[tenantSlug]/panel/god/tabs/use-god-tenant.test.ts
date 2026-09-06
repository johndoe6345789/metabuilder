import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const auth = vi.hoisted(() => ({
  useAuthContext: vi.fn(() => ({
    user: { tenantId: 'kestrelbindery' },
    isLoading: false,
  })),
}))
const dispatched = vi.hoisted(() => ({ actions: [] as string[] }))

vi.mock('@/app/_components/auth-provider/auth-provider-component', () => auth)
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (a: { type: string }) =>
    dispatched.actions.push(a.type),
}))
vi.mock('@/store/slices/god-slice', () => ({
  resetTenantOwned: () => ({ type: 'resetTenantOwned' }),
}))

import { TREE_TENANT_KEY } from './builder/tree-tenant'
import { useGodTenant } from './use-god-tenant'

beforeEach(() => {
  dispatched.actions = []
  window.localStorage.clear()
  auth.useAuthContext.mockReturnValue({
    user: { tenantId: 'kestrelbindery' },
    isLoading: false,
  })
})

describe('useGodTenant', () => {
  it('calls a draft left by another tenant foreign', () => {
    window.localStorage.setItem(TREE_TENANT_KEY, 'harbour_cycle_works')

    const { result } = renderHook(() => useGodTenant())

    expect(result.current.foreign).toBe(true)
    expect(dispatched.actions).toContain('resetTenantOwned')
  })

  it('leaves this tenant its own draft', () => {
    window.localStorage.setItem(TREE_TENANT_KEY, 'kestrelbindery')

    const { result } = renderHook(() => useGodTenant())

    expect(result.current.foreign).toBe(false)
    expect(dispatched.actions).not.toContain('resetTenantOwned')
  })

  // Every install predating the marker has an unmarked draft; blanking it
  // would destroy real work to close a window that writing the marker on
  // this same mount already closes.
  it('treats an unmarked draft as ours, and marks it', () => {
    const { result } = renderHook(() => useGodTenant())

    expect(result.current.foreign).toBe(false)
    expect(window.localStorage.getItem(TREE_TENANT_KEY)).toBe('kestrelbindery')
  })

  // normalizeTenantId(undefined) answers "system", so acting before auth
  // lands would blank a real draft on every page load.
  it('does nothing while auth is still resolving', () => {
    window.localStorage.setItem(TREE_TENANT_KEY, 'harbour_cycle_works')
    auth.useAuthContext.mockReturnValue({ user: null, isLoading: true })

    const { result } = renderHook(() => useGodTenant())

    expect(result.current.foreign).toBe(false)
    expect(dispatched.actions).toEqual([])
    expect(window.localStorage.getItem(TREE_TENANT_KEY)).toBe(
      'harbour_cycle_works'
    )
  })
})
