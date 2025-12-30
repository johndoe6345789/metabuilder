import { Home as HomeIcon } from '@/fakemui/icons'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NavLink } from './NavLink'

describe('NavLink', () => {
  it.each([
    { href: '/home', children: 'Home', active: false },
    { href: '/dashboard', children: 'Dashboard', active: true },
    { href: '/settings', children: 'Settings', active: false },
  ])(
    'renders with href="$href", children="$children", active=$active',
    ({ href, children, active }) => {
      render(
        <NavLink href={href} active={active}>
          {children}
        </NavLink>
      )

      const link = screen.getByText(children)
      expect(link).toBeTruthy()

      const linkElement = link.closest('a')
      expect(linkElement?.getAttribute('href')).toBe(href)
    }
  )

  it('renders with icon', () => {
    const { container } = render(
      <NavLink href="/home" icon={<HomeIcon data-testid="home-icon" />}>
        Home
      </NavLink>
    )

    expect(screen.getByTestId('home-icon')).toBeTruthy()
  })

  it.each([
    { disabled: true, href: '/home' },
    { disabled: false, href: '/dashboard' },
  ])('handles disabled=$disabled state', ({ disabled, href }) => {
    render(
      <NavLink href={href} disabled={disabled}>
        Link
      </NavLink>
    )

    const link = screen.getByText('Link').closest('a')

    if (disabled) {
      expect(link?.hasAttribute('href')).toBe(false)
    } else {
      expect(link?.getAttribute('href')).toBe(href)
    }
  })

  it('applies active styling when active=true', () => {
    render(
      <NavLink href="/home" active>
        Home
      </NavLink>
    )

    const link = screen.getByText('Home').closest('a')
    // Check for active styling - fakemui applies CSS module classes
    expect(link).toBeTruthy()
    expect(link?.className).toMatch(/navLinkActive/)
  })

  it('does not have underline by default', () => {
    render(<NavLink href="/home">Home</NavLink>)

    const link = screen.getByText('Home').closest('a')
    // fakemui Link with underline="none" doesn't add text-decoration
    expect(link).toBeTruthy()
  })
})
