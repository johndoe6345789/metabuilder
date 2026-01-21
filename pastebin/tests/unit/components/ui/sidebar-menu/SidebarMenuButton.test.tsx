import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { SidebarMenuButton } from '@/components/ui/sidebar-menu/SidebarMenuButton'

// Mock the sidebar context
jest.mock('@/components/ui/sidebar-context', () => ({
  useSidebar: jest.fn(() => ({
    isMobile: false,
    state: 'expanded',
  })),
}))

// Mock tooltip components
jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
  TooltipContent: ({ children, hidden, ...props }: any) => (
    <div
      data-testid="tooltip-content"
      data-hidden={hidden}
      {...props}
    >
      {children}
    </div>
  ),
}))

describe('SidebarMenuButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render as button by default', () => {
      render(
        <SidebarMenuButton>
          Menu Item
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button.tagName).toBe('BUTTON')
    })

    it('should render as div when asChild is true', () => {
      render(
        <SidebarMenuButton asChild>
          Menu Item
        </SidebarMenuButton>
      )
      const element = screen.getByTestId('sidebar-menu-button')
      expect(element.tagName).toBe('DIV')
    })

    it('should display children content', () => {
      render(<SidebarMenuButton>Test Content</SidebarMenuButton>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveAttribute('data-slot', 'sidebar-menu-button')
    })

    it('should have data-sidebar attribute', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveAttribute('data-sidebar', 'menu-button')
    })

    it('should have data-testid attribute', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveAttribute('data-testid', 'sidebar-menu-button')
    })
  })

  describe('Props', () => {
    it('should set isActive data attribute', () => {
      render(
        <SidebarMenuButton isActive={true}>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveAttribute('data-active', 'true')
    })

    it('should apply outline variant classes', () => {
      render(
        <SidebarMenuButton variant="outline">
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('border')
    })

    it('should set size data attribute', () => {
      render(
        <SidebarMenuButton size="lg">
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveAttribute('data-size', 'lg')
    })

    it('should accept className prop', () => {
      render(
        <SidebarMenuButton className="custom-class">
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      render(
        <SidebarMenuButton variant="default">
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('hover:bg-gray-200')
    })

    it('should render outline variant', () => {
      render(
        <SidebarMenuButton variant="outline">
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('border')
    })
  })

  describe('Sizes', () => {
    it('should render default size', () => {
      render(
        <SidebarMenuButton size="default">
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('h-8')
    })

    it('should render small size', () => {
      render(
        <SidebarMenuButton size="sm">
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('h-7')
    })

    it('should render large size', () => {
      render(
        <SidebarMenuButton size="lg">
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('h-12')
    })
  })

  describe('Active State', () => {
    it('should apply active styling when isActive is true', () => {
      render(
        <SidebarMenuButton isActive={true}>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('bg-blue-600')
    })

    it('should not apply active styling when isActive is false', () => {
      render(
        <SidebarMenuButton isActive={false}>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).not.toHaveClass('bg-blue-600')
    })

    it('should set aria-pressed based on isActive', () => {
      render(
        <SidebarMenuButton isActive={true}>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Tooltip', () => {
    it('should not render tooltip when tooltip prop is not provided', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it('should render tooltip with string content', () => {
      render(
        <SidebarMenuButton tooltip="Help text">
          Menu
        </SidebarMenuButton>
      )
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByText('Help text')).toBeInTheDocument()
    })

    it('should render tooltip with object content', () => {
      render(
        <SidebarMenuButton tooltip={{ children: 'Help text' }}>
          Menu
        </SidebarMenuButton>
      )
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByText('Help text')).toBeInTheDocument()
    })

    it('should hide tooltip on mobile', () => {
      const { useSidebar } = require('@/components/ui/sidebar-context')
      useSidebar.mockReturnValue({
        isMobile: true,
        state: 'expanded',
      })

      render(
        <SidebarMenuButton tooltip="Help text">
          Menu
        </SidebarMenuButton>
      )
      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent).toHaveAttribute('data-hidden', 'true')
    })

    it('should hide tooltip when sidebar is expanded', () => {
      const { useSidebar } = require('@/components/ui/sidebar-context')
      useSidebar.mockReturnValue({
        isMobile: false,
        state: 'expanded',
      })

      render(
        <SidebarMenuButton tooltip="Help text">
          Menu
        </SidebarMenuButton>
      )
      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent).toHaveAttribute('data-hidden', 'true')
    })

    it('should show tooltip when sidebar is collapsed', () => {
      const { useSidebar } = require('@/components/ui/sidebar-context')
      useSidebar.mockReturnValue({
        isMobile: false,
        state: 'collapsed',
      })

      render(
        <SidebarMenuButton tooltip="Help text">
          Menu
        </SidebarMenuButton>
      )
      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent).toHaveAttribute('data-hidden', 'false')
    })
  })

  describe('Accessibility', () => {
    it('should have focus-visible ring', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('focus-visible:ring-2')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarMenuButton onClick={onClick}>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      await user.tab()
      expect(button).toHaveFocus()
    })

    it('should handle Enter key', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarMenuButton onClick={onClick}>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      await user.tab()
      await user.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalled()
    })

    it('should handle Space key', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarMenuButton onClick={onClick}>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      await user.tab()
      await user.keyboard(' ')
      expect(onClick).toHaveBeenCalled()
    })

    it('should be disabled when disabled prop is true', () => {
      render(
        <SidebarMenuButton disabled>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button') as HTMLButtonElement
      expect(button.disabled).toBe(true)
    })

    it('should have disabled opacity class', () => {
      render(
        <SidebarMenuButton disabled>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('disabled:opacity-50')
    })
  })

  describe('Click Handlers', () => {
    it('should call onClick handler', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarMenuButton onClick={onClick}>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      await user.click(button)
      expect(onClick).toHaveBeenCalled()
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarMenuButton onClick={onClick} disabled>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      await user.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('should have flex layout', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('flex')
    })

    it('should have width full', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('w-full')
    })

    it('should have items center', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('items-center')
    })

    it('should have text left alignment', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('text-left')
    })

    it('should have rounded styling', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('rounded-md')
    })

    it('should have padding', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('p-2')
    })

    it('should have transition', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('transition-[width,height,padding]')
    })

    it('should have overflow hidden', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('overflow-hidden')
    })
  })

  describe('SVG Icon Styling', () => {
    it('should style SVG icons', () => {
      render(
        <SidebarMenuButton>
          <svg data-testid="test-icon">Test</svg>
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('[&>svg]:w-4')
    })
  })

  describe('Content Truncation', () => {
    it('should truncate text content', () => {
      render(
        <SidebarMenuButton>
          <span>Text</span>
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('[&>span:last-child]:truncate')
    })
  })

  describe('Dark Mode', () => {
    it('should have dark mode hover state', () => {
      render(<SidebarMenuButton>Menu</SidebarMenuButton>)
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('dark:hover:bg-gray-700')
    })

    it('should have dark mode active state', () => {
      render(
        <SidebarMenuButton isActive={true}>
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveClass('dark:bg-blue-500')
    })
  })

  describe('Combination Props', () => {
    it('should work with multiple props', () => {
      render(
        <SidebarMenuButton
          isActive={true}
          variant="outline"
          size="lg"
          className="my-custom"
        >
          Menu
        </SidebarMenuButton>
      )
      const button = screen.getByTestId('sidebar-menu-button')
      expect(button).toHaveAttribute('data-active', 'true')
      expect(button).toHaveAttribute('data-size', 'lg')
      expect(button).toHaveClass('my-custom')
    })
  })

  describe('Snapshot Tests', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(
        <SidebarMenuButton>Menu Item</SidebarMenuButton>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with active state', () => {
      const { container } = render(
        <SidebarMenuButton isActive={true}>
          Menu Item
        </SidebarMenuButton>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with tooltip', () => {
      const { container } = render(
        <SidebarMenuButton tooltip="Help">
          Menu Item
        </SidebarMenuButton>
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
