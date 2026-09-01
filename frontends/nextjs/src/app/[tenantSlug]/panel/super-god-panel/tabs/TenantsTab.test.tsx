import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const auth = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: () => auth.value,
}))
const tenantsHook = vi.hoisted(() => ({
  useTenants: vi.fn(() => ({ tenants: [], create: vi.fn(), remove: vi.fn() })),
}))
vi.mock('./use-tenants', () => tenantsHook)

import { asUser, authValue } from '@/test/auth-harness'
import { TenantsTab } from './TenantsTab'

beforeEach(() => {
  vi.clearAllMocks()
  auth.value = authValue(asUser())
  tenantsHook.useTenants.mockReturnValue({
    tenants: [],
    create: vi.fn(),
    remove: vi.fn(),
  })
})

describe('TenantsTab', () => {
  it('shows a placeholder when there are no tenants', () => {
    render(<TenantsTab />)
    expect(screen.getByText(/No tenants created yet/)).toBeTruthy()
  })

  it('lists each tenant instead of the placeholder', () => {
    tenantsHook.useTenants.mockReturnValue({
      tenants: [{ id: 't1', name: 'Acme', ownerId: 'u1', createdAt: 1 }],
      create: vi.fn(),
      remove: vi.fn(),
    })
    render(<TenantsTab />)
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(screen.queryByText(/No tenants created yet/)).toBeNull()
  })

  it('opens the create form and hides it again on cancel', () => {
    render(<TenantsTab />)
    expect(screen.queryByText('Create New Tenant')).toBeNull()

    fireEvent.click(screen.getByText('Create Tenant'))
    expect(screen.getByText('Create New Tenant')).toBeTruthy()

    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Create New Tenant')).toBeNull()
  })

  it('creates a tenant and closes the form', () => {
    const create = vi.fn()
    tenantsHook.useTenants.mockReturnValue({
      tenants: [],
      create,
      remove: vi.fn(),
    })
    render(<TenantsTab />)
    fireEvent.click(screen.getByText('Create Tenant'))
    fireEvent.change(screen.getByLabelText('Tenant Name'), {
      target: { value: 'Widgets' },
    })
    fireEvent.click(screen.getByText('Create'))

    expect(create).toHaveBeenCalled()
    expect(screen.queryByText('Create New Tenant')).toBeNull()
  })
})
