import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePageRoutesTenant } from './use-page-routes-tenant'

describe('usePageRoutesTenant', () => {
  it('starts on the system tenant', () => {
    const { result } = renderHook(() => usePageRoutesTenant())
    expect(result.current.tenant).toBe('system')
    expect(result.current.tenantInput).toBe('system')
  })

  it('applyTenant with no argument trims the current input', () => {
    const { result } = renderHook(() => usePageRoutesTenant())
    act(() => result.current.setTenantInput('  Acme  '))
    act(() => result.current.applyTenant())
    expect(result.current.tenant).toBe('Acme')
  })

  it('applyTenant falls back to the system tenant for a blank input', () => {
    const { result } = renderHook(() => usePageRoutesTenant())
    act(() => result.current.setTenantInput('   '))
    act(() => result.current.applyTenant())
    expect(result.current.tenant).toBe('system')
  })

  it('applyTenant with an explicit argument overrides the input box', () => {
    const { result } = renderHook(() => usePageRoutesTenant())
    act(() => result.current.setTenantInput('ignored'))
    act(() => result.current.applyTenant('widgets'))
    expect(result.current.tenant).toBe('widgets')
  })
})
