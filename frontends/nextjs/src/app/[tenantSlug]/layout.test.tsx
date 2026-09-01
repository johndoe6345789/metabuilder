import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const navigation = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))
vi.mock('next/navigation', () => navigation)

const tenantExistsMod = vi.hoisted(() => ({
  tenantExists: vi.fn(),
}))
vi.mock('@/lib/tenant/tenant-exists', () => tenantExistsMod)

vi.mock('@/app/_components/auth-provider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}))
vi.mock('@/components/workspace/TenantStyleSheet', () => ({
  TenantStyleSheet: ({ tenant }: { tenant: string }) => (
    <div data-testid="stylesheet" data-tenant={tenant} />
  ),
}))

import TenantRootLayout from './layout'

const params = (tenantSlug?: string) => Promise.resolve({ tenantSlug })

describe('TenantRootLayout', () => {
  it('renders children under AuthProvider when the tenant exists', async () => {
    tenantExistsMod.tenantExists.mockResolvedValue(true)

    const element = await TenantRootLayout({
      children: <div>tenant page</div>,
      params: params('acme'),
    })
    render(element)

    expect(screen.getByTestId('auth-provider')).toBeTruthy()
    expect(screen.getByText('tenant page')).toBeTruthy()
    const sheet = screen.getByTestId('stylesheet')
    expect(sheet.getAttribute('data-tenant')).toBe('acme')
  })

  it('normalizes a missing tenant slug to the default tenant', async () => {
    tenantExistsMod.tenantExists.mockResolvedValue(true)

    const element = await TenantRootLayout({
      children: <div>tenant page</div>,
      params: params(undefined),
    })

    expect(tenantExistsMod.tenantExists).toHaveBeenCalledWith(
      expect.any(String),
      'system'
    )
    render(element)
    expect(screen.getByTestId('stylesheet').getAttribute('data-tenant')).toBe(
      'system'
    )
  })

  it('calls notFound when the tenant does not exist', async () => {
    tenantExistsMod.tenantExists.mockResolvedValue(false)

    await expect(
      TenantRootLayout({
        children: <div>tenant page</div>,
        params: params('ghost'),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
