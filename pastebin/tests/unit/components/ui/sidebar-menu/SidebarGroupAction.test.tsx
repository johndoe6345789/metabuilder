import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { SidebarGroupAction } from '@/components/ui/sidebar-menu/SidebarGroupAction'

describe('SidebarGroupAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render as button by default', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button.tagName).toBe('BUTTON')
    })

    it('should render as div when asChild is true', () => {
      render(
        <SidebarGroupAction asChild>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const element = screen.getByTestId('sidebar-group-action')
      expect(element.tagName).toBe('DIV')
    })

    it('should display children content', () => {
      render(
        <SidebarGroupAction>
          <span>Test Content</span>
        </SidebarGroupAction>
      )
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveAttribute('data-slot', 'sidebar-group-action')
    })

    it('should have data-sidebar attribute', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveAttribute('data-sidebar', 'group-action')
    })

    it('should have data-testid attribute', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveAttribute('data-testid', 'sidebar-group-action')
    })
  })

  describe('Props', () => {
    it('should accept className prop', () => {
      render(
        <SidebarGroupAction className="custom-class">
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('custom-class')
    })

    it('should accept standard button props', () => {
      const onClick = jest.fn()
      render(
        <SidebarGroupAction onClick={onClick}>
          <span>Action</span>
        </SidebarGroupAction>
      )
      expect(screen.getByTestId('sidebar-group-action')).toBeInTheDocument()
    })

    it('should accept aria attributes', () => {
      render(
        <SidebarGroupAction aria-label="Group actions">
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveAttribute('aria-label', 'Group actions')
    })
  })

  describe('Positioning', () => {
    it('should be positioned absolutely', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('absolute')
    })

    it('should be positioned top right', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('top-3.5')
      expect(button).toHaveClass('right-3')
    })
  })

  describe('Sizing', () => {
    it('should have fixed width', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('w-5')
    })

    it('should have fixed height', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('h-5')
    })

    it('should have no padding', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('p-0')
    })
  })

  describe('Layout', () => {
    it('should have flex layout', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('flex')
    })

    it('should center items', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('items-center')
      expect(button).toHaveClass('justify-center')
    })
  })

  describe('Styling', () => {
    it('should have rounded-md', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('rounded-md')
    })

    it('should have transition-transform', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('transition-transform')
    })
  })

  describe('Hover States', () => {
    it('should have hover background light', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('hover:bg-gray-200')
    })

    it('should have dark mode hover state', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('dark:hover:bg-gray-700')
    })
  })

  describe('SVG Icon Styling', () => {
    it('should style SVG icons', () => {
      render(
        <SidebarGroupAction>
          <svg data-testid="test-icon">Icon</svg>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('[&>svg]:w-4')
      expect(button).toHaveClass('[&>svg]:h-4')
    })
  })

  describe('Accessibility', () => {
    it('should have focus-visible ring', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('focus-visible:ring-2')
    })

    it('should have focus-visible ring offset', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('focus-visible:ring-offset-2')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      await user.tab()
      expect(button).toHaveFocus()
    })

    it('should handle Enter key', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarGroupAction onClick={onClick}>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      await user.tab()
      await user.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalled()
    })

    it('should handle Space key', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarGroupAction onClick={onClick}>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      await user.tab()
      await user.keyboard(' ')
      expect(onClick).toHaveBeenCalled()
    })
  })

  describe('Click Handlers', () => {
    it('should call onClick handler', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarGroupAction onClick={onClick}>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      await user.click(button)
      expect(onClick).toHaveBeenCalled()
    })

    it('should pass event to onClick handler', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarGroupAction onClick={onClick}>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      await user.click(button)
      expect(onClick).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('Collapsible Sidebar', () => {
    it('should be hidden when sidebar is icon-only', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('group-data-[collapsible=icon]:hidden')
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <SidebarGroupAction disabled>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action') as HTMLButtonElement
      expect(button.disabled).toBe(true)
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarGroupAction onClick={onClick} disabled>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      await user.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('Icon Support', () => {
    it('should render with icon children', () => {
      render(
        <SidebarGroupAction>
          <svg data-testid="icon-svg">Icon</svg>
        </SidebarGroupAction>
      )
      expect(screen.getByTestId('icon-svg')).toBeInTheDocument()
    })

    it('should shrink SVG icons', () => {
      render(
        <SidebarGroupAction>
          <svg data-testid="test-icon">Icon</svg>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('[&>svg]:shrink-0')
    })
  })

  describe('Custom Props', () => {
    it('should accept title attribute', () => {
      render(
        <SidebarGroupAction title="More options">
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveAttribute('title', 'More options')
    })

    it('should accept data attributes', () => {
      render(
        <SidebarGroupAction data-custom="value">
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveAttribute('data-custom', 'value')
    })
  })

  describe('Combination Props', () => {
    it('should work with className and onClick', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(
        <SidebarGroupAction onClick={onClick} className="custom-class">
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button).toHaveClass('custom-class')
      await user.click(button)
      expect(onClick).toHaveBeenCalled()
    })

    it('should work with asChild and className', () => {
      render(
        <SidebarGroupAction asChild className="custom-class">
          <div>Action</div>
        </SidebarGroupAction>
      )
      const element = screen.getByTestId('sidebar-group-action')
      expect(element.tagName).toBe('DIV')
      expect(element).toHaveClass('custom-class')
    })
  })

  describe('Button Type', () => {
    it('should be button element', () => {
      render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = screen.getByTestId('sidebar-group-action')
      expect(button.tagName).toBe('BUTTON')
    })

    it('should accept type attribute', () => {
      const { container } = render(
        <SidebarGroupAction type="submit">
          <span>Action</span>
        </SidebarGroupAction>
      )
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('type')
    })
  })

  describe('Snapshot Tests', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(
        <SidebarGroupAction>
          <span>Action</span>
        </SidebarGroupAction>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with custom className', () => {
      const { container } = render(
        <SidebarGroupAction className="custom-action">
          <span>Action</span>
        </SidebarGroupAction>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with SVG icon', () => {
      const { container } = render(
        <SidebarGroupAction>
          <svg>Icon</svg>
        </SidebarGroupAction>
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
