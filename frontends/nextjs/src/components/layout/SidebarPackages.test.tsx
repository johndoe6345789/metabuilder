import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SidebarPackages } from './SidebarPackages'
import type { PackageNavItem } from '@/lib/packages/navigation'

const pkg: PackageNavItem = {
  packageId: 'blog',
  name: 'blog',
  navLabel: 'Blog',
  icon: 'article',
  level: 2,
  category: 'content',
  showInNav: true,
}

describe('SidebarPackages', () => {
  it('renders nothing with no navigable packages', () => {
    const { container } = render(
      <SidebarPackages navigable={[]} tenantId="acme" pathname="/" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders a link per navigable package with its level badge', () => {
    render(
      <SidebarPackages navigable={[pkg]} tenantId="acme" pathname="/" />
    )
    expect(screen.getByText('Blog')).toBeTruthy()
    expect(screen.getByText('L2')).toBeTruthy()
  })

  it('marks the link active when the pathname matches exactly', () => {
    render(
      <SidebarPackages
        navigable={[pkg]}
        tenantId="acme"
        pathname="/acme/panel/packages/blog"
      />
    )
    expect(screen.getByText('Blog').closest('a')?.className).toContain(
      'active'
    )
  })

  it('marks the link active for a nested path under it', () => {
    render(
      <SidebarPackages
        navigable={[pkg]}
        tenantId="acme"
        pathname="/acme/panel/packages/blog/posts/1"
      />
    )
    expect(screen.getByText('Blog').closest('a')?.className).toContain(
      'active'
    )
  })

  it('does not mark the link active for an unrelated path', () => {
    render(
      <SidebarPackages navigable={[pkg]} tenantId="acme" pathname="/other" />
    )
    expect(screen.getByText('Blog').closest('a')?.className).not.toContain(
      'active'
    )
  })

  it('calls onNavigate when the link is clicked', () => {
    const onNavigate = vi.fn()
    render(
      <SidebarPackages
        navigable={[pkg]}
        tenantId="acme"
        pathname="/"
        onNavigate={onNavigate}
      />
    )
    screen.getByText('Blog').click()
    expect(onNavigate).toHaveBeenCalledOnce()
  })
})
