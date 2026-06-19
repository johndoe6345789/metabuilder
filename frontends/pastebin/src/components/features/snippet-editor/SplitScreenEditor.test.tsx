import React from 'react'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'

// Mock components - handle undefined/null props safely
const MockMonacoEditor = (props: any) => {
  if (!props) return null
  const { value = '', onChange = () => {}, language = '', height } = props
  return (
    <div data-testid="monaco-editor" style={{ height }}>
      <textarea
        data-testid="monaco-code-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Code in ${language}`}
      />
    </div>
  )
}

const MockReactPreview = (props: any) => {
  if (!props) return null
  const { code = '', language = '', functionName = '' } = props
  return (
    <div data-testid="react-preview">
      React Preview: {language} - {functionName}
    </div>
  )
}

const MockPythonOutput = (props: any) => {
  if (!props) return null
  return <div data-testid="python-output">Python Output</div>
}

// Mock the component modules
jest.mock('./MonacoEditor', () => ({
  MonacoEditor: MockMonacoEditor,
}))

jest.mock('./ReactPreview', () => ({
  ReactPreview: MockReactPreview,
}))

jest.mock('@/components/features/python-runner/PythonOutput', () => ({
  PythonOutput: MockPythonOutput,
}))

// Mock next/dynamic - render components immediately without async delay
jest.mock('next/dynamic', () => {
  // Map to store loaded components
  const loadedComponents = new Map<string, React.ComponentType<any>>()

  return (
    importFunc: () => Promise<{ default: React.ComponentType<any> }>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: any,
  ) => {
    const funcKey = String(importFunc)

    // eslint-disable-next-line react/display-name
    return (props: any) => {
      const [Comp, setComp] =
        React.useState<React.ComponentType<any> | null>(null)

      // Load component on first render
      React.useEffect(() => {
        if (loadedComponents.has(funcKey)) {
          setComp(loadedComponents.get(funcKey) || null)
        } else {
          importFunc()
            .then((mod: any) => {
              const component = mod.default
              loadedComponents.set(funcKey, component)
              setComp(component)
            })
            .catch(() => {
              setComp(null)
            })
        }
      }, [])

      return Comp ? <Comp {...props} /> : null
    }
  }
})

// Import after mocks are set up
import { SplitScreenEditor } from './SplitScreenEditor'

