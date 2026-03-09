
import { render, screen, fireEvent } from '@/test-utils'
import { SnippetCardActions } from '@/components/features/snippet-display/SnippetCardActions'
import { Namespace } from '@/lib/types'

describe('SnippetCardActions', () => {
  const mockNamespaces: Namespace[] = [
    { id: 'ns-1', name: 'Archive', isDefault: false, createdAt: Date.now() },
    { id: 'ns-2', name: 'Favorites', isDefault: false, createdAt: Date.now() },
    { id: 'ns-3', name: 'Shared', isDefault: false, createdAt: Date.now() },
  ]

  const defaultProps = {
    isCopied: false,
    isMoving: false,
    availableNamespaces: mockNamespaces,
    onView: jest.fn(),
    onCopy: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onMoveToNamespace: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render actions container', () => {
      render(<SnippetCardActions {...defaultProps} />)
      expect(screen.getByTestId('snippet-card-actions')).toBeInTheDocument()
    })

    it('should render view button', () => {
      render(<SnippetCardActions {...defaultProps} />)
      expect(screen.getByTestId('snippet-card-view-btn')).toBeInTheDocument()
    })

    it('should render copy button', () => {
      render(<SnippetCardActions {...defaultProps} />)
      expect(screen.getByTestId('snippet-card-copy-btn')).toBeInTheDocument()
    })

    it('should render edit button', () => {
      render(<SnippetCardActions {...defaultProps} />)
      expect(screen.getByTestId('snippet-card-edit-btn')).toBeInTheDocument()
    })

    it('should render actions menu button', () => {
      render(<SnippetCardActions {...defaultProps} />)
      expect(screen.getByTestId('snippet-card-actions-menu')).toBeInTheDocument()
    })

    it('should render all action buttons', () => {
      render(<SnippetCardActions {...defaultProps} />)
      expect(screen.getByTestId('snippet-card-view-btn')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-card-copy-btn')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-card-edit-btn')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-card-actions-menu')).toBeInTheDocument()
    })
  })

  describe('View Button', () => {
    it('should call onView when clicked', () => {
      const onView = jest.fn()
      render(<SnippetCardActions {...defaultProps} onView={onView} />)
      const viewBtn = screen.getByTestId('snippet-card-view-btn')
      fireEvent.click(viewBtn)
      expect(onView).toHaveBeenCalled()
    })

    it('should have correct aria-label', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const viewBtn = screen.getByTestId('snippet-card-view-btn')
      expect(viewBtn).toHaveAttribute('aria-label', 'View snippet')
    })

    it('should display view button text', () => {
      render(<SnippetCardActions {...defaultProps} />)
      expect(screen.getByText(/View/)).toBeInTheDocument()
    })
  })

  describe('Copy Button', () => {
    it('should call onCopy when clicked', () => {
      const onCopy = jest.fn()
      render(<SnippetCardActions {...defaultProps} onCopy={onCopy} />)
      const copyBtn = screen.getByTestId('snippet-card-copy-btn')
      fireEvent.click(copyBtn)
      expect(onCopy).toHaveBeenCalled()
    })

    it('should display copy text when not copied', () => {
      render(<SnippetCardActions {...defaultProps} isCopied={false} />)
      const copyBtn = screen.getByTestId('snippet-card-copy-btn')
      expect(copyBtn.textContent).toContain('Copy')
    })

    it('should display copied text when copied', () => {
      render(<SnippetCardActions {...defaultProps} isCopied={true} />)
      const copyBtn = screen.getByTestId('snippet-card-copy-btn')
      expect(copyBtn.textContent).toContain('Copied')
    })

    it('should update text when isCopied prop changes', () => {
      const { rerender } = render(
        <SnippetCardActions {...defaultProps} isCopied={false} />
      )
      let copyBtn = screen.getByTestId('snippet-card-copy-btn')
      expect(copyBtn.textContent).toContain('Copy')

      rerender(<SnippetCardActions {...defaultProps} isCopied={true} />)
      copyBtn = screen.getByTestId('snippet-card-copy-btn')
      expect(copyBtn.textContent).toContain('Copied')
    })

    it('should have proper aria-label', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const copyBtn = screen.getByTestId('snippet-card-copy-btn')
      expect(copyBtn).toHaveAttribute('aria-label')
    })
  })

  describe('Edit Button', () => {
    it('should call onEdit when clicked', () => {
      const onEdit = jest.fn()
      render(<SnippetCardActions {...defaultProps} onEdit={onEdit} />)
      const editBtn = screen.getByTestId('snippet-card-edit-btn')
      fireEvent.click(editBtn)
      expect(onEdit).toHaveBeenCalled()
    })

    it('should have correct aria-label', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const editBtn = screen.getByTestId('snippet-card-edit-btn')
      expect(editBtn).toHaveAttribute('aria-label')
    })

    it('should only display icon without text', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const editBtn = screen.getByTestId('snippet-card-edit-btn')
      // Edit button typically shows only icon
      expect(editBtn).toHaveClass('h-4', 'w-4')
    })
  })

  describe('More Options Menu', () => {
    it('should render dropdown menu trigger', () => {
      render(<SnippetCardActions {...defaultProps} />)
      expect(screen.getByTestId('snippet-card-actions-menu')).toBeInTheDocument()
    })

    it('should have aria-label for menu trigger', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      expect(menuBtn).toHaveAttribute('aria-label', 'More options')
    })

    it('should have aria-haspopup=menu attribute', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      expect(menuBtn).toHaveAttribute('aria-haspopup', 'menu')
    })

    it('should stop propagation when clicked', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      const event = new MouseEvent('click', { bubbles: true })
      const stopPropagation = jest.spyOn(event, 'stopPropagation')
      menuBtn.dispatchEvent(event)
      expect(stopPropagation).toHaveBeenCalled()
    })

    it('should open dropdown menu content when clicked', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)
      expect(screen.getByTestId('snippet-actions-menu-content')).toBeInTheDocument()
    })
  })

  describe('Move to Namespace Submenu', () => {
    it('should display move submenu', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)
      expect(screen.getByTestId('snippet-card-move-submenu')).toBeInTheDocument()
    })

    it('should have correct aria-label', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)
      const moveSubmenu = screen.getByTestId('snippet-card-move-submenu')
      expect(moveSubmenu).toHaveAttribute('aria-label')
    })

    it('should display move to namespaces list', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)
      expect(screen.getByTestId('move-to-namespaces-list')).toBeInTheDocument()
    })

    it('should list all available namespaces', () => {
      render(<SnippetCardActions {...defaultProps} availableNamespaces={mockNamespaces} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      mockNamespaces.forEach((ns) => {
        expect(screen.getByText(ns.name)).toBeInTheDocument()
      })
    })

    it('should call onMoveToNamespace with correct namespace id', () => {
      const onMoveToNamespace = jest.fn()
      render(
        <SnippetCardActions
          {...defaultProps}
          availableNamespaces={mockNamespaces}
          onMoveToNamespace={onMoveToNamespace}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      const nsItem = screen.getByTestId('move-to-namespace-ns-1')
      fireEvent.click(nsItem)

      expect(onMoveToNamespace).toHaveBeenCalledWith('ns-1')
    })

    it('should display default namespace indicator', () => {
      const defaultNamespaces: Namespace[] = [
        { id: 'ns-1', name: 'Default', isDefault: true, createdAt: Date.now() },
        { id: 'ns-2', name: 'Custom', isDefault: false, createdAt: Date.now() },
      ]
      render(
        <SnippetCardActions
          {...defaultProps}
          availableNamespaces={defaultNamespaces}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      expect(screen.getByText('(Default)')).toBeInTheDocument()
    })

    it('should disable move submenu when no namespaces available', () => {
      render(
        <SnippetCardActions
          {...defaultProps}
          availableNamespaces={[]}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      const moveSubmenu = screen.getByTestId('snippet-card-move-submenu')
      expect(moveSubmenu).toHaveAttribute('disabled')
    })

    it('should display no namespaces message when list is empty', () => {
      render(
        <SnippetCardActions
          {...defaultProps}
          availableNamespaces={[]}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      expect(screen.getByTestId('no-namespaces-item')).toBeInTheDocument()
      expect(screen.getByText('No other namespaces')).toBeInTheDocument()
    })

    it('should disable move submenu when moving', () => {
      render(
        <SnippetCardActions
          {...defaultProps}
          isMoving={true}
          availableNamespaces={mockNamespaces}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      const moveSubmenu = screen.getByTestId('snippet-card-move-submenu')
      expect(moveSubmenu).toHaveAttribute('disabled')
    })

    it('should have correct test id for each namespace', () => {
      render(
        <SnippetCardActions
          {...defaultProps}
          availableNamespaces={mockNamespaces}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      mockNamespaces.forEach((ns) => {
        expect(screen.getByTestId(`move-to-namespace-${ns.id}`)).toBeInTheDocument()
      })
    })

    it('should have proper aria-labels for namespace items', () => {
      const defaultNamespaces: Namespace[] = [
        { id: 'ns-1', name: 'Archive', isDefault: true, createdAt: Date.now() },
      ]
      render(
        <SnippetCardActions
          {...defaultProps}
          availableNamespaces={defaultNamespaces}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      const nsItem = screen.getByTestId('move-to-namespace-ns-1')
      expect(nsItem).toHaveAttribute('aria-label')
    })
  })

  describe('Delete Option', () => {
    it('should display delete option in menu', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)
      expect(screen.getByTestId('snippet-card-delete-btn')).toBeInTheDocument()
    })

    it('should call onDelete when delete is clicked', () => {
      const onDelete = jest.fn()
      render(
        <SnippetCardActions {...defaultProps} onDelete={onDelete} />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      const deleteBtn = screen.getByTestId('snippet-card-delete-btn')
      fireEvent.click(deleteBtn)

      expect(onDelete).toHaveBeenCalled()
    })

    it('should have correct aria-label', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)
      const deleteBtn = screen.getByTestId('snippet-card-delete-btn')
      expect(deleteBtn).toHaveAttribute('aria-label', 'Delete snippet')
    })

    it('should display delete text', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should have destructive styling', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)
      const deleteBtn = screen.getByTestId('snippet-card-delete-btn')
      expect(deleteBtn).toHaveClass('text-destructive')
    })
  })

  describe('Accessibility', () => {
    it('should have role=group for actions container', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const container = screen.getByTestId('snippet-card-actions')
      expect(container).toHaveAttribute('role', 'group')
    })

    it('should have aria-label for actions container', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const container = screen.getByTestId('snippet-card-actions')
      expect(container).toHaveAttribute('aria-label', 'Snippet actions')
    })

    it('should have proper button labels', () => {
      render(<SnippetCardActions {...defaultProps} />)
      expect(screen.getByTestId('snippet-card-view-btn')).toHaveAttribute('aria-label')
      expect(screen.getByTestId('snippet-card-copy-btn')).toHaveAttribute('aria-label')
      expect(screen.getByTestId('snippet-card-edit-btn')).toHaveAttribute('aria-label')
    })

    it('should stop menu propagation on click', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      const menuContent = screen.getByTestId('snippet-actions-menu-content')
      const event = new MouseEvent('click', { bubbles: true })
      const stopPropagation = jest.spyOn(event, 'stopPropagation')
      menuContent.dispatchEvent(event)
      expect(stopPropagation).toHaveBeenCalled()
    })
  })

  describe('Button States', () => {
    it('should enable all buttons by default', () => {
      render(<SnippetCardActions {...defaultProps} />)
      expect(screen.getByTestId('snippet-card-view-btn')).not.toBeDisabled()
      expect(screen.getByTestId('snippet-card-copy-btn')).not.toBeDisabled()
      expect(screen.getByTestId('snippet-card-edit-btn')).not.toBeDisabled()
    })

    it('should handle all callbacks simultaneously', () => {
      const onView = jest.fn()
      const onCopy = jest.fn()
      const onEdit = jest.fn()

      render(
        <SnippetCardActions
          {...defaultProps}
          onView={onView}
          onCopy={onCopy}
          onEdit={onEdit}
        />
      )

      fireEvent.click(screen.getByTestId('snippet-card-view-btn'))
      fireEvent.click(screen.getByTestId('snippet-card-copy-btn'))
      fireEvent.click(screen.getByTestId('snippet-card-edit-btn'))

      expect(onView).toHaveBeenCalled()
      expect(onCopy).toHaveBeenCalled()
      expect(onEdit).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle single namespace', () => {
      const singleNamespace: Namespace[] = [
        { id: 'ns-1', name: 'Single', isDefault: true, createdAt: Date.now() },
      ]
      render(
        <SnippetCardActions
          {...defaultProps}
          availableNamespaces={singleNamespace}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)
      expect(screen.getByText('Single')).toBeInTheDocument()
    })

    it('should handle many namespaces', () => {
      const manyNamespaces: Namespace[] = Array.from({ length: 20 }, (_, i) => ({
        id: `ns-${i}`,
        name: `Namespace ${i}`,
        isDefault: i === 0,
        createdAt: Date.now(),
      }))

      render(
        <SnippetCardActions
          {...defaultProps}
          availableNamespaces={manyNamespaces}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      // Should render all namespaces
      manyNamespaces.forEach((ns) => {
        expect(screen.getByText(ns.name)).toBeInTheDocument()
      })
    })

    it('should handle long namespace names', () => {
      const longName = 'A'.repeat(100)
      const longNamespace: Namespace[] = [
        { id: 'ns-1', name: longName, isDefault: false, createdAt: Date.now() },
      ]

      render(
        <SnippetCardActions
          {...defaultProps}
          availableNamespaces={longNamespace}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)
      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('should handle rapid move operations', () => {
      const onMoveToNamespace = jest.fn()
      render(
        <SnippetCardActions
          {...defaultProps}
          availableNamespaces={mockNamespaces}
          onMoveToNamespace={onMoveToNamespace}
        />
      )

      const menuBtn = screen.getByTestId('snippet-card-actions-menu')
      fireEvent.click(menuBtn)

      const items = mockNamespaces.slice(0, 2)
      items.forEach((ns) => {
        const nsItem = screen.getByTestId(`move-to-namespace-${ns.id}`)
        fireEvent.click(nsItem)
      })

      expect(onMoveToNamespace).toHaveBeenCalledTimes(2)
    })
  })

  describe('Layout', () => {
    it('should have flex layout for actions', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const container = screen.getByTestId('snippet-card-actions')
      expect(container).toHaveClass('flex', 'items-center', 'justify-between')
    })

    it('should have gap between action groups', () => {
      render(<SnippetCardActions {...defaultProps} />)
      const container = screen.getByTestId('snippet-card-actions')
      expect(container).toHaveClass('gap-2')
    })
  })
})
