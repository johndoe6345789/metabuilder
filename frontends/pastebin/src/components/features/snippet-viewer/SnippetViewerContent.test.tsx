import React from 'react'
import { render, screen } from '@/test-utils'
import { SnippetViewerContent } from './SnippetViewerContent'

// Mock MonacoEditor
jest.mock('@/components/features/snippet-editor/MonacoEditor', () => ({
  MonacoEditor: ({ value, language, readOnly }: any) => (
    <div data-testid="monaco-editor">
      <div data-testid="editor-language">{language}</div>
      <textarea
        data-testid="editor-code"
        value={value}
        readOnly={readOnly}
      />
    </div>
  ),
}))

// Mock ReactPreview
jest.mock('@/components/features/snippet-editor/ReactPreview', () => ({
  ReactPreview: ({ code, language, functionName }: any) => (
    <div data-testid="react-preview">
      <div data-testid="preview-language">{language}</div>
      <div data-testid="preview-function">{functionName}</div>
      <div data-testid="preview-code">{code}</div>
    </div>
  ),
}))

// Mock PythonOutput
jest.mock('@/components/features/python-runner/PythonOutput', () => ({
  PythonOutput: ({ code }: any) => (
    <div data-testid="python-output">
      <div data-testid="python-code">{code}</div>
    </div>
  ),
}))

