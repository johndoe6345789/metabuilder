import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TenantRow } from './TenantRow'
import type { Tenant } from './use-tenants'

const tenant: Tenant = {
  id: 't1',
  name: 'Acme',
  ownerId: 'u1',
  createdAt: Date.parse('2026-01-01'),
}

describe('TenantRow', () => {
  it('renders the tenant name', () => {
    render(<TenantRow tenant={tenant} onDelete={vi.fn()} />)
    expect(screen.getByText('Acme')).toBeTruthy()
  })

  it('shows no homepage badge when unconfigured', () => {
    render(<TenantRow tenant={tenant} onDelete={vi.fn()} />)
    expect(screen.queryByText('Homepage Configured')).toBeNull()
  })

  it('shows the homepage badge once one is configured', () => {
    render(
      <TenantRow
        tenant={{ ...tenant, homepageConfig: { pageId: 'p1' } }}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Homepage Configured')).toBeTruthy()
  })

  it('calls onDelete with the tenant id', () => {
    const onDelete = vi.fn()
    render(<TenantRow tenant={tenant} onDelete={onDelete} />)
    screen.getByText('Delete').click()
    expect(onDelete).toHaveBeenCalledWith('t1')
  })
})
