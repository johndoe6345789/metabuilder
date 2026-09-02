import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const scopeMod = vi.hoisted(() => ({ useCurrentTenantScope: vi.fn() }))
vi.mock('./use-current-tenant-scope', () => scopeMod)

import { usePageRoutesTenant } from './use-page-routes-tenant'

describe('usePageRoutesTenant', () => {
  it('starts on the current tenant', () => {
    scopeMod.useCurrentTenantScope.mockReturnValue({
      tenant: 'acme',
      canPickOtherTenant: false,
    })
    const { result } = renderHook(() => usePageRoutesTenant())
    expect(result.current.tenant).toBe('acme')
    expect(result.current.tenantInput).toBe('acme')
  })

  it('cannot switch tenant when not allowed to pick another', () => {
    scopeMod.useCurrentTenantScope.mockReturnValue({
      tenant: 'acme',
      canPickOtherTenant: false,
    })
    const { result } = renderHook(() => usePageRoutesTenant())
    act(() => result.current.setTenantInput('widgets'))
    act(() => result.current.applyTenant())
    expect(result.current.tenant).toBe('acme')
  })

  it('can switch tenant when allowed to pick another (supergod)', () => {
    scopeMod.useCurrentTenantScope.mockReturnValue({
      tenant: 'system',
      canPickOtherTenant: true,
    })
    const { result } = renderHook(() => usePageRoutesTenant())
    act(() => result.current.setTenantInput('  widgets  '))
    act(() => result.current.applyTenant())
    expect(result.current.tenant).toBe('widgets')
  })

  it('applyTenant with an explicit argument overrides the input box, when allowed', () => {
    scopeMod.useCurrentTenantScope.mockReturnValue({
      tenant: 'system',
      canPickOtherTenant: true,
    })
    const { result } = renderHook(() => usePageRoutesTenant())
    act(() => result.current.setTenantInput('ignored'))
    act(() => result.current.applyTenant('widgets'))
    expect(result.current.tenant).toBe('widgets')
  })

  it('a blank override falls back to the current tenant, when allowed', () => {
    scopeMod.useCurrentTenantScope.mockReturnValue({
      tenant: 'system',
      canPickOtherTenant: true,
    })
    const { result } = renderHook(() => usePageRoutesTenant())
    act(() => result.current.setTenantInput('   '))
    act(() => result.current.applyTenant())
    expect(result.current.tenant).toBe('system')
  })

  it('exposes canPickOtherTenant from the scope', () => {
    scopeMod.useCurrentTenantScope.mockReturnValue({
      tenant: 'acme',
      canPickOtherTenant: true,
    })
    const { result } = renderHook(() => usePageRoutesTenant())
    expect(result.current.canPickOtherTenant).toBe(true)
  })
})
