import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuickActions } from './QuickActions'
import type { QuickAction } from './quick-actions'

const actions: QuickAction[] = [
  {
    href: '/profile',
    icon: '👤',
    title: 'Profile',
    desc: 'Edit your profile information',
    minLevel: 1,
  },
  {
    href: '/admin',
    icon: '🛡️',
    title: 'Admin Panel',
    desc: 'Manage users and data',
    minLevel: 3,
  },
]

describe('QuickActions', () => {
  it('renders the section title', () => {
    render(<QuickActions actions={actions} />)
    expect(screen.getByText('Quick Actions')).toBeTruthy()
  })

  it('renders a tile per action with title, description and icon', () => {
    render(<QuickActions actions={actions} />)
    expect(screen.getByText('Profile')).toBeTruthy()
    expect(screen.getByText('Edit your profile information')).toBeTruthy()
    expect(screen.getByText('Admin Panel')).toBeTruthy()
    expect(screen.getByText('Manage users and data')).toBeTruthy()
  })

  it('links each tile to its href', () => {
    render(<QuickActions actions={actions} />)
    expect(
      screen.getByText('Profile').closest('a')?.getAttribute('href')
    ).toBe('/profile')
    expect(
      screen.getByText('Admin Panel').closest('a')?.getAttribute('href')
    ).toBe('/admin')
  })

  it('renders nothing but the title when there are no actions', () => {
    render(<QuickActions actions={[]} />)
    expect(screen.getByText('Quick Actions')).toBeTruthy()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
