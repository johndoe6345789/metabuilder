import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const nav = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }))

const navList = vi.hoisted(() => ({
  SidebarNavList: (props: {
    items: unknown[]
    itemHref: (p: string) => string
  }) => (
    <div data-testid="nav-list">
      {JSON.stringify(props.items)}|{props.itemHref('/god-panel')}|
      {props.itemHref('/dashboard')}
    </div>
  ),
}))
vi.mock('./SidebarNavList', () => navList)

const pkgs = vi.hoisted(() => ({
  SidebarPackages: (props: { navigable: { packageId: string }[] }) => (
    <div data-testid="packages">
      {props.navigable.map(p => p.packageId).join(',')}
    </div>
  ),
}))
vi.mock('./SidebarPackages', () => pkgs)

const header = vi.hoisted(() => ({
  SidebarUserHeader: (props: { username: string }) => (
    <div data-testid="header">{props.username}</div>
  ),
}))
vi.mock('./SidebarUserHeader', () => header)

import { Sidebar } from './Sidebar'
import type { PackageNavItem } from '@/lib/packages/navigation'

const pkg = (over: Partial<PackageNavItem>): PackageNavItem => ({
  packageId: 'blog',
  name: 'blog',
  navLabel: 'Blog',
  icon: 'article',
  level: 1,
  category: 'content',
  showInNav: true,
  ...over,
})

describe('Sidebar', () => {
  it('shows the signed-in username', () => {
    render(<Sidebar userLevel={3} tenantId="acme" username="alex" role="admin" />)
    expect(screen.getByTestId('header').textContent).toBe('alex')
  })

  it('resolves the /god-panel item to the tenant-scoped god panel path', () => {
    render(<Sidebar userLevel={4} tenantId="acme" username="alex" role="god" />)
    for (const el of screen.getAllByTestId('nav-list')) {
      expect(el.textContent).toContain('/acme/panel/god')
    }
  })

  it('filters packages to only those the user can navigate to', () => {
    render(
      <Sidebar
        userLevel={2}
        tenantId="acme"
        username="alex"
        role="user"
        packages={[
          pkg({ packageId: 'visible', level: 2, showInNav: true }),
          pkg({ packageId: 'too-high-level', level: 3, showInNav: true }),
          pkg({ packageId: 'hidden', level: 1, showInNav: false }),
        ]}
      />
    )
    expect(screen.getByTestId('packages').textContent).toBe('visible')
  })
})
