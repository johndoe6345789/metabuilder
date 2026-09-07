import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const nav = vi.hoisted(() => ({ useRouter: vi.fn() }))
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

import { TenantHomeFallback } from './TenantHomeFallback'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TenantHomeFallback', () => {
  it('asks the slot for this tenant home page', () => {
    nav.useRouter.mockReturnValue({ replace: vi.fn() })
    render(<TenantHomeFallback tenant="acme" />)
    expect(screen.getByTestId('slot-tenant').textContent).toBe('acme')
    expect(screen.getByTestId('slot-path').textContent).toBe('/')
  })

  it('sends a visitor to the panel when nothing is published', () => {
    const replace = vi.fn()
    nav.useRouter.mockReturnValue({ replace })
    render(<TenantHomeFallback tenant="acme" />)
    expect(replace).toHaveBeenCalledWith('/acme/panel')
  })
})
