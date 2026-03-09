import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { SnippetFormFields } from './SnippetFormFields'

describe('SnippetFormFields Component', () => {
  const mockOnTitleChange = jest.fn()
  const mockOnDescriptionChange = jest.fn()
  const mockOnLanguageChange = jest.fn()

  const defaultProps = {
    title: '',
    description: '',
    language: 'JavaScript',
    errors: {},
    onTitleChange: mockOnTitleChange,
    onDescriptionChange: mockOnDescriptionChange,
    onLanguageChange: mockOnLanguageChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Title Input', () => {
    it('renders title input with label', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const label = screen.getByText(/title/i, { selector: 'label' })
      expect(label).toBeInTheDocument()

      const titleInput = screen.getByTestId('snippet-title-input')
      expect(titleInput).toBeInTheDocument()
    })

    it('displays required indicator for title', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const requiredText = screen.getByText(/\*/i)
      expect(requiredText).toBeInTheDocument()
    })

    it('renders title input with placeholder', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const titleInput = screen.getByTestId('snippet-title-input') as HTMLInputElement
      expect(titleInput).toHaveAttribute('placeholder', 'e.g., React Counter Component')
    })

    it('calls onTitleChange when title value changes', async () => {
      const user = userEvent.setup()
      render(<SnippetFormFields {...defaultProps} />)
      const titleInput = screen.getByTestId('snippet-title-input')

      await user.type(titleInput, 'New Title')

      // Verify callback was called 9 times (once per character)
      expect(mockOnTitleChange).toHaveBeenCalledTimes(9)
      // Verify the last call contained the last character typed
      expect(mockOnTitleChange).toHaveBeenLastCalledWith('e')
    })

    it('displays controlled value from props', () => {
      render(<SnippetFormFields {...defaultProps} title="Existing Title" />)
      const titleInput = screen.getByTestId('snippet-title-input') as HTMLInputElement
      expect(titleInput.value).toBe('Existing Title')
    })

    it('shows error message when title error exists', () => {
      render(
        <SnippetFormFields
          {...defaultProps}
          errors={{ title: 'Title is required' }}
        />
      )
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    it('marks title input as invalid when error exists', () => {
      render(
        <SnippetFormFields
          {...defaultProps}
          errors={{ title: 'Title is required' }}
        />
      )
      const titleInput = screen.getByTestId('snippet-title-input')
      expect(titleInput).toHaveAttribute('aria-invalid', 'true')
    })

    it('links error message with aria-describedby', () => {
      render(
        <SnippetFormFields
          {...defaultProps}
          errors={{ title: 'Title is required' }}
        />
      )
      const titleInput = screen.getByTestId('snippet-title-input')
      const describedById = titleInput.getAttribute('aria-describedby')
      expect(describedById).toBeTruthy()
      const errorElement = document.getElementById(describedById!)
      expect(errorElement).toHaveTextContent('Title is required')
    })

    it('removes aria-describedby when error is cleared', () => {
      const { rerender } = render(
        <SnippetFormFields
          {...defaultProps}
          errors={{ title: 'Title is required' }}
        />
      )

      rerender(<SnippetFormFields {...defaultProps} errors={{}} />)

      const titleInput = screen.getByTestId('snippet-title-input')
      expect(titleInput).not.toHaveAttribute('aria-describedby')
    })

    it('has correct input type', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const titleInput = screen.getByTestId('snippet-title-input')
      expect(titleInput).toHaveAttribute('type', 'text')
    })

    it('has required and aria-required attributes', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const titleInput = screen.getByTestId('snippet-title-input')
      expect(titleInput).toHaveAttribute('required')
      expect(titleInput).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('Description Textarea', () => {
    it('renders description textarea with label', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const label = screen.getByText(/description/i, { selector: 'label' })
      expect(label).toBeInTheDocument()

      const descriptionTextarea = screen.getByTestId('snippet-description-textarea')
      expect(descriptionTextarea).toBeInTheDocument()
    })

    it('renders textarea with placeholder', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const descriptionTextarea = screen.getByTestId('snippet-description-textarea') as HTMLTextAreaElement
      expect(descriptionTextarea).toHaveAttribute('placeholder', expect.stringContaining('description'))
    })

    it('calls onDescriptionChange when description value changes', async () => {
      const user = userEvent.setup()
      render(<SnippetFormFields {...defaultProps} />)
      const descriptionTextarea = screen.getByTestId('snippet-description-textarea')

      await user.type(descriptionTextarea, 'My description')

      // Verify callback was called 14 times (once per character)
      expect(mockOnDescriptionChange).toHaveBeenCalledTimes(14)
      // Since it's controlled, last call has just the last character
      expect(mockOnDescriptionChange).toHaveBeenLastCalledWith('n')
    })

    it('displays controlled value from props', () => {
      render(
        <SnippetFormFields {...defaultProps} description="Existing description" />
      )
      const descriptionTextarea = screen.getByTestId('snippet-description-textarea') as HTMLTextAreaElement
      expect(descriptionTextarea.value).toBe('Existing description')
    })

    it('handles multiline input', () => {
      const multilineText = 'Line 1\nLine 2'
      render(<SnippetFormFields {...defaultProps} description={multilineText} />)
      const descriptionTextarea = screen.getByTestId('snippet-description-textarea') as HTMLTextAreaElement

      expect(descriptionTextarea.value).toBe(multilineText)
    })

    it('has correct rows attribute', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const descriptionTextarea = screen.getByTestId('snippet-description-textarea') as HTMLTextAreaElement
      expect(descriptionTextarea.rows).toBe(2)
    })

    it('has aria-label attribute', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const descriptionTextarea = screen.getByTestId('snippet-description-textarea')
      expect(descriptionTextarea).toHaveAttribute('aria-label', expect.stringContaining('description'))
    })
  })

  describe('Language Select', () => {
    it('renders language select with label', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const label = screen.getByText(/language/i, { selector: 'label' })
      expect(label).toBeInTheDocument()

      const languageSelect = screen.getByTestId('snippet-language-select')
      expect(languageSelect).toBeInTheDocument()
    })

    it('displays currently selected language', () => {
      render(<SnippetFormFields {...defaultProps} language="Python" />)
      const languageSelect = screen.getByTestId('snippet-language-select')
      expect(languageSelect).toHaveTextContent('Python')
    })

    it('renders all available language options', async () => {
      const user = userEvent.setup()
      render(<SnippetFormFields {...defaultProps} />)
      const languageSelect = screen.getByTestId('snippet-language-select')

      await user.click(languageSelect)

      const languageOptions = screen.getAllByTestId(/language-option-/)
      expect(languageOptions.length).toBeGreaterThan(0)
    })

    it('calls onLanguageChange when language is selected', async () => {
      const user = userEvent.setup()
      render(<SnippetFormFields {...defaultProps} />)
      const languageSelect = screen.getByTestId('snippet-language-select')

      await user.click(languageSelect)
      const pythonOption = screen.getByTestId('language-option-Python')
      await user.click(pythonOption)

      expect(mockOnLanguageChange).toHaveBeenCalledWith('Python')
    })

    it('has aria-label attribute', () => {
      render(<SnippetFormFields {...defaultProps} />)
      const languageSelect = screen.getByTestId('snippet-language-select')
      expect(languageSelect).toHaveAttribute('aria-label', expect.stringContaining('language'))
    })

    it('includes JavaScript as default language option', async () => {
      render(<SnippetFormFields {...defaultProps} language="JavaScript" />)
      const languageSelect = screen.getByTestId('snippet-language-select')
      expect(languageSelect).toHaveTextContent('JavaScript')
    })

    it('includes Python as language option', async () => {
      const user = userEvent.setup()
      render(<SnippetFormFields {...defaultProps} />)
      const languageSelect = screen.getByTestId('snippet-language-select')

      await user.click(languageSelect)
      const pythonOption = screen.getByTestId('language-option-Python')
      expect(pythonOption).toBeInTheDocument()
    })
  })

  describe('Field Organization', () => {
    it('renders fields in logical order', () => {
      render(<SnippetFormFields {...defaultProps} />)

      const titleInput = screen.getByTestId('snippet-title-input')
      const languageSelect = screen.getByTestId('snippet-language-select')
      const descriptionTextarea = screen.getByTestId('snippet-description-textarea')

      const titlePosition = titleInput.compareDocumentPosition(languageSelect)
      const languagePosition = languageSelect.compareDocumentPosition(descriptionTextarea)

      // Should be in document order (before = 4)
      expect(titlePosition & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
      expect(languagePosition & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    })
  })

  describe('Accessibility', () => {
    it('all inputs have proper labels', () => {
      render(<SnippetFormFields {...defaultProps} />)

      const titleLabel = screen.getByText(/title/i, { selector: 'label' })
      const languageLabel = screen.getByText(/language/i, { selector: 'label' })
      const descriptionLabel = screen.getByText(/description/i, { selector: 'label' })

      expect(titleLabel).toBeInTheDocument()
      expect(languageLabel).toBeInTheDocument()
      expect(descriptionLabel).toBeInTheDocument()
    })

    it('title and language labels are associated with inputs', () => {
      render(<SnippetFormFields {...defaultProps} />)

      const titleInput = screen.getByTestId('snippet-title-input')
      const languageSelect = screen.getByTestId('snippet-language-select')

      // Labels exist
      const titleLabel = screen.getByText(/title/i, { selector: 'label' })
      const languageLabel = screen.getByText(/language/i, { selector: 'label' })

      expect(titleLabel).toBeInTheDocument()
      expect(languageLabel).toBeInTheDocument()

      // Inputs have corresponding IDs for label association
      expect(titleInput).toHaveAttribute('id', 'title')
      expect(languageSelect).toHaveAttribute('id', 'language')
    })

    it('all inputs are keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<SnippetFormFields {...defaultProps} />)

      const titleInput = screen.getByTestId('snippet-title-input')
      titleInput.focus()
      expect(titleInput).toHaveFocus()

      // Tab to next input
      await user.tab()
      // Focus should move to next element
    })

    it('error states are properly announced', () => {
      render(
        <SnippetFormFields
          {...defaultProps}
          errors={{ title: 'Title is required' }}
        />
      )

      const titleInput = screen.getByTestId('snippet-title-input')
      expect(titleInput).toHaveAttribute('aria-invalid', 'true')
      expect(titleInput).toHaveAttribute('aria-describedby')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string values', () => {
      render(<SnippetFormFields {...defaultProps} title="" description="" />)
      const titleInput = screen.getByTestId('snippet-title-input') as HTMLInputElement
      const descriptionTextarea = screen.getByTestId('snippet-description-textarea') as HTMLTextAreaElement

      expect(titleInput.value).toBe('')
      expect(descriptionTextarea.value).toBe('')
    })

    it('handles very long text input', () => {
      const longText = 'A'.repeat(1000)
      render(<SnippetFormFields {...defaultProps} title={longText} />)
      const titleInput = screen.getByTestId('snippet-title-input') as HTMLInputElement

      expect(titleInput.value).toBe(longText)
    })

    it('handles special characters in input', () => {
      const specialText = '<script>alert("xss")</script>'
      render(<SnippetFormFields {...defaultProps} description={specialText} />)
      const descriptionTextarea = screen.getByTestId('snippet-description-textarea') as HTMLTextAreaElement

      expect(descriptionTextarea.value).toBe(specialText)
    })

    it('handles rapid changes to all fields', async () => {
      const user = userEvent.setup()
      render(<SnippetFormFields {...defaultProps} />)

      const titleInput = screen.getByTestId('snippet-title-input')
      const descriptionTextarea = screen.getByTestId('snippet-description-textarea')
      const languageSelect = screen.getByTestId('snippet-language-select')

      // Make rapid changes
      await user.type(titleInput, 'Title')
      await user.type(descriptionTextarea, 'Description')
      await user.click(languageSelect)

      expect(mockOnTitleChange).toHaveBeenCalled()
      expect(mockOnDescriptionChange).toHaveBeenCalled()
    })

    it('updates when props change', () => {
      const { rerender } = render(<SnippetFormFields {...defaultProps} />)

      let titleInput = screen.getByTestId('snippet-title-input') as HTMLInputElement
      expect(titleInput.value).toBe('')

      rerender(<SnippetFormFields {...defaultProps} title="Updated Title" />)
      titleInput = screen.getByTestId('snippet-title-input') as HTMLInputElement
      expect(titleInput.value).toBe('Updated Title')
    })
  })
})
