import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const nav = vi.hoisted(() => ({ pathname: '/dashboard', push: vi.fn() }))
vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: nav.push }),
}))

import { AppBarComponent } from './AppBar'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
})

const baseProps = {
  username: null,
  role: 'public',
  userLevel: 0,
  tenantId: 'acme',
  isAuthenticated: false,
  onLogout: vi.fn(),
}

describe('AppBarComponent', () => {
  it('shows a login button when signed out', () => {
    render(<AppBarComponent {...baseProps} />)
    expect(screen.getByText('Login')).toBeDefined()
  })

  it('shows the user chip and level nav once signed in', () => {
    render(
      <AppBarComponent
        {...baseProps}
        username="alice"
        role="admin"
        userLevel={2}
        isAuthenticated
      />
    )
    expect(screen.getByText('alice')).toBeDefined()
    expect(screen.getByText('Admin')).toBeDefined()
  })

  it('does not render a sidebar toggle without a handler', () => {
    render(<AppBarComponent {...baseProps} isAuthenticated />)
    expect(screen.queryByLabelText('Toggle sidebar')).toBeNull()
  })
})
