import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const nav = vi.hoisted(() => ({ useParams: vi.fn() }))
vi.mock('next/navigation', () => nav)

const authMod = vi.hoisted(() => ({ useAuthContext: vi.fn() }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: authMod.useAuthContext,
}))

import { useCurrentTenantScope } from './use-current-tenant-scope'

describe('useCurrentTenantScope', () => {
  it('uses the tenant from the URL', () => {
    nav.useParams.mockReturnValue({ tenantSlug: 'acme' })
    authMod.useAuthContext.mockReturnValue({ user: { role: 'god' } })
    const { result } = renderHook(() => useCurrentTenantScope())
    expect(result.current.tenant).toBe('acme')
  })

  it('is not allowed to pick another tenant when god', () => {
    nav.useParams.mockReturnValue({ tenantSlug: 'acme' })
    authMod.useAuthContext.mockReturnValue({ user: { role: 'god' } })
    const { result } = renderHook(() => useCurrentTenantScope())
    expect(result.current.canPickOtherTenant).toBe(false)
  })

  it('is allowed to pick another tenant when supergod', () => {
    nav.useParams.mockReturnValue({ tenantSlug: 'acme' })
    authMod.useAuthContext.mockReturnValue({ user: { role: 'supergod' } })
    const { result } = renderHook(() => useCurrentTenantScope())
    expect(result.current.canPickOtherTenant).toBe(true)
  })

  it('falls back to the user\'s own tenantId with no URL param', () => {
    nav.useParams.mockReturnValue({})
    authMod.useAuthContext.mockReturnValue({
      user: { role: 'god', tenantId: 'widgets' },
    })
    const { result } = renderHook(() => useCurrentTenantScope())
    expect(result.current.tenant).toBe('widgets')
  })

  it('falls back to the system tenant with no param, no user, and no tenantId', () => {
    nav.useParams.mockReturnValue({})
    authMod.useAuthContext.mockReturnValue({ user: null })
    const { result } = renderHook(() => useCurrentTenantScope())
    expect(result.current.tenant).toBe('system')
  })
})
