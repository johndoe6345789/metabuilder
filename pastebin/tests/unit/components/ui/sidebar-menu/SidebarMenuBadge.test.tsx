import React from 'react'
import { render, screen } from '@/test-utils'
import { SidebarMenuBadge } from '@/components/ui/sidebar-menu/SidebarMenuBadge'

describe('SidebarMenuBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render as div element', () => {
      render(
        <SidebarMenuBadge>
          5
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge.tagName).toBe('DIV')
    })

    it('should display children content', () => {
      render(
        <SidebarMenuBadge>
          New
        </SidebarMenuBadge>
      )
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should support numeric children', () => {
      render(
        <SidebarMenuBadge>
          42
        </SidebarMenuBadge>
      )
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveAttribute('data-slot', 'sidebar-menu-badge')
    })

    it('should have data-sidebar attribute', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveAttribute('data-sidebar', 'menu-badge')
    })

    it('should have data-testid attribute', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveAttribute('data-testid', 'sidebar-menu-badge')
    })

    it('should have aria-hidden attribute', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Props', () => {
    it('should accept className prop', () => {
      render(
        <SidebarMenuBadge className="custom-class">
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('custom-class')
    })

    it('should accept data attributes', () => {
      render(
        <SidebarMenuBadge data-value="test">
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveAttribute('data-value', 'test')
    })

    it('should accept title attribute', () => {
      render(
        <SidebarMenuBadge title="Unread messages">
          5
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveAttribute('title', 'Unread messages')
    })
  })

  describe('Positioning', () => {
    it('should be positioned absolutely', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('absolute')
    })

    it('should be positioned right', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('right-1')
    })
  })

  describe('Sizing', () => {
    it('should have fixed height', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('h-5')
    })

    it('should have minimum width', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('min-w-5')
    })

    it('should have horizontal padding', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('px-1')
    })
  })

  describe('Layout', () => {
    it('should have flex layout', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('flex')
    })

    it('should center items', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('items-center')
      expect(badge).toHaveClass('justify-center')
    })
  })

  describe('Styling', () => {
    it('should have rounded-md', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('rounded-md')
    })

    it('should have text-xs', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('text-xs')
    })

    it('should have font-medium', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('font-medium')
    })

    it('should have tabular-nums', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('tabular-nums')
    })

    it('should have select-none', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('select-none')
    })

    it('should have pointer-events-none', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('pointer-events-none')
    })
  })

  describe('Text Color', () => {
    it('should have text-sidebar-foreground', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('text-sidebar-foreground')
    })
  })

  describe('Hover States', () => {
    it('should change text color on peer hover', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('peer-hover/menu-button:text-sidebar-accent-foreground')
    })

    it('should change text color on peer data active', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass(
        'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground'
      )
    })
  })

  describe('Size Variants', () => {
    it('should position correctly for small button', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('peer-data-[size=sm]/menu-button:top-1')
    })

    it('should position correctly for default button', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('peer-data-[size=default]/menu-button:top-1.5')
    })

    it('should position correctly for large button', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('peer-data-[size=lg]/menu-button:top-2.5')
    })
  })

  describe('Collapsible Sidebar', () => {
    it('should be hidden when sidebar is icon-only', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('group-data-[collapsible=icon]:hidden')
    })
  })

  describe('Content Variations', () => {
    it('should display single digit', () => {
      render(
        <SidebarMenuBadge>
          1
        </SidebarMenuBadge>
      )
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should display double digit', () => {
      render(
        <SidebarMenuBadge>
          99
        </SidebarMenuBadge>
      )
      expect(screen.getByText('99')).toBeInTheDocument()
    })

    it('should display text content', () => {
      render(
        <SidebarMenuBadge>
          Pro
        </SidebarMenuBadge>
      )
      expect(screen.getByText('Pro')).toBeInTheDocument()
    })

    it('should display with dot indicator', () => {
      render(
        <SidebarMenuBadge>
          ●
        </SidebarMenuBadge>
      )
      expect(screen.getByText('●')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should be hidden from screen readers', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveAttribute('aria-hidden', 'true')
    })

    it('should not be focusable', () => {
      const { container } = render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = container.querySelector('[data-testid="sidebar-menu-badge"]')
      expect(badge).not.toHaveAttribute('tabindex')
    })

    it('should have pointer-events-none to prevent interaction', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('pointer-events-none')
    })
  })

  describe('Custom Styling', () => {
    it('should merge custom className with defaults', () => {
      render(
        <SidebarMenuBadge className="custom-bg">
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('custom-bg')
      expect(badge).toHaveClass('flex')
      expect(badge).toHaveClass('absolute')
    })

    it('should allow overriding positioning', () => {
      render(
        <SidebarMenuBadge className="left-2 top-2">
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('left-2')
      expect(badge).toHaveClass('top-2')
    })
  })

  describe('Semantic HTML', () => {
    it('should render as div not span', () => {
      render(
        <SidebarMenuBadge>
          Badge
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge.tagName).toBe('DIV')
    })

    it('should support HTML content', () => {
      render(
        <SidebarMenuBadge>
          <span>5</span>
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge.querySelector('span')).toBeInTheDocument()
    })
  })

  describe('Combination Props', () => {
    it('should work with className and title', () => {
      render(
        <SidebarMenuBadge className="custom-class" title="5 unread">
          5
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveClass('custom-class')
      expect(badge).toHaveAttribute('title', '5 unread')
    })

    it('should work with custom data attributes', () => {
      render(
        <SidebarMenuBadge data-count="5" data-type="unread">
          5
        </SidebarMenuBadge>
      )
      const badge = screen.getByTestId('sidebar-menu-badge')
      expect(badge).toHaveAttribute('data-count', '5')
      expect(badge).toHaveAttribute('data-type', 'unread')
    })
  })

  describe('Snapshot Tests', () => {
    it('should match snapshot with numeric content', () => {
      const { container } = render(
        <SidebarMenuBadge>
          5
        </SidebarMenuBadge>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with text content', () => {
      const { container } = render(
        <SidebarMenuBadge>
          New
        </SidebarMenuBadge>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with custom className', () => {
      const { container } = render(
        <SidebarMenuBadge className="custom-badge">
          Pro
        </SidebarMenuBadge>
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
