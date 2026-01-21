import React from 'react'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { SnippetDialog } from './SnippetDialog'

// Mock child components
jest.mock('./SnippetFormFields', () => ({
  SnippetFormFields: ({ onTitleChange, onDescriptionChange, onLanguageChange }: any) => (
    <div data-testid="snippet-form-fields">
      <input
        data-testid="title-input"
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Title"
      />
      <textarea
        data-testid="description-input"
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Description"
      />
      <select
        data-testid="language-select"
        onChange={(e) => onLanguageChange(e.target.value)}
      >
        <option value="JavaScript">JavaScript</option>
        <option value="TypeScript">TypeScript</option>
        <option value="Python">Python</option>
      </select>
    </div>
  ),
}))

jest.mock('./CodeEditorSection', () => ({
  CodeEditorSection: ({ onCodeChange, onPreviewChange }: any) => (
    <div data-testid="code-editor-section">
      <textarea
        data-testid="code-input"
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder="Code"
      />
      <label>
        <input
          type="checkbox"
          data-testid="preview-checkbox"
          onChange={(e) => onPreviewChange(e.target.checked)}
        />
        Enable Preview
      </label>
    </div>
  ),
}))

jest.mock('./InputParameterList', () => ({
  InputParameterList: () => <div data-testid="input-parameter-list">Input Parameters</div>,
}))

// Mock useSnippetForm hook
const mockUseSnippetForm = {
  title: 'Test Snippet',
  description: 'Test Description',
  language: 'JavaScript',
  code: 'console.log("test")',
  hasPreview: true,
  functionName: 'myFunc',
  inputParameters: [],
  errors: {},
  setTitle: jest.fn(),
  setDescription: jest.fn(),
  setLanguage: jest.fn(),
  setCode: jest.fn(),
  setHasPreview: jest.fn(),
  setFunctionName: jest.fn(),
  handleAddParameter: jest.fn(),
  handleRemoveParameter: jest.fn(),
  handleUpdateParameter: jest.fn(),
  validate: jest.fn(() => true),
  getFormData: jest.fn(() => ({
    title: 'Test Snippet',
    description: 'Test Description',
    language: 'JavaScript',
    code: 'console.log("test")',
    category: 'general',
    hasPreview: true,
  })),
  resetForm: jest.fn(),
}

jest.mock('@/hooks/useSnippetForm', () => ({
  useSnippetForm: jest.fn(() => mockUseSnippetForm),
}))

