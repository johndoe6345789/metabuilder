import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SidebarNavList } from './SidebarNavList'
import type { SidebarNavItem } from '@/lib/packages/navigation'

const item: SidebarNavItem = {
  id: 'dashboard',
  label: 'Dashboard',
  icon: 'dashboard',
  path: '/dashboard',
  level: 1,
}

const itemHref = (path: string) => `/acme/panel${path}`

describe('SidebarNavList', () => {
  it('renders each item by label', () => {
    render(<SidebarNavList items={[item]} itemHref={itemHref} pathname="/" />)
    expect(screen.getByText('Dashboard')).toBeTruthy()
  })

  it('marks an exact-match item active', () => {
    render(
      <SidebarNavList
        items={[item]}
        itemHref={itemHref}
        pathname="/acme/panel/dashboard"
      />
    )
    expect(screen.getByText('Dashboard').closest('a')?.className).toContain(
      'active'
    )
  })

  it('does not mark a nested path active without prefixMatch', () => {
    render(
      <SidebarNavList
        items={[item]}
        itemHref={itemHref}
        pathname="/acme/panel/dashboard/sub"
      />
    )
    expect(
      screen.getByText('Dashboard').closest('a')?.className
    ).not.toContain('active')
  })

  it('marks a nested path active with prefixMatch', () => {
    render(
      <SidebarNavList
        items={[item]}
        itemHref={itemHref}
        pathname="/acme/panel/dashboard/sub"
        prefixMatch
      />
    )
    expect(screen.getByText('Dashboard').closest('a')?.className).toContain(
      'active'
    )
  })

  it('calls onNavigate when a link is clicked', () => {
    const onNavigate = vi.fn()
    render(
      <SidebarNavList
        items={[item]}
        itemHref={itemHref}
        pathname="/"
        onNavigate={onNavigate}
      />
    )
    screen.getByText('Dashboard').click()
    expect(onNavigate).toHaveBeenCalledOnce()
  })
})
