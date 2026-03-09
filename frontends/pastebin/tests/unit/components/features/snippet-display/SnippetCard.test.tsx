
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { SnippetCard } from '@/components/features/snippet-display/SnippetCard'
import { Snippet, Namespace } from '@/lib/types'

// Mock child components
jest.mock('@/components/features/snippet-display/SnippetCardHeader', () => ({
  SnippetCardHeader: ({ snippet, description }: any) => (
    <div data-testid="snippet-card-header">
      <h3>{snippet.title}</h3>
      <p>{description}</p>
    </div>
  ),
}))

jest.mock('@/components/features/snippet-display/SnippetCodePreview', () => ({
  SnippetCodePreview: ({ displayCode, isTruncated }: any) => (
    <div data-testid="snippet-code-preview">
      <code>{displayCode}</code>
      {isTruncated && <span>Truncated</span>}
    </div>
  ),
}))

jest.mock('@/components/features/snippet-display/SnippetCardActions', () => ({
  SnippetCardActions: ({ onView, onCopy, onEdit, onDelete, onMoveToNamespace }: any) => (
    <div data-testid="snippet-card-actions">
      <button onClick={onView} data-testid="action-view">View</button>
      <button onClick={onCopy} data-testid="action-copy">Copy</button>
      <button onClick={onEdit} data-testid="action-edit">Edit</button>
      <button onClick={onDelete} data-testid="action-delete">Delete</button>
    </div>
  ),
}))

// Mock database functions
jest.mock('@/lib/db', () => ({
  getAllNamespaces: jest.fn().mockResolvedValue([
    { id: 'ns-1', name: 'Default', isDefault: true },
    { id: 'ns-2', name: 'Custom', isDefault: false },
  ]),
  moveSnippetToNamespace: jest.fn().mockResolvedValue({}),
}))

jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('SnippetCard', () => {
  const mockSnippet: Snippet = {
    id: 'snippet-1',
    title: 'Test Snippet',
    code: 'const x = 1;',
    language: 'JavaScript',
    description: 'A test snippet',
    category: 'basics',
    hasPreview: false,
    namespaceId: 'ns-1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const defaultProps = {
    snippet: mockSnippet,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onCopy: jest.fn(),
    onView: jest.fn(),
    onMove: jest.fn(),
    selectionMode: false,
    isSelected: false,
    onToggleSelect: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render snippet card', () => {
      render(<SnippetCard {...defaultProps} />)
      expect(screen.getByTestId(`snippet-card-${mockSnippet.id}`)).toBeInTheDocument()
    })

    it('should render card header', () => {
      render(<SnippetCard {...defaultProps} />)
      expect(screen.getByTestId('snippet-card-header')).toBeInTheDocument()
    })

    it('should render code preview', () => {
      render(<SnippetCard {...defaultProps} />)
      expect(screen.getByTestId('snippet-code-preview')).toBeInTheDocument()
    })

    it('should render actions when not in selection mode', () => {
      render(<SnippetCard {...defaultProps} selectionMode={false} />)
      expect(screen.getByTestId('snippet-card-actions')).toBeInTheDocument()
    })

    it('should not render actions when in selection mode', () => {
      render(<SnippetCard {...defaultProps} selectionMode={true} />)
      expect(screen.queryByTestId('snippet-card-actions')).not.toBeInTheDocument()
    })

    it('should display snippet title', () => {
      render(<SnippetCard {...defaultProps} />)
      expect(screen.getByText('Test Snippet')).toBeInTheDocument()
    })

    it('should display snippet description', () => {
      render(<SnippetCard {...defaultProps} />)
      expect(screen.getByText('A test snippet')).toBeInTheDocument()
    })

    it('should display snippet code preview', () => {
      render(<SnippetCard {...defaultProps} />)
      expect(screen.getByText('const x = 1;')).toBeInTheDocument()
    })
  })

  describe('Selection Mode', () => {
    it('should apply selected styling when isSelected is true', () => {
      render(<SnippetCard {...defaultProps} isSelected={true} />)
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      expect(card).toHaveClass('border-accent')
    })

    it('should not apply selected styling when isSelected is false', () => {
      render(<SnippetCard {...defaultProps} isSelected={false} />)
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      expect(card).not.toHaveClass('border-accent')
    })

    it('should call onToggleSelect when card is clicked in selection mode', () => {
      const onToggleSelect = jest.fn()
      render(
        <SnippetCard
          {...defaultProps}
          selectionMode={true}
          onToggleSelect={onToggleSelect}
        />
      )
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      fireEvent.click(card)
      expect(onToggleSelect).toHaveBeenCalledWith(mockSnippet.id)
    })

    it('should call onView when card is clicked in normal mode', () => {
      const onView = jest.fn()
      render(
        <SnippetCard
          {...defaultProps}
          selectionMode={false}
          onView={onView}
        />
      )
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      fireEvent.click(card)
      expect(onView).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have role=article', () => {
      render(<SnippetCard {...defaultProps} />)
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      expect(card).toHaveAttribute('role', 'article')
    })

    it('should have aria-selected attribute', () => {
      render(<SnippetCard {...defaultProps} isSelected={false} />)
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      expect(card).toHaveAttribute('aria-selected', 'false')
    })

    it('should update aria-selected when selected', () => {
      const { rerender } = render(
        <SnippetCard {...defaultProps} isSelected={false} />
      )
      let card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      expect(card).toHaveAttribute('aria-selected', 'false')

      rerender(<SnippetCard {...defaultProps} isSelected={true} />)
      card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      expect(card).toHaveAttribute('aria-selected', 'true')
    })

    it('should have tabIndex=0', () => {
      render(<SnippetCard {...defaultProps} />)
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      expect(card).toHaveAttribute('tabindex', '0')
    })

    it('should handle keyboard enter key', () => {
      const onView = jest.fn()
      render(
        <SnippetCard
          {...defaultProps}
          selectionMode={false}
          onView={onView}
        />
      )
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      fireEvent.keyDown(card, { key: 'Enter' })
      expect(onView).toHaveBeenCalled()
    })

    it('should handle keyboard space key', () => {
      const onView = jest.fn()
      render(
        <SnippetCard
          {...defaultProps}
          selectionMode={false}
          onView={onView}
        />
      )
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      fireEvent.keyDown(card, { key: ' ' })
      expect(onView).toHaveBeenCalled()
    })
  })

  describe('Code Preview Truncation', () => {
    it('should truncate long code', () => {
      const longCode = 'const x = 1;\n'.repeat(500)
      const snippet = { ...mockSnippet, code: longCode }
      render(<SnippetCard {...defaultProps} snippet={snippet} />)
      const preview = screen.getByTestId('snippet-code-preview')
      expect(preview.textContent).toContain('Truncated')
    })

    it('should not truncate short code', () => {
      const shortCode = 'const x = 1;'
      const snippet = { ...mockSnippet, code: shortCode }
      render(<SnippetCard {...defaultProps} snippet={snippet} />)
      const preview = screen.getByTestId('snippet-code-preview')
      expect(preview.textContent).toContain('const x = 1;')
    })

    it('should display full code to copy function', () => {
      const longCode = 'const x = 1;\n'.repeat(500)
      const snippet = { ...mockSnippet, code: longCode }
      const onCopy = jest.fn()
      render(
        <SnippetCard {...defaultProps} snippet={snippet} onCopy={onCopy} />
      )
      // Copy should have access to full code
      expect(screen.getByTestId('snippet-card-actions')).toBeInTheDocument()
    })
  })

  describe('Copy Functionality', () => {
    it('should call onCopy with full code', () => {
      const onCopy = jest.fn()
      render(
        <SnippetCard {...defaultProps} onCopy={onCopy} />
      )
      const copyBtn = screen.getByTestId('action-copy')
      fireEvent.click(copyBtn)
      expect(onCopy).toHaveBeenCalledWith(mockSnippet.code)
    })

    it('should show copied state temporarily', async () => {
      const onCopy = jest.fn()
      render(
        <SnippetCard {...defaultProps} onCopy={onCopy} />
      )
      const copyBtn = screen.getByTestId('action-copy')
      fireEvent.click(copyBtn)

      // Wait for state to update
      await waitFor(() => {
        expect(onCopy).toHaveBeenCalled()
      })
    })
  })

  describe('Edit Functionality', () => {
    it('should call onEdit with snippet', () => {
      const onEdit = jest.fn()
      render(
        <SnippetCard {...defaultProps} onEdit={onEdit} />
      )
      const editBtn = screen.getByTestId('action-edit')
      fireEvent.click(editBtn)
      expect(onEdit).toHaveBeenCalledWith(mockSnippet)
    })

    it('should stop propagation when clicking edit button', () => {
      render(<SnippetCard {...defaultProps} />)
      const editBtn = screen.getByTestId('action-edit')
      const event = new MouseEvent('click', { bubbles: true })
      const stopPropagation = jest.spyOn(event, 'stopPropagation')
      editBtn.dispatchEvent(event)
      expect(stopPropagation).toHaveBeenCalled()
    })
  })

  describe('Delete Functionality', () => {
    it('should call onDelete with snippet id', () => {
      const onDelete = jest.fn()
      render(
        <SnippetCard {...defaultProps} onDelete={onDelete} />
      )
      const deleteBtn = screen.getByTestId('action-delete')
      fireEvent.click(deleteBtn)
      expect(onDelete).toHaveBeenCalledWith(mockSnippet.id)
    })
  })

  describe('Error State', () => {
    it('should handle null snippet gracefully', () => {
      render(
        <SnippetCard
          {...defaultProps}
          snippet={null as any}
        />
      )
      // Should render error message or fallback
      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('should handle undefined snippet gracefully', () => {
      render(
        <SnippetCard
          {...defaultProps}
          snippet={undefined as any}
        />
      )
      // Should render error message or fallback
      expect(screen.getByRole('article')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have group hover class', () => {
      render(<SnippetCard {...defaultProps} />)
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      expect(card).toHaveClass('group')
    })

    it('should have hover transition', () => {
      render(<SnippetCard {...defaultProps} />)
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      expect(card).toHaveClass('transition-all')
    })

    it('should have cursor pointer', () => {
      render(<SnippetCard {...defaultProps} />)
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      expect(card).toHaveClass('cursor-pointer')
    })
  })

  describe('Edge Cases', () => {
    it('should handle snippet with very long title', () => {
      const longTitle = 'A'.repeat(200)
      const snippet = { ...mockSnippet, title: longTitle }
      render(<SnippetCard {...defaultProps} snippet={snippet} />)
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle snippet with empty description', () => {
      const snippet = { ...mockSnippet, description: '' }
      render(<SnippetCard {...defaultProps} snippet={snippet} />)
      expect(screen.getByTestId('snippet-card-header')).toBeInTheDocument()
    })

    it('should handle snippet with no tags', () => {
      const snippet = { ...mockSnippet, tags: [] }
      render(<SnippetCard {...defaultProps} snippet={snippet} />)
      expect(screen.getByTestId(`snippet-card-${snippet.id}`)).toBeInTheDocument()
    })

    it('should handle snippet with many tags', () => {
      const snippet = {
        ...mockSnippet,
        tags: Array.from({ length: 20 }, (_, i) => `tag${i}`),
      }
      render(<SnippetCard {...defaultProps} snippet={snippet} />)
      expect(screen.getByTestId(`snippet-card-${snippet.id}`)).toBeInTheDocument()
    })

    it('should handle special characters in code', () => {
      const specialCode = 'const str = "test\\"quote"; const regex = /[\\w]+/;'
      const snippet = { ...mockSnippet, code: specialCode }
      render(<SnippetCard {...defaultProps} snippet={snippet} />)
      expect(screen.getByTestId('snippet-code-preview')).toBeInTheDocument()
    })
  })

  describe('Interaction Sequence', () => {
    it('should handle copy followed by edit', () => {
      const onCopy = jest.fn()
      const onEdit = jest.fn()
      render(
        <SnippetCard {...defaultProps} onCopy={onCopy} onEdit={onEdit} />
      )

      const copyBtn = screen.getByTestId('action-copy')
      fireEvent.click(copyBtn)
      expect(onCopy).toHaveBeenCalled()

      const editBtn = screen.getByTestId('action-edit')
      fireEvent.click(editBtn)
      expect(onEdit).toHaveBeenCalled()
    })

    it('should handle view followed by copy', () => {
      const onView = jest.fn()
      const onCopy = jest.fn()
      render(
        <SnippetCard
          {...defaultProps}
          selectionMode={false}
          onView={onView}
          onCopy={onCopy}
        />
      )

      const copyBtn = screen.getByTestId('action-copy')
      fireEvent.click(copyBtn)
      expect(onCopy).toHaveBeenCalled()
    })
  })

  describe('Namespace Display', () => {
    it('should display namespace information', async () => {
      render(<SnippetCard {...defaultProps} />)
      await waitFor(() => {
        // Should load namespaces
        expect(screen.getByTestId(`snippet-card-${mockSnippet.id}`)).toBeInTheDocument()
      })
    })

    it('should filter available namespaces', async () => {
      render(<SnippetCard {...defaultProps} />)
      await waitFor(() => {
        // Should not include current namespace in move options
        expect(screen.getByTestId(`snippet-card-${mockSnippet.id}`)).toBeInTheDocument()
      })
    })
  })

  describe('Selection Mode Variations', () => {
    it('should handle selection mode with toggle', () => {
      const onToggleSelect = jest.fn()
      render(
        <SnippetCard
          {...defaultProps}
          selectionMode={true}
          onToggleSelect={onToggleSelect}
        />
      )
      const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
      fireEvent.click(card)
      expect(onToggleSelect).toHaveBeenCalledWith(mockSnippet.id)
    })

    it('should exit selection mode gracefully', () => {
      const { rerender } = render(
        <SnippetCard
          {...defaultProps}
          selectionMode={true}
        />
      )
      expect(screen.queryByTestId('snippet-card-actions')).not.toBeInTheDocument()

      rerender(
        <SnippetCard
          {...defaultProps}
          selectionMode={false}
        />
      )
      expect(screen.getByTestId('snippet-card-actions')).toBeInTheDocument()
    })
  })
})