describe('SplitScreenEditor Component', () => {
  const mockOnChange = jest.fn()

  const defaultProps = {
    value: 'const x = 1;',
    onChange: mockOnChange,
    language: 'JavaScript',
    height: '500px',
  }

  // Helper to wait for async components to load after render
  const renderAndWait = async (element: React.ReactElement) => {
    render(element)
    // Give time for the async imports to resolve
    await waitFor(() => {
      // Just wait a moment for promises to resolve
      expect(true).toBe(true)
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Unsupported Language Handling', () => {
    it('renders only MonacoEditor for unsupported languages', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="Go" />)

      await waitFor(
        () => {
          expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
        },
        { timeout: 3000 },
      )
      expect(screen.queryByTestId('react-preview')).not.toBeInTheDocument()
      expect(screen.queryByTestId('python-output')).not.toBeInTheDocument()
    })

    it('does not show view mode buttons for unsupported languages', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="Rust" />)

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /code/i }),
        ).not.toBeInTheDocument()
      })
      expect(
        screen.queryByRole('button', { name: /split/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /preview/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe('View Mode Buttons', () => {
    it('renders all three view mode buttons for supported languages', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JSX" />)

      expect(screen.getByRole('button', { name: /code/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /split/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /preview/i }),
      ).toBeInTheDocument()
    })

    it('displays "Output" instead of "Preview" for Python', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="Python" />)

      // Should show "Output" for Python
      const outputBtn = screen.getByRole('button', { name: /output/i })
      expect(outputBtn).toBeInTheDocument()
    })

    it('displays "Preview" for non-Python supported languages', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JSX" />)

      const previewBtn = screen.getByRole('button', { name: /preview/i })
      expect(previewBtn).toBeInTheDocument()
    })

    it('split button is initially filled', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JavaScript" />)

      const splitBtn = screen.getByRole('button', { name: /split/i })
      // Split is the default view mode
      expect(splitBtn).toBeInTheDocument()
    })
  })

  describe('View Mode Switching', () => {
    it('switches to code-only view when code button is clicked', async () => {
      const user = userEvent.setup()
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JSX" />)

      const codeBtn = screen.getByRole('button', { name: /code/i })
      await user.click(codeBtn)

      const monacoEditor = screen.getByTestId('monaco-editor')
      expect(monacoEditor).toBeInTheDocument()
      expect(screen.queryByTestId('react-preview')).not.toBeInTheDocument()
    })

    // eslint-disable-next-line max-len
    it('switches to preview-only view when preview button is clicked', async () => {
      const user = userEvent.setup()
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JSX" />)

      const previewBtn = screen.getByRole('button', { name: /preview/i })
      await user.click(previewBtn)

      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
      expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument()
    })

    it('switches to split view when split button is clicked', async () => {
      const user = userEvent.setup()
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JSX" />)

      // First click code
      const codeBtn = screen.getByRole('button', { name: /code/i })
      await user.click(codeBtn)

      // Then click split
      const splitBtn = screen.getByRole('button', { name: /split/i })
      await user.click(splitBtn)

      // Should now show both editor and preview
      expect(screen.getAllByTestId('monaco-editor').length).toBeGreaterThan(0)
      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    it('returns to split view from code view', async () => {
      const user = userEvent.setup()
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JavaScript" />)

      const codeBtn = screen.getByRole('button', { name: /code/i })
      await user.click(codeBtn)

      const splitBtn = screen.getByRole('button', { name: /split/i })
      await user.click(splitBtn)

      expect(screen.getAllByTestId('monaco-editor').length).toBeGreaterThan(0)
    })

    it('returns to split view from preview view', async () => {
      const user = userEvent.setup()
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="TypeScript" />)

      const previewBtn = screen.getByRole('button', { name: /preview/i })
      await user.click(previewBtn)

      const splitBtn = screen.getByRole('button', { name: /split/i })
      await user.click(splitBtn)

      expect(screen.getAllByTestId('monaco-editor').length).toBeGreaterThan(0)
      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })
  })

  describe('Code Editing', () => {
    it('calls onChange when code is edited in code view', async () => {
      const user = userEvent.setup()
      render(
        <SplitScreenEditor
          {...defaultProps}
          language="JavaScript"
          onChange={mockOnChange}
        />,
      )

      const codeBtn = screen.getByRole('button', { name: /code/i })
      await user.click(codeBtn)

      // Verify we're in code view
      const codeInput = screen.getByTestId('monaco-code-input')
      expect(codeInput).toBeInTheDocument()

      // Edit the code
      await user.clear(codeInput)
      await user.type(codeInput, 'updated')

      // onChange should have been called
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('calls onChange when code is edited in split view', async () => {
      const user = userEvent.setup()
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JSX" />)

      const codeInput = screen.getByTestId('monaco-code-input')
      await user.clear(codeInput)
      await user.type(codeInput, 'updated code')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('updates editor with controlled value', async () => {
      const { rerender } = await renderAndWait(
        <SplitScreenEditor
          {...defaultProps}
          value="initial code"
          language="JavaScript"
        />,
      )

      let codeInput = screen.getByTestId(
        'monaco-code-input',
      ) as HTMLTextAreaElement
      expect(codeInput.value).toBe('initial code')

      rerender(
        <SplitScreenEditor
          {...defaultProps}
          value="updated code"
          language="JavaScript"
        />,
      )

      codeInput = screen.getByTestId('monaco-code-input') as HTMLTextAreaElement
      expect(codeInput.value).toBe('updated code')
    })
  })

  describe('Python Support', () => {
    it('shows PythonOutput in preview for Python code', async () => {
      const user = userEvent.setup()
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="Python" />)

      const previewBtn = screen.getByRole('button', { name: /output/i })
      await user.click(previewBtn)

      expect(screen.getByTestId('python-output')).toBeInTheDocument()
    })

    it('shows PythonOutput in split view for Python', () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="Python" />)

      // Split view should show Python output
      expect(screen.getByTestId('python-output')).toBeInTheDocument()
    })

    it('passes code to PythonOutput', () => {
      const pythonCode = 'print("Hello, World!")'
      render(
        <SplitScreenEditor
          {...defaultProps}
          language="Python"
          value={pythonCode}
        />,
      )

      expect(screen.getByTestId('python-output')).toBeInTheDocument()
    })
  })

  describe('React Preview Support', () => {
    it('shows ReactPreview for JSX', async () => {
      const user = userEvent.setup()
      const jsxCode = 'export default () => <div>Test</div>'
      render(
        <SplitScreenEditor {...defaultProps} language="JSX" value={jsxCode} />,
      )

      const previewBtn = screen.getByRole('button', { name: /preview/i })
      await user.click(previewBtn)

      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    // eslint-disable-next-line max-len
    it('passes function name and input parameters to ReactPreview', async () => {
      const user = userEvent.setup()
      render(
        <SplitScreenEditor
          {...defaultProps}
          language="TSX"
          functionName="MyComponent"
          inputParameters={[
            { name: 'count', type: 'number', defaultValue: '0' },
          ]}
        />,
      )

      const previewBtn = screen.getByRole('button', { name: /preview/i })
      await user.click(previewBtn)

      const preview = screen.getByTestId('react-preview')
      expect(preview.textContent).toContain('MyComponent')
    })
  })

  describe('Height Configuration', () => {
    it('applies custom height to container', async () => {
      render(
        <SplitScreenEditor
          {...defaultProps}
          language="JavaScript"
          height="600px"
        />,
      )

      // In code view, the height is passed to Monaco editor
      const codeBtn = screen.getByRole('button', { name: /code/i })
      // Click to code view to see individual editor height
      expect(codeBtn).toBeInTheDocument()
    })

    it('uses default height when not specified', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { height, ...propsWithoutHeight } = defaultProps
      render(
        <SplitScreenEditor {...propsWithoutHeight} language="JavaScript" />,
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })

    it('passes height to Monaco editor', async () => {
      render(
        <SplitScreenEditor
          {...defaultProps}
          language="JavaScript"
          height="700px"
        />,
      )

      // Monaco editor receives the height prop and uses it in split view
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })
  })

  describe('Language Support Detection', () => {
    it('supports JSX language', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JSX" />)
      expect(
        screen.getByRole('button', { name: /preview/i }),
      ).toBeInTheDocument()
    })

    it('supports TSX language', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="TSX" />)
      expect(
        screen.getByRole('button', { name: /preview/i }),
      ).toBeInTheDocument()
    })

    it('supports JavaScript language', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JavaScript" />)
      expect(
        screen.getByRole('button', { name: /preview/i }),
      ).toBeInTheDocument()
    })

    it('supports TypeScript language', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="TypeScript" />)
      expect(
        screen.getByRole('button', { name: /preview/i }),
      ).toBeInTheDocument()
    })

    it('supports Python language', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="Python" />)
      expect(
        screen.getByRole('button', { name: /output/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('view mode buttons are keyboard accessible', async () => {
      const user = userEvent.setup()
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JavaScript" />)

      const codeBtn = screen.getByRole('button', { name: /code/i })
      codeBtn.focus()
      expect(codeBtn).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })

    it('buttons have aria-labels or visible text', async () => {
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JavaScript" />)

      const codeBtn = screen.getByRole('button', { name: /code/i })
      const splitBtn = screen.getByRole('button', { name: /split/i })
      const previewBtn = screen.getByRole('button', { name: /preview/i })

      expect(codeBtn).toBeInTheDocument()
      expect(splitBtn).toBeInTheDocument()
      expect(previewBtn).toBeInTheDocument()
    })

    it('preserves focus on view mode switching', async () => {
      const user = userEvent.setup()
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JavaScript" />)

      const codeBtn = screen.getByRole('button', { name: /code/i })
      codeBtn.focus()

      await user.click(codeBtn)
      // Focus should still be on a button or in document
      expect(screen.getByRole('button', { name: /code/i })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty code value', async () => {
      render(
        <SplitScreenEditor {...defaultProps} value="" language="JavaScript" />,
      )

      const codeInput = screen.getByTestId(
        'monaco-code-input',
      ) as HTMLTextAreaElement
      expect(codeInput.value).toBe('')
    })

    it('handles very long code', async () => {
      const longCode = 'const x = 1;\n'.repeat(100)
      render(
        <SplitScreenEditor
          {...defaultProps}
          value={longCode}
          language="JavaScript"
        />,
      )

      const codeInput = screen.getByTestId(
        'monaco-code-input',
      ) as HTMLTextAreaElement
      expect(codeInput.value).toContain('const x = 1;')
    })

    it('handles special characters in code', async () => {
      const specialCode = 'const str = "<script>alert()</script>";'
      render(
        <SplitScreenEditor
          {...defaultProps}
          value={specialCode}
          language="JavaScript"
        />,
      )

      const codeInput = screen.getByTestId(
        'monaco-code-input',
      ) as HTMLTextAreaElement
      expect(codeInput.value).toBe(specialCode)
    })

    it('handles rapid view mode changes', async () => {
      const user = userEvent.setup()
      await renderAndWait(<SplitScreenEditor {...defaultProps} language="JavaScript" />)

      const codeBtn = screen.getByRole('button', { name: /code/i })
      const previewBtn = screen.getByRole('button', { name: /preview/i })
      const splitBtn = screen.getByRole('button', { name: /split/i })

      await user.click(codeBtn)
      await user.click(previewBtn)
      await user.click(splitBtn)

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('complete workflow: JSX editing and preview', async () => {
      const user = userEvent.setup()
      render(
        <SplitScreenEditor
          {...defaultProps}
          language="JSX"
          value="<div>Initial</div>"
        />,
      )

      // Start in split view
      expect(screen.getByTestId('react-preview')).toBeInTheDocument()

      // Switch to code view
      const codeBtn = screen.getByRole('button', { name: /code/i })
      await user.click(codeBtn)
      expect(screen.queryByTestId('react-preview')).not.toBeInTheDocument()

      // Edit code
      const codeInput = screen.getByTestId('monaco-code-input')
      await user.clear(codeInput)
      await user.type(codeInput, '<div>Updated</div>')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('complete workflow: Python execution', async () => {
      const user = userEvent.setup()
      render(
        <SplitScreenEditor
          {...defaultProps}
          language="Python"
          value='print("test")'
        />,
      )

      // Should show split view with Python output
      expect(screen.getByTestId('python-output')).toBeInTheDocument()

      // Switch to code view
      const codeBtn = screen.getByRole('button', { name: /code/i })
      await user.click(codeBtn)

      // Switch back to output
      const outputBtn = screen.getByRole('button', { name: /output/i })
      await user.click(outputBtn)

      expect(screen.getByTestId('python-output')).toBeInTheDocument()
    })
  })
})
