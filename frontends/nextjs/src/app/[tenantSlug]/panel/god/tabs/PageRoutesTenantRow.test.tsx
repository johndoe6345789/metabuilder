import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageRoutesTenantRow } from './PageRoutesTenantRow'

vi.mock('@/components/tenant/TenantSelect', () => ({
  TenantSelect: () => <input aria-label="tenant" readOnly />,
}))

const baseProps = {
  tenant: 'acme',
  tenantInput: 'acme',
  setTenantInput: vi.fn(),
  applyTenant: vi.fn(),
  pageCount: 2,
  live: 2,
  draft: 0,
}

describe('PageRoutesTenantRow', () => {
  it('shows a locked tenant chip, not a picker, when not allowed to switch', () => {
    render(<PageRoutesTenantRow {...baseProps} canPickOtherTenant={false} />)
    expect(screen.queryByLabelText('tenant')).toBeNull()
    expect(screen.queryByText('Load')).toBeNull()
    expect(screen.getByText('/acme/')).toBeTruthy()
  })

  it('shows the tenant picker and Load button when allowed to switch', () => {
    render(<PageRoutesTenantRow {...baseProps} canPickOtherTenant={true} />)
    expect(screen.getByLabelText('tenant')).toBeTruthy()
    expect(screen.getByText('Load')).toBeTruthy()
  })
})
