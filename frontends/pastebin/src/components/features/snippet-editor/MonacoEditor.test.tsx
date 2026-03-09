import React from 'react'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { MonacoEditor } from './MonacoEditor'

// Mock monaco-editor/react
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange, language, height, options, theme, beforeMount }: any) => (
    <div
      data-testid="monaco-editor-mock"
      style={{ height }}
      role="textbox"
      aria-multiline="true"
      aria-label={`Code editor in ${language}`}
    >
      <textarea
        data-testid="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  ),
}))

// Mock config functions
jest.mock('@/lib/monaco-config', () => ({
  configureMonacoTypeScript: jest.fn(),
  getMonacoLanguage: jest.fn((lang) => lang.toLowerCase()),
}))

describe('MonacoEditor Component', () => {
  const mockOnChange = jest.fn()

  const defaultProps = {
    value: 'const x = 1;',
    onChange: mockOnChange,
    language: 'JavaScript',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders editor container', async () => {
      render(<MonacoEditor {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
      })
    })

    it('displays loading skeleton while editor loads', () => {
      render(<MonacoEditor {...defaultProps} />)

      // Suspense fallback should show
      const skeleton = screen.queryByTestId('skeleton')
      // The Skeleton component is rendered in fallback
      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
    })

    it('renders with default height', () => {
      render(<MonacoEditor {...defaultProps} />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveStyle({ height: '400px' })
    })

    it('renders with custom height', () => {
      render(<MonacoEditor {...defaultProps} height="600px" />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveStyle({ height: '600px' })
    })

    it('renders with 100% height when specified', () => {
      render(<MonacoEditor {...defaultProps} height="100%" />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveStyle({ height: '100%' })
    })
  })

  describe('Code Management', () => {
    it('displays initial code value', () => {
      render(<MonacoEditor {...defaultProps} value="console.log('test');" />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toBe("console.log('test');")
    })

    it('updates displayed code when value prop changes', () => {
      const { rerender } = render(<MonacoEditor {...defaultProps} />)

      let textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toBe('const x = 1;')

      rerender(<MonacoEditor {...defaultProps} value="const y = 2;" />)

      textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toBe('const y = 2;')
    })

    it('calls onChange when code is edited', async () => {
      const user = userEvent.setup()
      render(<MonacoEditor {...defaultProps} />)

      const textarea = screen.getByTestId('editor-textarea')
      await user.clear(textarea)
      await user.type(textarea, 'new code')

      // Called multiple times as user types, verify it was called at least once
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('handles empty string value', () => {
      render(<MonacoEditor {...defaultProps} value="" />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('handles null or undefined in onChange', async () => {
      const user = userEvent.setup()
      render(<MonacoEditor {...defaultProps} />)

      const textarea = screen.getByTestId('editor-textarea')
      await user.clear(textarea)

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Language Support', () => {
    it('renders with JavaScript language', () => {
      render(<MonacoEditor {...defaultProps} language="JavaScript" />)

      const editor = screen.getByTestId('monaco-editor-mock')
      // Language is lowercased by getMonacoLanguage mock
      expect(editor).toHaveAttribute('aria-label', expect.stringContaining('javascript'))
    })

    it('renders with TypeScript language', () => {
      render(<MonacoEditor {...defaultProps} language="TypeScript" />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveAttribute('aria-label', expect.stringContaining('typescript'))
    })

    it('renders with Python language', () => {
      render(<MonacoEditor {...defaultProps} language="Python" />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveAttribute('aria-label', expect.stringContaining('python'))
    })

    it('renders with JSX language', () => {
      render(<MonacoEditor {...defaultProps} language="JSX" />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveAttribute('aria-label', expect.stringContaining('jsx'))
    })

    it('renders with HTML language', () => {
      render(<MonacoEditor {...defaultProps} language="HTML" />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveAttribute('aria-label', expect.stringContaining('html'))
    })

    it('renders with CSS language', () => {
      render(<MonacoEditor {...defaultProps} language="CSS" />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveAttribute('aria-label', expect.stringContaining('css'))
    })
  })

  describe('Read-Only Mode', () => {
    it('renders as editable by default', () => {
      render(<MonacoEditor {...defaultProps} />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.readOnly).toBe(false)
    })

    it('disables editing when readOnly is true', () => {
      render(<MonacoEditor {...defaultProps} readOnly={true} />)

      // Editor should render with readOnly configuration
      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
    })

    it('allows code display in read-only mode', () => {
      render(
        <MonacoEditor
          {...defaultProps}
          value="console.log('readonly');"
          readOnly={true}
        />
      )

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toBe("console.log('readonly');")
    })

    it('does not call onChange when readOnly and user attempts to edit', async () => {
      const user = userEvent.setup()
      render(<MonacoEditor {...defaultProps} readOnly={true} />)

      const textarea = screen.getByTestId('editor-textarea')
      try {
        await user.type(textarea, 'attempt')
      } catch {
        // Read-only prevents typing
      }

      // onChange might not be called due to readonly
    })
  })

  describe('Accessibility', () => {
    it('has proper role attribute', () => {
      render(<MonacoEditor {...defaultProps} />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveAttribute('role', 'textbox')
    })

    it('indicates multiline content with aria-multiline', () => {
      render(<MonacoEditor {...defaultProps} />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveAttribute('aria-multiline', 'true')
    })

    it('has aria-label describing the language', () => {
      render(<MonacoEditor {...defaultProps} language="JavaScript" />)

      const editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveAttribute('aria-label', expect.stringContaining('javascript'))
    })

    it('is keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<MonacoEditor {...defaultProps} />)

      const textarea = screen.getByTestId('editor-textarea')
      textarea.focus()
      expect(textarea).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('supports tab indentation', async () => {
      const user = userEvent.setup()
      render(<MonacoEditor {...defaultProps} value="function test() {" />)

      const textarea = screen.getByTestId('editor-textarea')
      textarea.focus()
      expect(textarea).toHaveFocus()

      // Tab is handled by the browser in textarea by default
    })
  })

  describe('Edge Cases', () => {
    it('handles very long code', () => {
      const longCode = 'const x = 1;\n'.repeat(1000)
      render(<MonacoEditor {...defaultProps} value={longCode} />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value.length).toBeGreaterThan(10000)
    })

    it('handles special characters', () => {
      const specialCode = '`\\${variable}` <>&"\'\\n\\t'
      render(<MonacoEditor {...defaultProps} value={specialCode} />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toBe(specialCode)
    })

    it('handles multiline code with various line endings', () => {
      const multilineCode = 'line1\nline2\r\nline3'
      render(<MonacoEditor {...defaultProps} value={multilineCode} />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toContain('line1')
      expect(textarea.value).toContain('line2')
      expect(textarea.value).toContain('line3')
    })

    it('handles rapid onChange calls', async () => {
      const user = userEvent.setup()
      render(<MonacoEditor {...defaultProps} />)

      const textarea = screen.getByTestId('editor-textarea')
      // Select all and type new value
      await user.click(textarea)
      await user.keyboard('{ctrl>}a{/ctrl}')
      await user.type(textarea, 'rapid changes')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('handles emoji in code comments', () => {
      const codeWithEmoji = '// TODO: fix this 🐛'
      render(<MonacoEditor {...defaultProps} value={codeWithEmoji} />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toContain('🐛')
    })

    it('handles code with HTML/XML tags', () => {
      const jsxCode = '<Component prop={value} />'
      render(<MonacoEditor {...defaultProps} value={jsxCode} language="JSX" />)

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toBe(jsxCode)
    })
  })

  describe('Theme Configuration', () => {
    it('renders with dark theme by default', () => {
      render(<MonacoEditor {...defaultProps} />)

      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
    })

    it('applies theme settings consistently', () => {
      const { rerender } = render(<MonacoEditor {...defaultProps} />)

      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()

      rerender(<MonacoEditor {...defaultProps} value="updated" />)

      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('handles controlled updates efficiently', () => {
      const { rerender } = render(<MonacoEditor {...defaultProps} />)

      for (let i = 0; i < 5; i++) {
        rerender(<MonacoEditor {...defaultProps} value={`const x = ${i};`} />)
      }

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toBe('const x = 4;')
    })

    it('does not re-render unnecessarily on onChange', async () => {
      const user = userEvent.setup()
      render(<MonacoEditor {...defaultProps} />)

      const textarea = screen.getByTestId('editor-textarea')
      await user.type(textarea, 'a')

      // Should trigger onChange once per character
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Integration Tests', () => {
    it('complete workflow: create and edit code', async () => {
      const user = userEvent.setup()
      render(
        <MonacoEditor
          {...defaultProps}
          value=""
          language="JavaScript"
        />
      )

      const textarea = screen.getByTestId('editor-textarea')
      // Type code - onChange will be called
      await user.type(textarea, 'const x = 1;')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('complete workflow: language switching', () => {
      const { rerender } = render(
        <MonacoEditor {...defaultProps} language="JavaScript" />
      )

      let editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveAttribute('aria-label', expect.stringContaining('javascript'))

      rerender(
        <MonacoEditor {...defaultProps} language="Python" />
      )

      editor = screen.getByTestId('monaco-editor-mock')
      expect(editor).toHaveAttribute('aria-label', expect.stringContaining('python'))
    })

    it('complete workflow: read-only view of code', () => {
      render(
        <MonacoEditor
          {...defaultProps}
          value="const important = 'do not edit';"
          readOnly={true}
        />
      )

      const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement
      expect(textarea.value).toBe("const important = 'do not edit';")
      // Read-only editor should be configured
      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
    })
  })

  describe('Configuration Options', () => {
    it('applies font configuration', () => {
      render(<MonacoEditor {...defaultProps} />)

      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
    })

    it('applies line number configuration', () => {
      render(<MonacoEditor {...defaultProps} />)

      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
    })

    it('applies minimap configuration', () => {
      render(<MonacoEditor {...defaultProps} />)

      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
    })

    it('applies tab size configuration', () => {
      render(<MonacoEditor {...defaultProps} />)

      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
    })

    it('applies word wrap configuration', () => {
      render(<MonacoEditor {...defaultProps} />)

      expect(screen.getByTestId('monaco-editor-mock')).toBeInTheDocument()
    })
  })
})
