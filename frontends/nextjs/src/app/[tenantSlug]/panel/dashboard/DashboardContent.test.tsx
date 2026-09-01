import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const authContext = vi.hoisted(() => ({
  useAuthContext: vi.fn(() => ({
    user: {
      username: 'alice',
      email: 'alice@example.com',
      role: 'user',
      bio: null,
      tenantId: 'acme',
    },
  })),
}))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => authContext)

const workspaceSlot = vi.hoisted(() => ({
  WorkspacePageSlot: vi.fn(
    ({ children }: { path: string; children: ReactNode }) => (
      <div data-testid="workspace-slot">{children}</div>
    )
  ),
}))
vi.mock('@/components/workspace/WorkspacePageSlot', () => workspaceSlot)

import { DashboardContent } from './DashboardContent'

describe('DashboardContent', () => {
  it('renders the profile card for the signed-in user', () => {
    render(<DashboardContent />)
    expect(screen.getByText('alice')).toBeTruthy()
    expect(screen.getByText('alice@example.com')).toBeTruthy()
  })

  it('shows only the quick actions unlocked at the user level', () => {
    render(<DashboardContent />)
    expect(screen.getByText('Profile')).toBeTruthy()
    expect(screen.getByText('Comments')).toBeTruthy()
    expect(screen.queryByText('Admin Panel')).toBeNull()
    expect(screen.queryByText('God Panel')).toBeNull()
  })

  it('renders the community workspace slot below level 3', () => {
    render(<DashboardContent />)
    expect(screen.getByTestId('workspace-slot')).toBeTruthy()
    expect(screen.getByText('Welcome')).toBeTruthy()
    expect(screen.queryByText('Five Levels of Power')).toBeNull()
  })

  it('renders the levels grid and admin actions for admins', () => {
    authContext.useAuthContext.mockReturnValueOnce({
      user: {
        username: 'admin-alice',
        email: 'admin@example.com',
        role: 'admin',
        bio: null,
        tenantId: 'acme',
      },
    })
    render(<DashboardContent />)
    expect(screen.getByText('Five Levels of Power')).toBeTruthy()
    expect(screen.getAllByText('Admin Panel')).toHaveLength(2)
    expect(screen.queryByTestId('workspace-slot')).toBeNull()
  })

  it('falls back to a generic username when none is set', () => {
    authContext.useAuthContext.mockReturnValueOnce({
      user: { email: '', role: 'user', bio: null },
    })
    render(<DashboardContent />)
    expect(screen.getByText('User')).toBeTruthy()
  })
})
