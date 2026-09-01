import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const nav = vi.hoisted(() => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}))
vi.mock('next/navigation', () => nav)

vi.mock('@/components/workspace/WorkspacePageSlot', () => ({
  WorkspacePageSlot: (props: {
    tenant: string
    path: string
    children: React.ReactNode
  }) => (
    <div data-testid="slot">
      <span data-testid="slot-tenant">{props.tenant}</span>
      <span data-testid="slot-path">{props.path}</span>
      {props.children}
    </div>
  ),
}))

import TenantHomePage from './page'

describe('TenantHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes the tenant slug from the URL params into the slot', () => {
    nav.useParams.mockReturnValue({ tenantSlug: 'acme' })
    nav.useRouter.mockReturnValue({ replace: vi.fn() })
    render(<TenantHomePage />)
    expect(screen.getByTestId('slot-tenant').textContent).toBe('acme')
    expect(screen.getByTestId('slot-path').textContent).toBe('/')
  })

  it('falls back to the default tenant id when tenantSlug is missing', () => {
    nav.useParams.mockReturnValue({})
    nav.useRouter.mockReturnValue({ replace: vi.fn() })
    render(<TenantHomePage />)
    expect(screen.getByTestId('slot-tenant').textContent).toBe('system')
  })

  it('sends a signed-in visitor to that tenant panel on mount', () => {
    const replace = vi.fn()
    nav.useParams.mockReturnValue({ tenantSlug: 'acme' })
    nav.useRouter.mockReturnValue({ replace })
    render(<TenantHomePage />)
    expect(replace).toHaveBeenCalledWith('/acme/panel')
  })

  it('routes a slug containing a slash through normalization first', () => {
    const replace = vi.fn()
    nav.useParams.mockReturnValue({ tenantSlug: 'acme/sub' })
    nav.useRouter.mockReturnValue({ replace })
    render(<TenantHomePage />)
    expect(screen.getByTestId('slot-tenant').textContent).toBe('acme-sub')
    expect(replace).toHaveBeenCalledWith('/acme-sub/panel')
  })
})
