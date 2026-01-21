import { render, screen, fireEvent } from '@/test-utils'
import { CodeEditorSection } from '@/components/features/snippet-editor/CodeEditorSection'
import { InputParameter } from '@/lib/types'

// Mock the Monaco editor and SplitScreenEditor
jest.mock('@/components/features/snippet-editor/MonacoEditor', () => ({
  MonacoEditor: ({ value, onChange, language, height }: any) => (
    <div data-testid="monaco-editor" data-language={language} data-height={height}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="monaco-textarea"
      />
    </div>
  ),
}))

jest.mock('@/components/features/snippet-editor/SplitScreenEditor', () => ({
  SplitScreenEditor: ({ value, onChange, language, height }: any) => (
    <div data-testid="split-screen-editor" data-language={language} data-height={height}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="split-screen-textarea"
      />
    </div>
  ),
}))

describe('CodeEditorSection', () => {
  const mockInputParameters: InputParameter[] = [
    { name: 'param1', type: 'string', defaultValue: 'test', description: 'A test param' },
  ]

  const defaultProps = {
    code: 'const x = 1;',
    language: 'JavaScript',
    hasPreview: false,
    functionName: 'testFunc',
    inputParameters: mockInputParameters,
    errors: {},
    onCodeChange: jest.fn(),
    onPreviewChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render code editor section', () => {
      render(<CodeEditorSection {...defaultProps} />)
      expect(screen.getByText('Code *')).toBeInTheDocument()
    })

    it('should render the code label', () => {
      render(<CodeEditorSection {...defaultProps} />)
      const label = screen.getByText('Code *')
      expect(label).toBeInTheDocument()
    })

    it('should display error message when code error exists', () => {
      const errorProps = {
        ...defaultProps,
        errors: { code: 'Invalid code syntax' },
      }
      render(<CodeEditorSection {...errorProps} />)
      expect(screen.getByText('Invalid code syntax')).toBeInTheDocument()
      expect(screen.getByTestId('code-error-message')).toBeInTheDocument()
    })

    it('should not display error message when no error exists', () => {
      render(<CodeEditorSection {...defaultProps} />)
      expect(screen.queryByTestId('code-error-message')).not.toBeInTheDocument()
    })
  })

  describe('Preview Checkbox', () => {
    it('should show preview checkbox for supported languages', () => {
      render(<CodeEditorSection {...defaultProps} language="JSX" />)
      expect(screen.getByTestId('enable-preview-checkbox')).toBeInTheDocument()
    })

    it('should hide preview checkbox for unsupported languages', () => {
      render(<CodeEditorSection {...defaultProps} language="Python" />)
      expect(screen.queryByTestId('enable-preview-checkbox')).not.toBeInTheDocument()
    })

    it('should render preview label with correct text', () => {
      render(<CodeEditorSection {...defaultProps} language="JSX" />)
      expect(screen.getByText('Enable live preview')).toBeInTheDocument()
    })

    it('should call onPreviewChange when checkbox is toggled', () => {
      const onPreviewChange = jest.fn()
      render(
        <CodeEditorSection
          {...defaultProps}
          language="JSX"
          onPreviewChange={onPreviewChange}
        />
      )
      const checkbox = screen.getByTestId('enable-preview-checkbox')
      fireEvent.click(checkbox)
      expect(onPreviewChange).toHaveBeenCalled()
    })

    it('should reflect checked state of preview checkbox', () => {
      const { rerender } = render(
        <CodeEditorSection {...defaultProps} language="JSX" hasPreview={false} />
      )
      const checkbox = screen.getByTestId('enable-preview-checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      rerender(
        <CodeEditorSection {...defaultProps} language="JSX" hasPreview={true} />
      )
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Editor Display', () => {
    it('should render SplitScreenEditor when preview is enabled and supported', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="JSX"
          hasPreview={true}
        />
      )
      expect(screen.getByTestId('split-screen-editor')).toBeInTheDocument()
      expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument()
    })

    it('should render MonacoEditor when preview is disabled', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="JavaScript"
          hasPreview={false}
        />
      )
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.queryByTestId('split-screen-editor')).not.toBeInTheDocument()
    })

    it('should pass correct props to MonacoEditor', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="JavaScript"
          code="console.log('test');"
        />
      )
      const editor = screen.getByTestId('monaco-editor')
      expect(editor).toHaveAttribute('data-language', 'JavaScript')
      expect(editor).toHaveAttribute('data-height', '400px')
    })

    it('should pass correct props to SplitScreenEditor', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="JSX"
          hasPreview={true}
          code="<div>Test</div>"
        />
      )
      const editor = screen.getByTestId('split-screen-editor')
      expect(editor).toHaveAttribute('data-language', 'JSX')
      expect(editor).toHaveAttribute('data-height', '500px')
    })
  })

  describe('Code Changes', () => {
    it('should call onCodeChange when code is modified in MonacoEditor', () => {
      const onCodeChange = vi.fn()
      render(
        <CodeEditorSection
          {...defaultProps}
          language="JavaScript"
          onCodeChange={onCodeChange}
        />
      )
      const textarea = screen.getByTestId('monaco-textarea')
      fireEvent.change(textarea, { target: { value: 'new code' } })
      expect(onCodeChange).toHaveBeenCalledWith('new code')
    })

    it('should call onCodeChange when code is modified in SplitScreenEditor', () => {
      const onCodeChange = vi.fn()
      render(
        <CodeEditorSection
          {...defaultProps}
          language="JSX"
          hasPreview={true}
          onCodeChange={onCodeChange}
        />
      )
      const textarea = screen.getByTestId('split-screen-textarea')
      fireEvent.change(textarea, { target: { value: 'new jsx code' } })
      expect(onCodeChange).toHaveBeenCalledWith('new jsx code')
    })
  })

  describe('Error Styling', () => {
    it('should apply error styling to editor container when error exists', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="JavaScript"
          errors={{ code: 'Syntax error' }}
        />
      )
      const container = screen.getByTestId('code-editor-container')
      expect(container).toHaveClass('border-destructive')
      expect(container).toHaveClass('ring-2')
    })

    it('should not apply error styling when no error exists', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="JavaScript"
          errors={{}}
        />
      )
      const container = screen.getByTestId('code-editor-container')
      expect(container).not.toHaveClass('border-destructive')
    })

    it('should apply error styling to split screen container', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          language="JSX"
          hasPreview={true}
          errors={{ code: 'Preview error' }}
        />
      )
      const container = screen.getByTestId('split-screen-editor-container')
      expect(container).toHaveClass('ring-2')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label for preview checkbox', () => {
      render(<CodeEditorSection {...defaultProps} language="JSX" />)
      const checkbox = screen.getByTestId('enable-preview-checkbox')
      expect(checkbox).toHaveAttribute('aria-label', 'Enable live preview')
    })

    it('should have proper aria-label for preview label', () => {
      render(<CodeEditorSection {...defaultProps} language="JSX" />)
      const label = screen.getByTestId('enable-preview-label')
      expect(label.textContent).toContain('Enable live preview')
    })

    it('should have aria-invalid on editor container with error', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          errors={{ code: 'Error message' }}
        />
      )
      const container = screen.getByTestId('code-editor-container')
      expect(container).toHaveAttribute('aria-invalid', 'true')
    })

    it('should have aria-describedby for error message', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          errors={{ code: 'Error message' }}
        />
      )
      const container = screen.getByTestId('code-editor-container')
      expect(container).toHaveAttribute('aria-describedby', 'code-error')
    })

    it('should have role=region for editor container', () => {
      render(<CodeEditorSection {...defaultProps} />)
      const container = screen.getByTestId('code-editor-container')
      expect(container).toHaveAttribute('role', 'region')
    })

    it('should have role=alert for error message', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          errors={{ code: 'Error' }}
        />
      )
      const error = screen.getByTestId('code-error-message')
      expect(error).toHaveAttribute('role', 'alert')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty code', () => {
      render(<CodeEditorSection {...defaultProps} code="" />)
      const textarea = screen.getByTestId('monaco-textarea')
      expect(textarea).toHaveValue('')
    })

    it('should handle very long code strings', () => {
      const longCode = 'const x = 1;'.repeat(1000)
      render(<CodeEditorSection {...defaultProps} code={longCode} />)
      const textarea = screen.getByTestId('monaco-textarea')
      expect(textarea).toHaveValue(longCode)
    })

    it('should handle code with special characters', () => {
      const specialCode = 'const regex = /[\\w-]+/g;'
      render(<CodeEditorSection {...defaultProps} code={specialCode} />)
      const textarea = screen.getByTestId('monaco-textarea')
      expect(textarea).toHaveValue(specialCode)
    })

    it('should handle empty input parameters', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          inputParameters={[]}
        />
      )
      expect(screen.getByText('Code *')).toBeInTheDocument()
    })

    it('should handle multiple errors in object', () => {
      render(
        <CodeEditorSection
          {...defaultProps}
          errors={{ code: 'Code error' }}
        />
      )
      expect(screen.getByText('Code error')).toBeInTheDocument()
    })
  })

  describe('Language Variants', () => {
    const supportedLanguages = ['JSX', 'TSX', 'JavaScript', 'TypeScript']
    const unsupportedLanguages = ['Python', 'Java', 'C++', 'CSS']

    supportedLanguages.forEach((lang) => {
      it(`should show preview checkbox for ${lang}`, () => {
        render(<CodeEditorSection {...defaultProps} language={lang} />)
        expect(screen.getByTestId('enable-preview-checkbox')).toBeInTheDocument()
      })
    })

    unsupportedLanguages.forEach((lang) => {
      it(`should not show preview checkbox for ${lang}`, () => {
        render(<CodeEditorSection {...defaultProps} language={lang} />)
        expect(screen.queryByTestId('enable-preview-checkbox')).not.toBeInTheDocument()
      })
    })
  })
})
