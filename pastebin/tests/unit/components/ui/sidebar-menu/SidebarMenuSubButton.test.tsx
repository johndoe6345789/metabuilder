import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { SidebarMenuSubButton } from '@/components/ui/sidebar-menu/SidebarMenuSubButton'

describe('SidebarMenuSubButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render as anchor element by default', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu Item
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link.tagName).toBe('A')
    })

    it('should render as div when asChild is true', () => {
      render(
        <SidebarMenuSubButton asChild>
          Sub Menu Item
        </SidebarMenuSubButton>
      )
      const element = screen.getByTestId('sidebar-menu-sub-button')
      expect(element.tagName).toBe('DIV')
    })

    it('should display children content', () => {
      render(
        <SidebarMenuSubButton href="#">
          Test Content
        </SidebarMenuSubButton>
      )
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('data-slot', 'sidebar-menu-sub-button')
    })

    it('should have data-sidebar attribute', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('data-sidebar', 'menu-sub-button')
    })

    it('should have data-testid attribute', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('data-testid', 'sidebar-menu-sub-button')
    })
  })

  describe('Props', () => {
    it('should set isActive data attribute', () => {
      render(
        <SidebarMenuSubButton href="#" isActive={true}>
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('data-active', 'true')
    })

    it('should set size data attribute', () => {
      render(
        <SidebarMenuSubButton href="#" size="sm">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('data-size', 'sm')
    })

    it('should accept className prop', () => {
      render(
        <SidebarMenuSubButton href="#" className="custom-class">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('custom-class')
    })

    it('should accept href prop', () => {
      render(
        <SidebarMenuSubButton href="/test-path">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('href', '/test-path')
    })
  })

  describe('Sizes', () => {
    it('should render medium size by default', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('h-7')
    })

    it('should render small size', () => {
      render(
        <SidebarMenuSubButton href="#" size="sm">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('text-xs')
    })

    it('should render medium size with proper text class', () => {
      render(
        <SidebarMenuSubButton href="#" size="md">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('text-sm')
    })
  })

  describe('Active State', () => {
    it('should apply active styling when isActive is true', () => {
      render(
        <SidebarMenuSubButton href="#" isActive={true}>
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('bg-gray-300')
    })

    it('should not apply active styling when isActive is false', () => {
      render(
        <SidebarMenuSubButton href="#" isActive={false}>
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).not.toHaveClass('bg-gray-300')
    })

    it('should set aria-current when active', () => {
      render(
        <SidebarMenuSubButton href="#" isActive={true}>
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('aria-current', 'page')
    })

    it('should not set aria-current when not active', () => {
      render(
        <SidebarMenuSubButton href="#" isActive={false}>
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).not.toHaveAttribute('aria-current')
    })
  })

  describe('Styling', () => {
    it('should have flex layout', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('flex')
    })

    it('should have items center', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('items-center')
    })

    it('should have gap-2', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('gap-2')
    })

    it('should have rounded-md', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('rounded-md')
    })

    it('should have padding-x', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('px-2')
    })

    it('should have overflow hidden', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('overflow-hidden')
    })

    it('should have min-width-0', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('min-w-0')
    })

    it('should have focus-visible ring', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('focus-visible:ring-2')
    })
  })

  describe('Hover States', () => {
    it('should have hover background light', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('hover:bg-gray-200')
    })

    it('should have active background', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('active:bg-gray-300')
    })
  })

  describe('Dark Mode', () => {
    it('should have dark mode hover state', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('dark:hover:bg-gray-700')
    })

    it('should have dark mode active state', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('dark:active:bg-gray-600')
    })

    it('should have dark mode background when active', () => {
      render(
        <SidebarMenuSubButton href="#" isActive={true}>
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('dark:bg-gray-600')
    })
  })

  describe('SVG Icon Styling', () => {
    it('should style SVG icons', () => {
      render(
        <SidebarMenuSubButton href="#">
          <svg data-testid="test-icon">Icon</svg>
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('[&>svg]:w-4')
    })
  })

  describe('Content Truncation', () => {
    it('should truncate text content', () => {
      render(
        <SidebarMenuSubButton href="#">
          <span>Text</span>
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('[&>span:last-child]:truncate')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      await user.tab()
      expect(link).toHaveFocus()
    })

    it('should have proper semantic HTML', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link.tagName).toBe('A')
    })

    it('should handle disabled state with aria-disabled', () => {
      render(
        <SidebarMenuSubButton href="#" aria-disabled={true}>
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('aria-disabled', 'true')
      expect(link).toHaveClass('aria-disabled:opacity-50')
    })
  })

  describe('Collapsible Sidebar', () => {
    it('should be hidden when sidebar is icon-only', () => {
      render(
        <SidebarMenuSubButton href="#">
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('group-data-[collapsible=icon]:hidden')
    })
  })

  describe('Disabled State', () => {
    it('should have disabled pointer-events', () => {
      render(
        <SidebarMenuSubButton href="#" aria-disabled={true}>
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('aria-disabled:pointer-events-none')
    })

    it('should have disabled opacity', () => {
      render(
        <SidebarMenuSubButton href="#" aria-disabled={true}>
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveClass('aria-disabled:opacity-50')
    })
  })

  describe('Navigation', () => {
    it('should support href navigation', () => {
      render(
        <SidebarMenuSubButton href="/dashboard">
          Dashboard
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('href', '/dashboard')
    })

    it('should support external href', () => {
      render(
        <SidebarMenuSubButton href="https://example.com">
          External Link
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('href', 'https://example.com')
    })
  })

  describe('Click Handlers', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarMenuSubButton href="#" onClick={onClick}>
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      await user.click(link)
      expect(onClick).toHaveBeenCalled()
    })
  })

  describe('Combination Props', () => {
    it('should work with multiple props', () => {
      render(
        <SidebarMenuSubButton
          href="/test"
          isActive={true}
          size="sm"
          className="my-custom"
        >
          Sub Menu
        </SidebarMenuSubButton>
      )
      const link = screen.getByTestId('sidebar-menu-sub-button')
      expect(link).toHaveAttribute('data-active', 'true')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveClass('my-custom')
    })
  })

  describe('Snapshot Tests', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(
        <SidebarMenuSubButton href="#">
          Sub Menu Item
        </SidebarMenuSubButton>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with active state', () => {
      const { container } = render(
        <SidebarMenuSubButton href="#" isActive={true}>
          Sub Menu Item
        </SidebarMenuSubButton>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with small size', () => {
      const { container } = render(
        <SidebarMenuSubButton href="#" size="sm">
          Sub Menu Item
        </SidebarMenuSubButton>
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
