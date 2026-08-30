import { describe, expect, it } from 'vitest'
import { render, renderHook, screen } from '@testing-library/react'

import { TenantProvider, useTenant, useTenantOptional } from './tenant-context'

const wrapper =
  (additionalPackages?: { id: string }[]) =>
  ({ children }: { children: React.ReactNode }) => (
    <TenantProvider
      tenant="acme"
      packageId="blog"
      additionalPackages={additionalPackages}
    >
      {children}
    </TenantProvider>
  )

describe('useTenant', () => {
  it('throws outside a provider', () => {
    expect(() => renderHook(() => useTenant())).toThrow(
      'useTenant must be used within a TenantProvider'
    )
  })

  it('exposes the tenant and package inside one', () => {
    const { result } = renderHook(() => useTenant(), { wrapper: wrapper() })
    expect(result.current.tenant).toBe('acme')
    expect(result.current.primaryPackage).toBe('blog')
  })

  it('sees a dependency package too', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: wrapper([{ id: 'auth' }]),
    })
    expect(result.current.hasPackage('auth')).toBe(true)
  })
})

describe('useTenantOptional', () => {
  it('is null outside a provider, rather than throwing', () => {
    const { result } = renderHook(() => useTenantOptional())
    expect(result.current).toBeNull()
  })

  it('is the context value inside one', () => {
    const { result } = renderHook(() => useTenantOptional(), {
      wrapper: wrapper(),
    })
    expect(result.current?.tenant).toBe('acme')
  })
})

describe('TenantProvider', () => {
  it('renders its children', () => {
    render(
      <TenantProvider tenant="acme" packageId="blog">
        <p>inside</p>
      </TenantProvider>
    )
    expect(screen.getByText('inside').textContent).toBe('inside')
  })
})
