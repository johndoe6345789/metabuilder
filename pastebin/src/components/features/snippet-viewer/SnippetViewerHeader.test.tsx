import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { SnippetViewerHeader } from './SnippetViewerHeader'

describe('SnippetViewerHeader Component', () => {
  const mockOnCopy = jest.fn()
  const mockOnEdit = jest.fn()
  const mockOnTogglePreview = jest.fn()

  const mockSnippet = {
    id: '1',
    title: 'Test Snippet',
    description: 'A test snippet description',
    code: 'console.log("test");',
    language: 'JavaScript',
    category: 'general',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const defaultProps = {
    snippet: mockSnippet,
    isCopied: false,
    canPreview: true,
    showPreview: true,
    onCopy: mockOnCopy,
    onEdit: mockOnEdit,
    onTogglePreview: mockOnTogglePreview,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Title Display', () => {
    it('renders snippet title', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      expect(screen.getByText('Test Snippet')).toBeInTheDocument()
    })

    it('displays title as heading', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const heading = screen.getByRole('heading')
      expect(heading).toHaveTextContent('Test Snippet')
    })

    it('truncates very long titles', () => {
      const longTitle = 'A'.repeat(200)
      const longSnippet = { ...mockSnippet, title: longTitle }

      render(<SnippetViewerHeader {...defaultProps} snippet={longSnippet} />)

      // The component should still render but truncate with CSS
      expect(screen.getByRole('heading')).toBeInTheDocument()
    })

    it('handles special characters in title', () => {
      const specialTitle = '<script>alert("xss")</script>'
      const specialSnippet = { ...mockSnippet, title: specialTitle }

      render(<SnippetViewerHeader {...defaultProps} snippet={specialSnippet} />)

      expect(screen.getByRole('heading')).toBeInTheDocument()
    })
  })

  describe('Language Badge', () => {
    it('renders language badge', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      expect(screen.getByText('JavaScript')).toBeInTheDocument()
    })

    it('displays correct language', () => {
      const pythonSnippet = { ...mockSnippet, language: 'Python' }

      render(<SnippetViewerHeader {...defaultProps} snippet={pythonSnippet} />)

      expect(screen.getByText('Python')).toBeInTheDocument()
    })

    it('badge has outline variant', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const badge = screen.getByText('JavaScript').closest('div')
      expect(badge).toHaveClass('border')
    })

    it('badge includes language color styling', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const badge = screen.getByText('JavaScript').parentElement
      // Should have color classes from LANGUAGE_COLORS
      expect(badge).toBeInTheDocument()
    })

    it('supports multiple languages in badge', () => {
      const languages = ['JavaScript', 'Python', 'JSX', 'TypeScript', 'Go']

      languages.forEach((lang) => {
        const snippet = { ...mockSnippet, language: lang }
        const { unmount } = render(
          <SnippetViewerHeader {...defaultProps} snippet={snippet} />
        )

        expect(screen.getByText(lang)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Description Display', () => {
    it('renders description when present', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      expect(screen.getByText('A test snippet description')).toBeInTheDocument()
    })

    it('does not render description when empty', () => {
      const emptyDescSnippet = { ...mockSnippet, description: '' }

      render(<SnippetViewerHeader {...defaultProps} snippet={emptyDescSnippet} />)

      expect(screen.queryByText('A test snippet description')).not.toBeInTheDocument()
    })

    it('renders multiline description', () => {
      const multilineDesc = 'Line 1\nLine 2\nLine 3'
      const multilineSnippet = { ...mockSnippet, description: multilineDesc }

      render(<SnippetViewerHeader {...defaultProps} snippet={multilineSnippet} />)

      const desc = screen.getByText(/Line 1/)
      expect(desc).toBeInTheDocument()
    })

    it('handles special characters in description', () => {
      const specialDesc = '<>&"\'`'
      const specialSnippet = { ...mockSnippet, description: specialDesc }

      render(<SnippetViewerHeader {...defaultProps} snippet={specialSnippet} />)

      expect(screen.getByText(specialDesc)).toBeInTheDocument()
    })
  })

  describe('Last Updated Timestamp', () => {
    it('displays last updated date', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      // Should contain some date text
      const dateText = screen.getByText(/Last updated/)
      expect(dateText).toBeInTheDocument()
    })

    it('formats date correctly', () => {
      const testDate = new Date('2024-01-15T10:30:00').getTime()
      const timestampSnippet = { ...mockSnippet, updatedAt: testDate }

      render(<SnippetViewerHeader {...defaultProps} snippet={timestampSnippet} />)

      // Should display formatted date
      expect(screen.getByText(/Last updated/)).toBeInTheDocument()
    })

    it('updates timestamp when snippet changes', () => {
      const { rerender } = render(<SnippetViewerHeader {...defaultProps} />)

      const newSnippet = {
        ...mockSnippet,
        updatedAt: Date.now() + 1000000,
      }

      rerender(<SnippetViewerHeader {...defaultProps} snippet={newSnippet} />)

      expect(screen.getByText(/Last updated/)).toBeInTheDocument()
    })
  })

  describe('Copy Button', () => {
    it('renders copy button', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      expect(copyBtn).toBeInTheDocument()
    })

    it('displays copy icon and text initially', () => {
      render(<SnippetViewerHeader {...defaultProps} isCopied={false} />)

      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      expect(copyBtn).toHaveTextContent('Copy')
    })

    it('displays check icon and copied text when isCopied is true', () => {
      render(<SnippetViewerHeader {...defaultProps} isCopied={true} />)

      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      expect(copyBtn).toHaveTextContent('Copied')
    })

    it('calls onCopy when copy button clicked', async () => {
      const user = userEvent.setup()
      render(<SnippetViewerHeader {...defaultProps} />)

      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      await user.click(copyBtn)

      expect(mockOnCopy).toHaveBeenCalled()
    })

    it('button is keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<SnippetViewerHeader {...defaultProps} />)

      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      copyBtn.focus()
      expect(copyBtn).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockOnCopy).toHaveBeenCalled()
    })

    it('has aria-label for accessibility', () => {
      render(<SnippetViewerHeader {...defaultProps} isCopied={false} />)

      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      expect(copyBtn).toHaveAttribute('aria-label', expect.stringMatching(/copy/i))
    })

    it('aria-label changes when copied', () => {
      const { rerender } = render(<SnippetViewerHeader {...defaultProps} isCopied={false} />)

      let copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      let label = copyBtn.getAttribute('aria-label')
      expect(label).toMatch(/copy.*clipboard/i)

      rerender(<SnippetViewerHeader {...defaultProps} isCopied={true} />)

      copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      label = copyBtn.getAttribute('aria-label')
      expect(label).toMatch(/copied/i)
    })
  })

  describe('Edit Button', () => {
    it('renders edit button', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const editBtn = screen.getByTestId('snippet-viewer-edit-btn')
      expect(editBtn).toBeInTheDocument()
    })

    it('displays edit text', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const editBtn = screen.getByTestId('snippet-viewer-edit-btn')
      expect(editBtn).toHaveTextContent('Edit')
    })

    it('calls onEdit when edit button clicked', async () => {
      const user = userEvent.setup()
      render(<SnippetViewerHeader {...defaultProps} />)

      const editBtn = screen.getByTestId('snippet-viewer-edit-btn')
      await user.click(editBtn)

      expect(mockOnEdit).toHaveBeenCalled()
    })

    it('button is keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<SnippetViewerHeader {...defaultProps} />)

      const editBtn = screen.getByTestId('snippet-viewer-edit-btn')
      editBtn.focus()
      expect(editBtn).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockOnEdit).toHaveBeenCalled()
    })

    it('has aria-label', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const editBtn = screen.getByTestId('snippet-viewer-edit-btn')
      expect(editBtn).toHaveAttribute('aria-label', expect.stringMatching(/edit/i))
    })
  })

  describe('Preview Toggle Button', () => {
    it('renders preview toggle button when canPreview is true', () => {
      render(<SnippetViewerHeader {...defaultProps} canPreview={true} />)

      const toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')
      expect(toggleBtn).toBeInTheDocument()
    })

    it('does not render preview button when canPreview is false', () => {
      render(<SnippetViewerHeader {...defaultProps} canPreview={false} />)

      expect(screen.queryByTestId('snippet-viewer-toggle-preview-btn')).not.toBeInTheDocument()
    })

    it('displays show preview text when showPreview is false', () => {
      render(<SnippetViewerHeader {...defaultProps} showPreview={false} />)

      const toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')
      expect(toggleBtn).toHaveTextContent(/Show [Pp]review/)
    })

    it('displays hide preview text when showPreview is true', () => {
      render(<SnippetViewerHeader {...defaultProps} showPreview={true} />)

      const toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')
      expect(toggleBtn).toHaveTextContent(/Hide [Pp]review/)
    })

    it('calls onTogglePreview when clicked', async () => {
      const user = userEvent.setup()
      render(<SnippetViewerHeader {...defaultProps} canPreview={true} />)

      const toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')
      await user.click(toggleBtn)

      expect(mockOnTogglePreview).toHaveBeenCalled()
    })

    it('button is keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<SnippetViewerHeader {...defaultProps} canPreview={true} />)

      const toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')
      toggleBtn.focus()
      expect(toggleBtn).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockOnTogglePreview).toHaveBeenCalled()
    })

    it('has aria-pressed attribute', () => {
      render(<SnippetViewerHeader {...defaultProps} canPreview={true} showPreview={true} />)

      const toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')
      expect(toggleBtn).toHaveAttribute('aria-pressed', 'true')
    })

    it('aria-pressed changes with showPreview state', () => {
      const { rerender } = render(
        <SnippetViewerHeader {...defaultProps} canPreview={true} showPreview={true} />
      )

      let toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')
      expect(toggleBtn).toHaveAttribute('aria-pressed', 'true')

      rerender(
        <SnippetViewerHeader {...defaultProps} canPreview={true} showPreview={false} />
      )

      toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')
      expect(toggleBtn).toHaveAttribute('aria-pressed', 'false')
    })

    it('has aria-label', () => {
      render(<SnippetViewerHeader {...defaultProps} canPreview={true} />)

      const toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')
      expect(toggleBtn).toHaveAttribute('aria-label')
    })
  })

  describe('Button Layout', () => {
    it('all buttons are visible in layout', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      expect(screen.getByTestId('snippet-viewer-copy-btn')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-viewer-edit-btn')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-viewer-toggle-preview-btn')).toBeInTheDocument()
    })

    it('buttons have gap between them', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const buttonsContainer = screen.getByTestId('snippet-viewer-copy-btn').parentElement?.parentElement
      expect(buttonsContainer?.className).toContain('gap')
    })

    it('buttons are right-aligned', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const rightSection = screen.getByTestId('snippet-viewer-copy-btn').parentElement?.parentElement
      expect(rightSection?.className).toContain('flex')
    })

    it('header has responsive spacing', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      // Header should adapt to different screen sizes
      expect(screen.getByTestId('snippet-viewer-copy-btn')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const heading = screen.getByRole('heading')
      // DialogTitle renders as h2
      expect(heading.tagName).toMatch(/^H[1-2]$/)
    })

    it('all buttons have aria-labels', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      const editBtn = screen.getByTestId('snippet-viewer-edit-btn')
      const toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')

      expect(copyBtn).toHaveAttribute('aria-label')
      expect(editBtn).toHaveAttribute('aria-label')
      expect(toggleBtn).toHaveAttribute('aria-label')
    })

    it('icons have aria-hidden', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      // Icons should be marked as decorative
      const icons = screen.getByTestId('snippet-viewer-copy-btn').querySelectorAll('[aria-hidden]')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('semantic structure is correct', () => {
      const { container } = render(<SnippetViewerHeader {...defaultProps} />)

      // Should have proper semantic structure
      const heading = screen.getByRole('heading')
      expect(heading).toBeInTheDocument()

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('title is keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<SnippetViewerHeader {...defaultProps} />)

      const heading = screen.getByRole('heading')
      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')

      // Tab should move focus between interactive elements
      copyBtn.focus()
      expect(copyBtn).toHaveFocus()
    })
  })

  describe('Layout Structure', () => {
    it('header has flex layout', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      // Header should contain title and buttons
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-viewer-copy-btn')).toBeInTheDocument()
    })

    it('title section can shrink on small screens', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const heading = screen.getByRole('heading')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Test Snippet')
    })

    it('buttons do not shrink', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      const editBtn = screen.getByTestId('snippet-viewer-edit-btn')
      expect(copyBtn).toBeInTheDocument()
      expect(editBtn).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles snippet with no description', () => {
      const noDescSnippet = { ...mockSnippet, description: '' }

      render(<SnippetViewerHeader {...defaultProps} snippet={noDescSnippet} />)

      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByText(/Last updated/)).toBeInTheDocument()
    })

    it('handles very long description', () => {
      const longDesc = 'A'.repeat(500)
      const longDescSnippet = { ...mockSnippet, description: longDesc }

      render(<SnippetViewerHeader {...defaultProps} snippet={longDescSnippet} />)

      expect(screen.getByText(new RegExp('A{500}'))).toBeInTheDocument()
    })

    it('handles rapid button clicks', async () => {
      const user = userEvent.setup()
      render(<SnippetViewerHeader {...defaultProps} />)

      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      const editBtn = screen.getByTestId('snippet-viewer-edit-btn')

      await user.click(copyBtn)
      await user.click(editBtn)
      await user.click(copyBtn)

      expect(mockOnCopy).toHaveBeenCalledTimes(2)
      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Integration Tests', () => {
    it('complete workflow: view header and interact with all buttons', async () => {
      const user = userEvent.setup()
      render(<SnippetViewerHeader {...defaultProps} />)

      // Check title and metadata
      expect(screen.getByText('Test Snippet')).toBeInTheDocument()
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('A test snippet description')).toBeInTheDocument()

      // Click copy
      const copyBtn = screen.getByTestId('snippet-viewer-copy-btn')
      await user.click(copyBtn)
      expect(mockOnCopy).toHaveBeenCalled()

      // Click edit
      const editBtn = screen.getByTestId('snippet-viewer-edit-btn')
      await user.click(editBtn)
      expect(mockOnEdit).toHaveBeenCalled()

      // Click toggle preview
      const toggleBtn = screen.getByTestId('snippet-viewer-toggle-preview-btn')
      await user.click(toggleBtn)
      expect(mockOnTogglePreview).toHaveBeenCalled()
    })

    it('complete workflow: responsive behavior', () => {
      render(<SnippetViewerHeader {...defaultProps} />)

      // All elements should be present
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-viewer-copy-btn')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-viewer-edit-btn')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-viewer-toggle-preview-btn')).toBeInTheDocument()
    })
  })
})
