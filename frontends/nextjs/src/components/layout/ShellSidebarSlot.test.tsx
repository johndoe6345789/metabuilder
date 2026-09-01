import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

import { ShellSidebarSlot } from './ShellSidebarSlot'
import type { AppShellState } from './use-app-shell'

const shell = (over: Partial<AppShellState>): AppShellState =>
  ({
    showSidebar: true,
    toggleSidebar: vi.fn(),
    userLevel: 1,
    tenantId: 'acme',
    username: 'alex',
    role: 'user',
    packages: [],
    navigate: vi.fn(),
    ...over,
  }) as unknown as AppShellState

describe('ShellSidebarSlot', () => {
  it('renders nothing when the sidebar is not shown', () => {
    const { container } = render(
      <ShellSidebarSlot shell={shell({ showSidebar: false })} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the backdrop and sidebar when shown', () => {
    render(<ShellSidebarSlot shell={shell({})} />)
    expect(screen.getByLabelText('Close sidebar')).toBeTruthy()
    expect(screen.getByText('alex')).toBeTruthy()
  })

  it('calls toggleSidebar when the backdrop is clicked', () => {
    const toggleSidebar = vi.fn()
    render(<ShellSidebarSlot shell={shell({ toggleSidebar })} />)
    fireEvent.click(screen.getByLabelText('Close sidebar'))
    expect(toggleSidebar).toHaveBeenCalledOnce()
  })
})