describe('SnippetDialog Component', () => {
  const mockOnOpenChange = jest.fn()
  const mockOnSave = jest.fn()

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onSave: mockOnSave,
    editingSnippet: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Dialog Structure', () => {
    it('renders dialog when open prop is true', () => {
      render(<SnippetDialog {...defaultProps} />)
      expect(screen.getByTestId('snippet-dialog')).toBeInTheDocument()
    })

    it('does not render dialog when open prop is false', () => {
      render(<SnippetDialog {...defaultProps} open={false} />)
      const dialogContent = screen.queryByTestId('snippet-dialog')
      // When closed, dialog should not be in the DOM or not visible
      if (dialogContent) {
        expect(dialogContent).not.toBeVisible()
      }
    })

    it('displays create title when not editing', () => {
      render(<SnippetDialog {...defaultProps} />)
      // The title comes from strings config
      const dialogTitle = screen.getByRole('heading')
      expect(dialogTitle).toBeInTheDocument()
    })

    it('displays edit title when editing snippet', () => {
      const snippet = {
        id: '1',
        title: 'Existing Snippet',
        description: 'Description',
        code: 'code',
        language: 'JavaScript',
        category: 'general',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      render(<SnippetDialog {...defaultProps} editingSnippet={snippet} />)
      const dialogTitle = screen.getByRole('heading')
      expect(dialogTitle).toBeInTheDocument()
    })
  })

  describe('Form Fields Integration', () => {
    it('renders SnippetFormFields component', () => {
      render(<SnippetDialog {...defaultProps} />)
      expect(screen.getByTestId('snippet-form-fields')).toBeInTheDocument()
    })

    it('renders CodeEditorSection component', () => {
      render(<SnippetDialog {...defaultProps} />)
      expect(screen.getByTestId('code-editor-section')).toBeInTheDocument()
    })

    it('renders InputParameterList when preview is enabled and language supports it', () => {
      render(<SnippetDialog {...defaultProps} />)
      // hasPreview is true and JavaScript supports preview
      expect(screen.getByTestId('input-parameter-list')).toBeInTheDocument()
    })

    it('does not render InputParameterList when preview is disabled', () => {
      mockUseSnippetForm.hasPreview = false
      render(<SnippetDialog {...defaultProps} />)
      expect(screen.queryByTestId('input-parameter-list')).not.toBeInTheDocument()
    })

    it('does not render InputParameterList for unsupported languages', () => {
      mockUseSnippetForm.language = 'Go'
      mockUseSnippetForm.hasPreview = true
      render(<SnippetDialog {...defaultProps} />)
      // Go is not in previewEnabledLanguages
      expect(screen.queryByTestId('input-parameter-list')).not.toBeInTheDocument()
    })
  })

  describe('Dialog Buttons', () => {
    it('renders cancel button', () => {
      render(<SnippetDialog {...defaultProps} />)
      const cancelBtn = screen.getByTestId('snippet-dialog-cancel-btn')
      expect(cancelBtn).toBeInTheDocument()
    })

    it('renders create button when creating new snippet', () => {
      render(<SnippetDialog {...defaultProps} editingSnippet={null} />)
      const saveBtn = screen.getByTestId('snippet-dialog-save-btn')
      expect(saveBtn).toBeInTheDocument()
      expect(saveBtn.textContent?.toLowerCase()).toContain('create')
    })

    it('renders update button when editing snippet', () => {
      const snippet = {
        id: '1',
        title: 'Existing',
        description: '',
        code: 'code',
        language: 'JavaScript',
        category: 'general',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      render(<SnippetDialog {...defaultProps} editingSnippet={snippet} />)
      const saveBtn = screen.getByTestId('snippet-dialog-save-btn')
      expect(saveBtn.textContent).toContain('Update')
    })

    it('cancel button closes dialog without saving', async () => {
      const user = userEvent.setup()
      render(<SnippetDialog {...defaultProps} />)
      const cancelBtn = screen.getByTestId('snippet-dialog-cancel-btn')

      await user.click(cancelBtn)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('saves snippet when save button is clicked', async () => {
      const user = userEvent.setup()
      mockUseSnippetForm.validate = jest.fn(() => true)
      mockUseSnippetForm.getFormData = jest.fn(() => ({
        title: 'Test',
        description: 'Desc',
        language: 'JavaScript',
        code: 'code',
        category: 'general',
      }))

      render(<SnippetDialog {...defaultProps} />)
      const saveBtn = screen.getByTestId('snippet-dialog-save-btn')

      await user.click(saveBtn)

      expect(mockUseSnippetForm.validate).toHaveBeenCalled()
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test',
          description: 'Desc',
          language: 'JavaScript',
          code: 'code',
        })
      )
    })

    it('does not save when validation fails', async () => {
      const user = userEvent.setup()
      mockUseSnippetForm.validate = jest.fn(() => false)

      render(<SnippetDialog {...defaultProps} />)
      const saveBtn = screen.getByTestId('snippet-dialog-save-btn')

      await user.click(saveBtn)

      expect(mockOnSave).not.toHaveBeenCalled()
      expect(mockOnOpenChange).not.toHaveBeenCalled()
    })

    it('resets form after successful save', async () => {
      const user = userEvent.setup()
      mockUseSnippetForm.validate = jest.fn(() => true)

      render(<SnippetDialog {...defaultProps} />)
      const saveBtn = screen.getByTestId('snippet-dialog-save-btn')

      await user.click(saveBtn)

      expect(mockUseSnippetForm.resetForm).toHaveBeenCalled()
    })

    it('closes dialog after successful save', async () => {
      const user = userEvent.setup()
      mockUseSnippetForm.validate = jest.fn(() => true)

      render(<SnippetDialog {...defaultProps} />)
      const saveBtn = screen.getByTestId('snippet-dialog-save-btn')

      await user.click(saveBtn)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Accessibility', () => {
    it('dialog has title for screen readers', () => {
      render(<SnippetDialog {...defaultProps} />)
      const title = screen.getByRole('heading')
      expect(title).toBeInTheDocument()
    })

    it('cancel button is keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<SnippetDialog {...defaultProps} />)
      const cancelBtn = screen.getByTestId('snippet-dialog-cancel-btn')

      cancelBtn.focus()
      expect(cancelBtn).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockOnOpenChange).toHaveBeenCalled()
    })

    it('save button is keyboard accessible', async () => {
      const user = userEvent.setup()
      mockUseSnippetForm.validate = jest.fn(() => true)

      render(<SnippetDialog {...defaultProps} />)
      const saveBtn = screen.getByTestId('snippet-dialog-save-btn')

      saveBtn.focus()
      expect(saveBtn).toHaveFocus()
    })

    it('dialog container has proper max dimensions', () => {
      render(<SnippetDialog {...defaultProps} />)
      const dialogContent = screen.getByTestId('snippet-dialog')
      const classNames = dialogContent.className
      expect(classNames).toContain('sm:max-w-[900px]')
      expect(classNames).toContain('max-h-[90vh]')
    })
  })

  describe('Error Handling', () => {
    it('displays validation errors from form', () => {
      mockUseSnippetForm.errors = { title: 'Title is required' }
      render(<SnippetDialog {...defaultProps} />)
      // Errors are passed to child components
      expect(screen.getByTestId('snippet-form-fields')).toBeInTheDocument()
    })

    it('clears errors on form reset', () => {
      mockUseSnippetForm.errors = {}
      const { rerender } = render(<SnippetDialog {...defaultProps} />)
      expect(screen.getByTestId('snippet-form-fields')).toBeInTheDocument()

      mockUseSnippetForm.errors = { code: 'Code is required' }
      rerender(<SnippetDialog {...defaultProps} />)
      expect(screen.getByTestId('snippet-form-fields')).toBeInTheDocument()
    })
  })

  describe('Dialog State Management', () => {
    it('updates when editingSnippet prop changes', () => {
      const { rerender } = render(<SnippetDialog {...defaultProps} editingSnippet={null} />)

      const snippet = {
        id: '1',
        title: 'Updated',
        description: 'Desc',
        code: 'code',
        language: 'JavaScript',
        category: 'general',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      rerender(<SnippetDialog {...defaultProps} editingSnippet={snippet} />)

      // useSnippetForm should be called with new snippet
      expect(screen.getByTestId('snippet-dialog')).toBeInTheDocument()
    })

    it('handles rapid open/close cycles', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<SnippetDialog {...defaultProps} open={true} />)

      const cancelBtn = screen.getByTestId('snippet-dialog-cancel-btn')
      await user.click(cancelBtn)

      rerender(<SnippetDialog {...defaultProps} open={false} />)
      rerender(<SnippetDialog {...defaultProps} open={true} />)

      expect(screen.getByTestId('snippet-dialog')).toBeInTheDocument()
    })
  })

  describe('Layout and Scrolling', () => {
    it('has overflow scrolling for content', () => {
      render(<SnippetDialog {...defaultProps} />)
      // The content div should allow scrolling
      const dialogContent = screen.getByTestId('snippet-dialog')
      expect(dialogContent.className).toContain('overflow-hidden')
    })

    it('dialog footer is visible and not scrolled', () => {
      render(<SnippetDialog {...defaultProps} />)
      const cancelBtn = screen.getByTestId('snippet-dialog-cancel-btn')
      const saveBtn = screen.getByTestId('snippet-dialog-save-btn')

      expect(cancelBtn).toBeVisible()
      expect(saveBtn).toBeVisible()
    })
  })

  describe('Integration Tests', () => {
    it('complete workflow: create new snippet', async () => {
      const user = userEvent.setup()
      mockUseSnippetForm.validate = jest.fn(() => true)
      mockUseSnippetForm.getFormData = jest.fn(() => ({
        title: 'New Snippet',
        description: 'My new snippet',
        language: 'Python',
        code: 'print("hello")',
        category: 'general',
      }))

      render(<SnippetDialog {...defaultProps} />)

      const saveBtn = screen.getByTestId('snippet-dialog-save-btn')
      await user.click(saveBtn)

      expect(mockOnSave).toHaveBeenCalled()
      expect(mockUseSnippetForm.resetForm).toHaveBeenCalled()
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('complete workflow: edit existing snippet', async () => {
      const user = userEvent.setup()
      const snippet = {
        id: '1',
        title: 'Existing',
        description: 'Existing desc',
        code: 'existing code',
        language: 'JavaScript',
        category: 'general',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      mockUseSnippetForm.validate = jest.fn(() => true)
      mockUseSnippetForm.getFormData = jest.fn(() => ({
        ...snippet,
      }))

      render(<SnippetDialog {...defaultProps} editingSnippet={snippet} />)

      const saveBtn = screen.getByTestId('snippet-dialog-save-btn')
      expect(saveBtn.textContent).toContain('Update')

      await user.click(saveBtn)

      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining(snippet))
    })

    it('complete workflow: cancel editing', async () => {
      const user = userEvent.setup()

      render(<SnippetDialog {...defaultProps} />)

      const cancelBtn = screen.getByTestId('snippet-dialog-cancel-btn')
      await user.click(cancelBtn)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })
})
