import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { CodeEditorSection } from '@/components/features/snippet-editor/CodeEditorSection'
import { InputParameter } from '@/lib/types'

// Mock the editor components
jest.mock('@/components/features/snippet-editor/MonacoEditor', () => ({
  MonacoEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Code editor"
    />
  ),
}))

jest.mock('@/components/features/snippet-editor/SplitScreenEditor', () => ({
  SplitScreenEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="split-screen-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Split screen editor"
    />
  ),
}))

jest.mock('@/components/features/file-tree/FileTree', () => ({
  FileTree: () => <div data-testid="file-tree" />,
}))

describe('CodeEditorSection Component', () => {
  const mockOnCodeChange = jest.fn()
  const mockOnPreviewChange = jest.fn()

  const defaultProps = {
    code: 'const test = () => {}',
    language: 'TSX',
    hasPreview: false,
    functionName: 'TestComponent',
    inputParameters: [],
    errors: {},
    onCodeChange: mockOnCodeChange,
    onPreviewChange: mockOnPreviewChange,
    files: [{ name: 'main.tsx', content: 'const test = () => {}' }],
    activeFile: 'main.tsx',
    onActiveFileSelect: jest.fn(),
    onFileAdd: jest.fn(),
    onFileDelete: jest.fn(),
    onFileRename: jest.fn(),
    onFileUpload: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<CodeEditorSection {...defaultProps} />)
      expect(screen.getByTestId('code-editor-container')).toBeInTheDocument()
    })

    it('should display Code label', () => {
      render(<CodeEditorSection {...defaultProps} />)
      expect(screen.getByText('Code *')).toBeInTheDocument()
    })

    it('should render code editor', () => {
      render(<CodeEditorSection {...defaultProps} />)
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })
  })

  describe('Preview Checkbox - Supported Languages', () => {
    it('should render preview checkbox for TSX language', () => {
      render(<CodeEditorSection {...defaultProps} language="TSX" />)
      expect(screen.getByTestId('enable-preview-checkbox')).toBeInTheDocument()
    })

    it('should render preview checkbox for JSX language', () => {
      render(<CodeEditorSection {...defaultProps} language="JSX" />)
      expect(screen.getByTestId('enable-preview-checkbox')).toBeInTheDocument()
    })

    it('should render preview checkbox for JavaScript language', () => {
      render(<CodeEditorSection {...defaultProps} language="JavaScript" />)
      expect(screen.getByTestId('enable-preview-checkbox')).toBeInTheDocument()
    })

    it('should render preview checkbox for TypeScript language', () => {
      render(<CodeEditorSection {...defaultProps} language="TypeScript" />)
      expect(screen.getByTestId('enable-preview-checkbox')).toBeInTheDocument()
    })

    it('should display preview label', () => {
      render(<CodeEditorSection {...defaultProps} language="TSX" />)
      expect(screen.getByTestId('enable-preview-label')).toBeInTheDocument()
    })

    it('should have correct label text for preview', () => {
      render(<CodeEditorSection {...defaultProps} language="TSX" />)
      expect(screen.getByText('Enable live preview')).toBeInTheDocument()
    })
  })

  describe('Preview Checkbox - Unsupported Languages', () => {
    it('should render preview checkbox for Python (supported)', () => {
      render(<CodeEditorSection {...defaultProps} language="Python" />)
      expect(screen.getByTestId('enable-preview-checkbox')).toBeInTheDocument()
    })

    it('should not render preview checkbox for HTML (unsupported)', () => {
      render(<CodeEditorSection {...defaultProps} language="HTML" />)
      expect(screen.queryByTestId('enable-preview-checkbox')).not.toBeInTheDocument()
    })
  })

  describe('Preview Checkbox Interaction', () => {
    it('should call onPreviewChange when checkbox is clicked', async () => {
      const user = userEvent.setup()
      render(<CodeEditorSection {...defaultProps} language="TSX" />)

      const checkbox = screen.getByTestId('enable-preview-checkbox')
      await user.click(checkbox)

      expect(mockOnPreviewChange).toHaveBeenCalledWith(true)
    })

    it('should toggle preview checkbox state', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <CodeEditorSection {...defaultProps} language="TSX" hasPreview={false} />
      )

      const checkbox = screen.getByTestId('enable-preview-checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await user.click(checkbox)
      expect(mockOnPreviewChange).toHaveBeenCalledWith(true)

      rerender(
        <CodeEditorSection {...defaultProps} language="TSX" hasPreview={true} />
      )

      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Editor Selection Based on Preview', () => {
    it('should render MonacoEditor when preview is disabled', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="TSX"
          hasPreview={false}
        />
      )
      expect(screen.getByTestId('code-editor-container')).toBeInTheDocument()
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })

    it('should render SplitScreenEditor when preview is enabled', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="TSX"
          hasPreview={true}
        />
      )
      expect(screen.getByTestId('split-screen-editor-container')).toBeInTheDocument()
      expect(screen.getByTestId('split-screen-editor')).toBeInTheDocument()
    })

    it('should render MonacoEditor if language is not supported even with hasPreview true', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="HTML"
          hasPreview={true}
        />
      )
      // Should show Monaco editor for unsupported language, not split screen
      expect(screen.getByTestId('code-editor-container')).toBeInTheDocument()
      expect(screen.queryByTestId('split-screen-editor')).not.toBeInTheDocument()
    })
  })

  describe('Code Input Handling', () => {
    it('should call onCodeChange when code is modified in MonacoEditor', async () => {
      render(<CodeEditorSection {...defaultProps} />)

      const editor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement
      fireEvent.change(editor, { target: { value: 'new code' } })

      expect(mockOnCodeChange).toHaveBeenCalledWith('new code')
    })

    it('should pass code prop to editor', () => {
      const customCode = 'console.log("test")'
      render(
        <CodeEditorSection
          {...defaultProps}
          code={customCode}
        />
      )
      const editor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement
      expect(editor.value).toBe(customCode)
    })
  })

  describe('Error Handling', () => {
    it('should display error message when code has error', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          errors={{ code: 'Syntax error on line 5' }}
        />
      )
      expect(screen.getByTestId('code-error-message')).toBeInTheDocument()
      expect(screen.getByText('Syntax error on line 5')).toBeInTheDocument()
    })

    it('should not display error message when there is no error', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          errors={{}}
        />
      )
      expect(screen.queryByTestId('code-error-message')).not.toBeInTheDocument()
    })

    it('should apply error styling when error exists', () => {
      const { container } = render(
        <CodeEditorSection
          {...defaultProps}
          errors={{ code: 'Error' }}
        />
      )
      const errorContainer = container.querySelector('[data-testid="code-editor-container"]')
      expect(errorContainer?.className).toContain('destructive')
    })

    it('should apply error styling to split screen editor', () => {
      const { container } = render(
        <CodeEditorSection
          {...defaultProps}
          language="TSX"
          hasPreview={true}
          errors={{ code: 'Error' }}
        />
      )
      const splitScreenContainer = container.querySelector('[data-testid="split-screen-editor-container"]')
      expect(splitScreenContainer?.className).toContain('ring-destructive')
    })
  })

  describe('Props Validation', () => {
    it('should accept all required props', () => {
      expect(() => {
        render(<CodeEditorSection {...defaultProps} />)
      }).not.toThrow()
    })

    it('should handle empty code string', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          code=""
        />
      )
      const editor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement
      expect(editor.value).toBe('')
    })

    it('should handle empty input parameters', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          inputParameters={[]}
        />
      )
      expect(screen.getByTestId('code-editor-container')).toBeInTheDocument()
    })

    it('should handle input parameters', () => {
      const params: InputParameter[] = [
        { name: 'count', type: 'number', defaultValue: '0', description: '' },
      ]
      render(
        <CodeEditorSection
          {...defaultProps}
          language="TSX"
          hasPreview={true}
          inputParameters={params}
        />
      )
      expect(screen.getByTestId('split-screen-editor-container')).toBeInTheDocument()
    })
  })

  describe('Editor Container Styling', () => {
    it('should render code editor container with proper classes', () => {
      const { container } = render(<CodeEditorSection {...defaultProps} />)
      const editorContainer = container.querySelector('[data-testid="code-editor-container"]')
      expect(editorContainer?.className).toContain('rounded-md')
      expect(editorContainer?.className).toContain('border')
    })

    it('should render code editor container with border styling', () => {
      const { container } = render(<CodeEditorSection {...defaultProps} />)
      const editorContainer = container.querySelector('[data-testid="code-editor-container"]')
      expect(editorContainer?.className).toContain('border-border')
    })
  })

  describe('Component Integration', () => {
    it('should integrate with MonacoEditor component', () => {
      render(<CodeEditorSection {...defaultProps} />)
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })

    it('should integrate with SplitScreenEditor component', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="TSX"
          hasPreview={true}
        />
      )
      expect(screen.getByTestId('split-screen-editor')).toBeInTheDocument()
    })

    it('should pass correct props to SplitScreenEditor', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="TSX"
          hasPreview={true}
          functionName="MyComponent"
        />
      )
      const splitScreenEditor = screen.getByTestId('split-screen-editor')
      expect(splitScreenEditor).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label for preview checkbox', () => {
      render(<CodeEditorSection {...defaultProps} language="TSX" />)
      expect(screen.getByLabelText('Enable live preview')).toBeInTheDocument()
    })

    it('should have accessible label for code input', () => {
      render(<CodeEditorSection {...defaultProps} />)
      expect(screen.getByText('Code *')).toBeInTheDocument()
    })

    it('should have error message with proper id attribute', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          errors={{ code: 'Error' }}
        />
      )
      const errorMsg = screen.getByTestId('code-error-message')
      expect(errorMsg.id).toBe('code-error')
    })
  })

  describe('Language Support Verification', () => {
    it('should verify supported languages show preview checkbox', () => {
      const supportedLanguages = ['JSX', 'TSX', 'JavaScript', 'TypeScript']
      supportedLanguages.forEach(lang => {
        const { unmount } = render(
          <CodeEditorSection {...defaultProps} language={lang} />
        )
        expect(screen.queryByTestId('enable-preview-checkbox')).toBeInTheDocument()
        unmount()
      })
    })

    it('should verify unsupported languages hide preview checkbox', () => {
      // Use languages that are NOT in previewEnabledLanguages
      const unsupportedLanguages = ['HTML', 'CSS', 'SQL', 'Go']
      unsupportedLanguages.forEach(lang => {
        const { unmount } = render(
          <CodeEditorSection {...defaultProps} language={lang} />
        )
        expect(screen.queryByTestId('enable-preview-checkbox')).not.toBeInTheDocument()
        unmount()
      })
    })
  })
})
