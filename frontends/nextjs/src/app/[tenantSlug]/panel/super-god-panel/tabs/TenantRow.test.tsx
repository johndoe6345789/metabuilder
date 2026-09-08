import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TenantRow } from './TenantRow'
import type { Tenant } from './use-tenants'

const tenant: Tenant = {
  id: 'acme',
  name: 'acme',
  ownerId: 'u1',
  ownerName: 'rosa',
  members: 2,
  createdAt: Date.parse('2026-01-01'),
}

describe('TenantRow', () => {
  it('renders the tenant name', () => {
    render(<TenantRow tenant={tenant} onDelete={vi.fn()} />)
    expect(screen.getByText('acme')).toBeTruthy()
  })

  /**
   * The row used to carry a "Homepage Configured" badge off a field no
   * fetch ever populated. It says who founded the community and how many
   * accounts are in it -- both of which come from the accounts this list
   * is now built from.
   */
  it('names the founder and counts the members', () => {
    render(<TenantRow tenant={tenant} onDelete={vi.fn()} />)
    const caption = screen.getByText(/rosa/).textContent ?? ''
    expect(caption).toContain('2 members')
  })

  it('does not say "1 members"', () => {
    render(
      <TenantRow tenant={{ ...tenant, members: 1 }} onDelete={vi.fn()} />
    )
    expect(screen.getByText(/1 member(?!s)/)).toBeTruthy()
  })

  it('leaves out a date it does not have', () => {
    render(
      <TenantRow tenant={{ ...tenant, createdAt: 0 }} onDelete={vi.fn()} />
    )
    expect(screen.queryByText(/since/)).toBeNull()
  })

  it('calls onDelete with the tenant id', () => {
    const onDelete = vi.fn()
    render(<TenantRow tenant={tenant} onDelete={onDelete} />)
    screen.getByText('Delete').click()
    expect(onDelete).toHaveBeenCalledWith('acme')
  })
})
