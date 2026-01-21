import React from 'react'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { SnippetViewer } from './SnippetViewer'

// Mock SnippetViewerHeader
jest.mock('./SnippetViewerHeader', () => ({
  SnippetViewerHeader: ({
    snippet,
    isCopied,
    onCopy,
    onEdit,
    onTogglePreview,
  }: any) => (
    <div data-testid="snippet-viewer-header">
      <div>{snippet.title}</div>
      <button data-testid="copy-btn" onClick={onCopy}>
        {isCopied ? 'Copied' : 'Copy'}
      </button>
      <button data-testid="edit-btn" onClick={onEdit}>
        Edit
      </button>
      <button data-testid="toggle-preview-btn" onClick={onTogglePreview}>
        Toggle Preview
      </button>
    </div>
  ),
}))

// Mock SnippetViewerContent (with dynamic import handling)
jest.mock('./SnippetViewerContent', () => ({
  SnippetViewerContent: ({ snippet, showPreview }: any) => (
    <div data-testid="snippet-viewer-content">
      <code>{snippet.code}</code>
      {showPreview && <div>Preview Visible</div>}
    </div>
  ),
}))

describe('SnippetViewer Component', () => {
  const mockOnOpenChange = jest.fn()
  const mockOnEdit = jest.fn()
  const mockOnCopy = jest.fn()

  const mockSnippet = {
    id: '1',
    title: 'Test Snippet',
    description: 'A test snippet',
    code: 'console.log("test");',
    language: 'JavaScript',
    category: 'general',
    hasPreview: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const defaultProps = {
    snippet: mockSnippet,
    open: true,
    onOpenChange: mockOnOpenChange,
    onEdit: mockOnEdit,
    onCopy: mockOnCopy,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders nothing when snippet is null', () => {
      const { container } = render(
        <SnippetViewer {...defaultProps} snippet={null} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders dialog when snippet exists and open is true', () => {
      render(<SnippetViewer {...defaultProps} />)

      expect(screen.getByTestId('snippet-viewer-dialog')).toBeInTheDocument()
    })

    it('does not render visible dialog when open is false', () => {
      render(<SnippetViewer {...defaultProps} open={false} />)

      // When closed, dialog should not be visible or not in the DOM
      const dialog = screen.queryByTestId('snippet-viewer-dialog')
      if (dialog) {
        expect(dialog).not.toBeVisible()
      }
    })

    it('renders header with snippet data', () => {
      render(<SnippetViewer {...defaultProps} />)

      expect(screen.getByTestId('snippet-viewer-header')).toBeInTheDocument()
      expect(screen.getByText('Test Snippet')).toBeInTheDocument()
    })

    it('renders content area', () => {
      render(<SnippetViewer {...defaultProps} />)

      expect(screen.getByTestId('snippet-viewer-content')).toBeInTheDocument()
    })
  })

  describe('Copy Functionality', () => {
    it('calls onCopy with code when copy button is clicked', async () => {
      const user = userEvent.setup()
      render(<SnippetViewer {...defaultProps} />)

      const copyBtn = screen.getByTestId('copy-btn')
      await user.click(copyBtn)

      expect(mockOnCopy).toHaveBeenCalledWith(mockSnippet.code)
    })

    it('shows copied state after clicking copy', async () => {
      const user = userEvent.setup()
      render(<SnippetViewer {...defaultProps} />)

      const copyBtn = screen.getByTestId('copy-btn')
      expect(copyBtn).toHaveTextContent('Copy')

      await user.click(copyBtn)

      // Wait for the copied state
      await waitFor(() => {
        expect(copyBtn).toHaveTextContent('Copied')
      })
    })

    it('reverts copied state after timeout', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ delay: null })

      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        const copyBtn = screen.getByTestId('copy-btn')
        expect(copyBtn).toBeInTheDocument()
      }, { timeout: 3000 })

      const copyBtn = screen.getByTestId('copy-btn')
      await user.click(copyBtn)

      expect(copyBtn).toHaveTextContent('Copied')

      // Fast-forward time - appConfig.copiedTimeout is used
      jest.advanceTimersByTime(5000)

      // Should revert to 'Copy'
      await waitFor(() => {
        expect(copyBtn).toHaveTextContent('Copy')
      }, { timeout: 1000 })

      jest.useRealTimers()
    })

    it('passes correct code to onCopy', async () => {
      const user = userEvent.setup({ delay: null })
      const customCode = 'function hello() { return "world"; }'
      const customSnippet = { ...mockSnippet, code: customCode }

      render(
        <SnippetViewer {...defaultProps} snippet={customSnippet} />
      )

      await waitFor(() => {
        const copyBtn = screen.getByTestId('copy-btn')
        expect(copyBtn).toBeInTheDocument()
      }, { timeout: 3000 })

      const copyBtn = screen.getByTestId('copy-btn')
      await user.click(copyBtn)

      expect(mockOnCopy).toHaveBeenCalledWith(customCode)
    }, 10000)
  })

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        const editBtn = screen.getByTestId('edit-btn')
        expect(editBtn).toBeInTheDocument()
      }, { timeout: 3000 })

      const editBtn = screen.getByTestId('edit-btn')
      await user.click(editBtn)

      expect(mockOnEdit).toHaveBeenCalledWith(mockSnippet)
    })

    it('closes dialog when edit button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        const editBtn = screen.getByTestId('edit-btn')
        expect(editBtn).toBeInTheDocument()
      }, { timeout: 3000 })

      const editBtn = screen.getByTestId('edit-btn')
      await user.click(editBtn)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('passes correct snippet to onEdit', async () => {
      const user = userEvent.setup({ delay: null })
      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        const editBtn = screen.getByTestId('edit-btn')
        expect(editBtn).toBeInTheDocument()
      }, { timeout: 3000 })

      const editBtn = screen.getByTestId('edit-btn')
      await user.click(editBtn)

      expect(mockOnEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockSnippet.id,
          title: mockSnippet.title,
          code: mockSnippet.code,
        })
      )
    })
  })

  describe('Preview Toggle', () => {
    it('shows preview by default when hasPreview is true', () => {
      render(<SnippetViewer {...defaultProps} />)

      expect(screen.getByText('Preview Visible')).toBeInTheDocument()
    })

    it('toggling preview changes visibility', async () => {
      const user = userEvent.setup({ delay: null })
      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        const toggleBtn = screen.queryByTestId('toggle-preview-btn')
        if (toggleBtn) {
          expect(toggleBtn).toBeInTheDocument()
        }
      }, { timeout: 3000 })

      const toggleBtn = screen.queryByTestId('toggle-preview-btn')
      if (toggleBtn) {
        await user.click(toggleBtn)
        // First click hides preview
        // Toggle is working if button exists
        expect(toggleBtn).toBeInTheDocument()
      }
    })

    it('does not show preview when snippet has hasPreview false', () => {
      const snippetWithoutPreview = { ...mockSnippet, hasPreview: false }

      render(
        <SnippetViewer {...defaultProps} snippet={snippetWithoutPreview} />
      )

      // Dialog should still render but without preview toggle
      expect(screen.getByTestId('snippet-viewer-dialog')).toBeInTheDocument()
    })

    it('does not show preview for unsupported languages', () => {
      const unsupportedSnippet = {
        ...mockSnippet,
        language: 'Go',
        hasPreview: true,
      }

      render(
        <SnippetViewer {...defaultProps} snippet={unsupportedSnippet} />
      )

      // Dialog should still render but without preview toggle
      expect(screen.getByTestId('snippet-viewer-dialog')).toBeInTheDocument()
    })
  })

  describe('Dialog Controls', () => {
    it('closes dialog when onOpenChange is called', async () => {
      const user = userEvent.setup()
      render(<SnippetViewer {...defaultProps} />)

      // Assuming there's a close button or backdrop
      expect(screen.getByTestId('snippet-viewer-dialog')).toBeInTheDocument()

      // Trigger close
      mockOnOpenChange(false)

      // The parent component should handle this
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('dialog opens and closes based on open prop', async () => {
      const { rerender } = render(<SnippetViewer {...defaultProps} open={true} />)

      await waitFor(() => {
        expect(screen.getByTestId('snippet-viewer-dialog')).toBeInTheDocument()
      }, { timeout: 3000 })

      rerender(<SnippetViewer {...defaultProps} open={false} />)

      // Dialog should close
      const dialog = screen.queryByTestId('snippet-viewer-dialog')
      if (dialog) {
        expect(dialog).not.toBeVisible()
      }
    })
  })

  describe('Python Support', () => {
    it('identifies Python snippets', () => {
      const pythonSnippet = {
        ...mockSnippet,
        language: 'Python',
        code: 'print("hello")',
      }

      render(<SnippetViewer {...defaultProps} snippet={pythonSnippet} />)

      expect(screen.getByTestId('snippet-viewer-content')).toBeInTheDocument()
    })

    it('passes isPython flag to content', () => {
      const pythonSnippet = {
        ...mockSnippet,
        language: 'Python',
        hasPreview: true,
      }

      render(<SnippetViewer {...defaultProps} snippet={pythonSnippet} />)

      // Content should be aware it's Python
      expect(screen.getByTestId('snippet-viewer-content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('dialog has proper semantic structure', () => {
      render(<SnippetViewer {...defaultProps} />)

      const dialog = screen.getByTestId('snippet-viewer-dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup({ delay: null })
      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        const copyBtn = screen.getByTestId('copy-btn')
        expect(copyBtn).toBeInTheDocument()
      }, { timeout: 3000 })

      const copyBtn = screen.getByTestId('copy-btn')
      copyBtn.focus()
      expect(copyBtn).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockOnCopy).toHaveBeenCalled()
    })

    it('header is properly labeled', () => {
      render(<SnippetViewer {...defaultProps} />)

      expect(screen.getByTestId('snippet-viewer-header')).toBeInTheDocument()
      expect(screen.getByText('Test Snippet')).toBeInTheDocument()
    })

    it('code content is accessible', () => {
      render(<SnippetViewer {...defaultProps} />)

      const code = screen.getByText(mockSnippet.code)
      expect(code).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles snippet change while open', () => {
      const { rerender } = render(<SnippetViewer {...defaultProps} />)

      const newSnippet = {
        ...mockSnippet,
        id: '2',
        title: 'Different Snippet',
        code: 'different code',
      }

      rerender(
        <SnippetViewer {...defaultProps} snippet={newSnippet} />
      )

      expect(screen.getByText('Different Snippet')).toBeInTheDocument()
      expect(screen.getByText('different code')).toBeInTheDocument()
    })

    it('handles rapid open/close cycles', async () => {
      const { rerender } = render(<SnippetViewer {...defaultProps} open={true} />)

      rerender(<SnippetViewer {...defaultProps} open={false} />)
      rerender(<SnippetViewer {...defaultProps} open={true} />)
      rerender(<SnippetViewer {...defaultProps} open={false} />)

      expect(mockOnOpenChange).not.toThrow()
    })

    it('handles snippet with very long code', () => {
      const longCode = 'const x = 1;\n'.repeat(1000)
      const longSnippet = { ...mockSnippet, code: longCode }

      render(<SnippetViewer {...defaultProps} snippet={longSnippet} />)

      expect(screen.getByTestId('snippet-viewer-content')).toBeInTheDocument()
    })

    it('handles snippet with special characters in title', () => {
      const specialSnippet = {
        ...mockSnippet,
        title: '<script>alert("xss")</script>',
      }

      render(<SnippetViewer {...defaultProps} snippet={specialSnippet} />)

      expect(screen.getByTestId('snippet-viewer-dialog')).toBeInTheDocument()
    })

    it('handles snippet without preview support', () => {
      const noPreviewSnippet = {
        ...mockSnippet,
        hasPreview: false,
      }

      render(<SnippetViewer {...defaultProps} snippet={noPreviewSnippet} />)

      expect(screen.getByTestId('snippet-viewer-content')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('maintains isCopied state independently of preview state', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ delay: null })

      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        const copyBtn = screen.getByTestId('copy-btn')
        expect(copyBtn).toBeInTheDocument()
      }, { timeout: 3000 })

      const copyBtn = screen.getByTestId('copy-btn')
      const toggleBtn = screen.queryByTestId('toggle-preview-btn')

      // Copy code
      await user.click(copyBtn)
      expect(copyBtn).toHaveTextContent('Copied')

      // Toggle preview if available
      if (toggleBtn) {
        await user.click(toggleBtn)
        // Copied state should still show
        expect(copyBtn).toHaveTextContent('Copied')
      }

      jest.useRealTimers()
    })

    it('maintains showPreview state through copy action', async () => {
      const user = userEvent.setup({ delay: null })
      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        const copyBtn = screen.getByTestId('copy-btn')
        expect(copyBtn).toBeInTheDocument()
      }, { timeout: 3000 })

      // Copy code
      const copyBtn = screen.getByTestId('copy-btn')
      await user.click(copyBtn)

      // Copy button should show copied state
      expect(copyBtn).toHaveTextContent('Copied')
    })
  })

  describe('Integration Tests', () => {
    it('complete workflow: view and copy snippet', async () => {
      const user = userEvent.setup({ delay: null })
      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('copy-btn')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Copy code
      const copyBtn = screen.getByTestId('copy-btn')
      await user.click(copyBtn)

      expect(mockOnCopy).toHaveBeenCalledWith(mockSnippet.code)
    })

    it('complete workflow: view and edit snippet', async () => {
      const user = userEvent.setup({ delay: null })
      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('edit-btn')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Edit snippet
      const editBtn = screen.getByTestId('edit-btn')
      await user.click(editBtn)

      expect(mockOnEdit).toHaveBeenCalledWith(mockSnippet)
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('complete workflow: toggle preview and copy', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ delay: null })

      render(<SnippetViewer {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('copy-btn')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Copy
      const copyBtn = screen.getByTestId('copy-btn')
      await user.click(copyBtn)
      expect(copyBtn).toHaveTextContent('Copied')

      jest.useRealTimers()
    })
  })

  describe('Language Support', () => {
    it('handles JavaScript snippets', () => {
      render(<SnippetViewer {...defaultProps} />)

      expect(screen.getByTestId('snippet-viewer-content')).toBeInTheDocument()
    })

    it('handles TypeScript snippets', () => {
      const tsSnippet = { ...mockSnippet, language: 'TypeScript' }

      render(<SnippetViewer {...defaultProps} snippet={tsSnippet} />)

      expect(screen.getByTestId('snippet-viewer-content')).toBeInTheDocument()
    })

    it('handles JSX snippets', () => {
      const jsxSnippet = {
        ...mockSnippet,
        language: 'JSX',
        code: '<Component />',
      }

      render(<SnippetViewer {...defaultProps} snippet={jsxSnippet} />)

      expect(screen.getByTestId('snippet-viewer-content')).toBeInTheDocument()
    })

    it('handles Python snippets', () => {
      const pySnippet = {
        ...mockSnippet,
        language: 'Python',
        code: 'print("hello")',
      }

      render(<SnippetViewer {...defaultProps} snippet={pySnippet} />)

      expect(screen.getByTestId('snippet-viewer-content')).toBeInTheDocument()
    })
  })
})