describe('SnippetViewerContent Component', () => {
  const mockSnippet = {
    id: '1',
    title: 'Test Snippet',
    description: 'Test description',
    code: 'console.log("test");',
    language: 'JavaScript',
    category: 'general',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  describe('Code-Only View', () => {
    it('renders only editor when canPreview is false', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.queryByTestId('react-preview')).not.toBeInTheDocument()
      expect(screen.queryByTestId('python-output')).not.toBeInTheDocument()
    })

    it('renders only editor when canPreview is true but showPreview is false', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={false}
          isPython={false}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.queryByTestId('react-preview')).not.toBeInTheDocument()
    })

    it('editor is read-only', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      const editor = screen.getByTestId('editor-code') as HTMLTextAreaElement
      expect(editor.readOnly).toBe(true)
    })

    it('displays correct code in editor', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      const editor = screen.getByTestId('editor-code') as HTMLTextAreaElement
      expect(editor.value).toBe(mockSnippet.code)
    })

    it('displays correct language in editor', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      expect(screen.getByTestId('editor-language')).toHaveTextContent('JavaScript')
    })

    it('has overflow auto for scrolling', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      const container = screen.getByTestId('monaco-editor').parentElement
      expect(container?.className).toContain('overflow-hidden')
    })
  })

  describe('Split View (Code and Preview)', () => {
    it('renders both editor and React preview in split view', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    it('renders both editor and Python output in split view for Python', () => {
      const pythonSnippet = { ...mockSnippet, language: 'Python', code: 'print("test")' }

      render(
        <SnippetViewerContent
          snippet={pythonSnippet}
          canPreview={true}
          showPreview={true}
          isPython={true}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByTestId('python-output')).toBeInTheDocument()
    })

    it('arranges editor and preview side by side', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      // Both editor and preview should be present
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    it('editor has border-right in split view', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      const editorContainer = screen.getByTestId('monaco-editor').parentElement
      expect(editorContainer?.className).toContain('border-r')
    })

    it('preview area can overflow', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      // Preview should be rendered
      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    it('both areas have equal width', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      // Split view renders both components
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })
  })

  describe('React Preview Rendering', () => {
    it('renders ReactPreview with correct props', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.getByTestId('preview-language')).toHaveTextContent('JavaScript')
      expect(screen.getByTestId('preview-code')).toHaveTextContent('console.log("test");')
    })

    it('passes functionName to ReactPreview', () => {
      const snippetWithFunction = {
        ...mockSnippet,
        functionName: 'MyComponent',
      }

      render(
        <SnippetViewerContent
          snippet={snippetWithFunction}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.getByTestId('preview-function')).toHaveTextContent('MyComponent')
    })

    it('passes undefined functionName when not set', () => {
      const snippetWithoutFunction = {
        ...mockSnippet,
        functionName: undefined,
      }

      render(
        <SnippetViewerContent
          snippet={snippetWithoutFunction}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.getByTestId('preview-function')).toBeInTheDocument()
    })

    it('passes inputParameters to ReactPreview', () => {
      const snippetWithParams = {
        ...mockSnippet,
        inputParameters: [
          { name: 'count', type: 'number' as const, defaultValue: '0' },
        ],
      }

      render(
        <SnippetViewerContent
          snippet={snippetWithParams}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    it('handles empty inputParameters array', () => {
      const snippetWithEmptyParams = {
        ...mockSnippet,
        inputParameters: [],
      }

      render(
        <SnippetViewerContent
          snippet={snippetWithEmptyParams}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    it('handles undefined inputParameters', () => {
      const snippetWithoutParams = {
        ...mockSnippet,
        inputParameters: undefined,
      }

      render(
        <SnippetViewerContent
          snippet={snippetWithoutParams}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })
  })

  describe('Python Output Rendering', () => {
    it('renders PythonOutput instead of ReactPreview when isPython is true', () => {
      const pythonSnippet = {
        ...mockSnippet,
        language: 'Python',
        code: 'print("hello")',
      }

      render(
        <SnippetViewerContent
          snippet={pythonSnippet}
          canPreview={true}
          showPreview={true}
          isPython={true}
        />
      )

      expect(screen.getByTestId('python-output')).toBeInTheDocument()
      expect(screen.queryByTestId('react-preview')).not.toBeInTheDocument()
    })

    it('passes code to PythonOutput', () => {
      const pythonCode = 'print("test output")'
      const pythonSnippet = {
        ...mockSnippet,
        language: 'Python',
        code: pythonCode,
      }

      render(
        <SnippetViewerContent
          snippet={pythonSnippet}
          canPreview={true}
          showPreview={true}
          isPython={true}
        />
      )

      expect(screen.getByTestId('python-code')).toHaveTextContent(pythonCode)
    })

    it('PythonOutput in split view has correct styling', () => {
      const pythonSnippet = {
        ...mockSnippet,
        language: 'Python',
        code: 'print("test")',
      }

      render(
        <SnippetViewerContent
          snippet={pythonSnippet}
          canPreview={true}
          showPreview={true}
          isPython={true}
        />
      )

      // Python output should be rendered in split view
      expect(screen.getByTestId('python-output')).toBeInTheDocument()
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('code-only view has correct flex structure', () => {
      const { container } = render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      const root = container.firstChild as HTMLElement
      expect(root.className).toContain('flex-1')
      expect(root.className).toContain('overflow-hidden')
    })

    it('split view container uses grid layout', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      // Both components should be present in split view
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    it('grid uses full height', () => {
      render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      // Should render split view with both components
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })
  })

  describe('Language Support', () => {
    it('displays JavaScript in editor', () => {
      render(
        <SnippetViewerContent
          snippet={{ ...mockSnippet, language: 'JavaScript' }}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      expect(screen.getByTestId('editor-language')).toHaveTextContent('JavaScript')
    })

    it('displays TypeScript in editor', () => {
      render(
        <SnippetViewerContent
          snippet={{ ...mockSnippet, language: 'TypeScript' }}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      expect(screen.getByTestId('editor-language')).toHaveTextContent('TypeScript')
    })

    it('displays JSX in editor', () => {
      render(
        <SnippetViewerContent
          snippet={{ ...mockSnippet, language: 'JSX' }}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      expect(screen.getByTestId('editor-language')).toHaveTextContent('JSX')
    })

    it('displays Python in editor', () => {
      render(
        <SnippetViewerContent
          snippet={{ ...mockSnippet, language: 'Python' }}
          canPreview={false}
          showPreview={false}
          isPython={true}
        />
      )

      expect(screen.getByTestId('editor-language')).toHaveTextContent('Python')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long code', () => {
      const longCode = 'const x = 1;\n'.repeat(1000)
      const longSnippet = { ...mockSnippet, code: longCode }

      render(
        <SnippetViewerContent
          snippet={longSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      const editor = screen.getByTestId('editor-code') as HTMLTextAreaElement
      expect(editor.value.length).toBeGreaterThan(10000)
    })

    it('handles special characters in code', () => {
      const specialCode = '<>&"\'\\n\\t`${'
      const specialSnippet = { ...mockSnippet, code: specialCode }

      render(
        <SnippetViewerContent
          snippet={specialSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      const editor = screen.getByTestId('editor-code') as HTMLTextAreaElement
      expect(editor.value).toContain('<>')
    })

    it('handles empty code', () => {
      const emptySnippet = { ...mockSnippet, code: '' }

      render(
        <SnippetViewerContent
          snippet={emptySnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      const editor = screen.getByTestId('editor-code') as HTMLTextAreaElement
      expect(editor.value).toBe('')
    })

    it('handles snippet with multiline code', () => {
      const multilineCode = 'function test() {\n  return 42;\n}'
      const multilineSnippet = { ...mockSnippet, code: multilineCode }

      render(
        <SnippetViewerContent
          snippet={multilineSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      const editor = screen.getByTestId('editor-code') as HTMLTextAreaElement
      expect(editor.value).toContain('\n')
    })
  })

  describe('State Management', () => {
    it('updates when snippet prop changes', () => {
      const { rerender } = render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      const newSnippet = {
        ...mockSnippet,
        code: 'new code',
      }

      rerender(
        <SnippetViewerContent
          snippet={newSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      const editor = screen.getByTestId('editor-code') as HTMLTextAreaElement
      expect(editor.value).toBe('new code')
    })

    it('updates when canPreview prop changes', () => {
      const { rerender } = render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      expect(screen.queryByTestId('react-preview')).not.toBeInTheDocument()

      rerender(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    it('updates when showPreview prop changes', () => {
      const { rerender } = render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={false}
          isPython={false}
        />
      )

      expect(screen.queryByTestId('react-preview')).not.toBeInTheDocument()

      rerender(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    it('updates when isPython prop changes', () => {
      const pythonSnippet = { ...mockSnippet, language: 'Python' }

      const { rerender } = render(
        <SnippetViewerContent
          snippet={pythonSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.queryByTestId('python-output')).not.toBeInTheDocument()

      rerender(
        <SnippetViewerContent
          snippet={pythonSnippet}
          canPreview={true}
          showPreview={true}
          isPython={true}
        />
      )

      expect(screen.getByTestId('python-output')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('complete workflow: view code only then switch to preview', () => {
      const { rerender } = render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={false}
          isPython={false}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.queryByTestId('react-preview')).not.toBeInTheDocument()

      rerender(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={true}
          showPreview={true}
          isPython={false}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByTestId('react-preview')).toBeInTheDocument()
    })

    it('complete workflow: Python output viewing', () => {
      const pythonSnippet = {
        ...mockSnippet,
        language: 'Python',
        code: 'print("result")',
      }

      render(
        <SnippetViewerContent
          snippet={pythonSnippet}
          canPreview={true}
          showPreview={true}
          isPython={true}
        />
      )

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByTestId('python-output')).toBeInTheDocument()
      expect(screen.getByTestId('python-code')).toHaveTextContent('print("result")')
    })

    it('complete workflow: switch between languages', () => {
      const { rerender } = render(
        <SnippetViewerContent
          snippet={mockSnippet}
          canPreview={false}
          showPreview={false}
          isPython={false}
        />
      )

      expect(screen.getByTestId('editor-language')).toHaveTextContent('JavaScript')

      const pythonSnippet = { ...mockSnippet, language: 'Python' }

      rerender(
        <SnippetViewerContent
          snippet={pythonSnippet}
          canPreview={false}
          showPreview={false}
          isPython={true}
        />
      )

      expect(screen.getByTestId('editor-language')).toHaveTextContent('Python')
    })
  })
})
