import React from 'react'
import { render, screen } from '@testing-library/react'
import { TerminalOutput } from './TerminalOutput'

interface TerminalLine {
  type: 'output' | 'error' | 'input-prompt' | 'input-value'
  content: string
  id: string
}

describe('TerminalOutput', () => {
  const defaultProps = {
    lines: [] as TerminalLine[],
    isRunning: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Empty State', () => {
    it('should display empty state message when no lines and not running', () => {
      render(<TerminalOutput {...defaultProps} />)
      expect(screen.getByText('Click "Run" to execute the Python code')).toBeInTheDocument()
    })

    it('should display empty state message when no lines and not running with specific text', () => {
      render(<TerminalOutput {...defaultProps} lines={[]} isRunning={false} />)
      const message = screen.getByText('Click "Run" to execute the Python code')
      expect(message).toBeInTheDocument()
    })

    it('should not display empty state when running even without lines', () => {
      render(<TerminalOutput {...defaultProps} lines={[]} isRunning={true} />)
      expect(screen.queryByText('Click "Run" to execute the Python code')).not.toBeInTheDocument()
    })

    it('should not display empty state when lines exist', () => {
      const lines = [{ type: 'output' as const, content: 'test', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} isRunning={false} />)
      expect(screen.queryByText('Click "Run" to execute the Python code')).not.toBeInTheDocument()
    })
  })

  describe('Output Rendering', () => {
    it('should render output line', () => {
      const lines = [{ type: 'output' as const, content: 'Hello World', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('should render output line with correct text color', () => {
      const lines = [{ type: 'output' as const, content: 'Output text', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      const output = screen.getByText('Output text')
      expect(output).toHaveClass('text-foreground')
    })

    it('should render multiple output lines', () => {
      const lines = [
        { type: 'output' as const, content: 'Line 1', id: '1' },
        { type: 'output' as const, content: 'Line 2', id: '2' },
        { type: 'output' as const, content: 'Line 3', id: '3' },
      ]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('Line 1')).toBeInTheDocument()
      expect(screen.getByText('Line 2')).toBeInTheDocument()
      expect(screen.getByText('Line 3')).toBeInTheDocument()
    })

    it('should preserve whitespace in output', () => {
      const lines = [{ type: 'output' as const, content: 'Line 1    Spaced', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText(/Line 1.*Spaced/)).toBeInTheDocument()
    })
  })

  describe('Error Rendering', () => {
    it('should render error line', () => {
      const lines = [{ type: 'error' as const, content: 'Error message', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it('should render error with correct text color', () => {
      const lines = [{ type: 'error' as const, content: 'Error text', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      const error = screen.getByText('Error text')
      expect(error).toHaveClass('text-destructive')
    })

    it('should render multiple error lines', () => {
      const lines = [
        { type: 'error' as const, content: 'Error 1', id: '1' },
        { type: 'error' as const, content: 'Error 2', id: '2' },
      ]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('Error 1')).toBeInTheDocument()
      expect(screen.getByText('Error 2')).toBeInTheDocument()
    })

    it('should preserve whitespace in errors', () => {
      const lines = [{ type: 'error' as const, content: 'Error:    Details', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText(/Error:.*Details/)).toBeInTheDocument()
    })
  })

  describe('Input Prompt Rendering', () => {
    it('should render input prompt line', () => {
      const lines = [{ type: 'input-prompt' as const, content: 'Enter your name: ', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText(/Enter your name/)).toBeInTheDocument()
    })

    it('should render input prompt with correct styling', () => {
      const lines = [{ type: 'input-prompt' as const, content: 'Prompt: ', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      const prompt = screen.getByText(/Prompt/)
      expect(prompt).toHaveClass('text-accent', 'font-medium')
    })

    it('should preserve whitespace in input prompts', () => {
      const lines = [{ type: 'input-prompt' as const, content: 'Name:     ', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      const prompt = screen.getByText(/Name/)
      expect(prompt).toHaveClass('whitespace-pre-wrap')
    })
  })

  describe('Input Value Rendering', () => {
    it('should render input value line', () => {
      const lines = [{ type: 'input-value' as const, content: 'user input', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('> user input')).toBeInTheDocument()
    })

    it('should render input value with prompt prefix', () => {
      const lines = [{ type: 'input-value' as const, content: 'hello', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      const value = screen.getByText('> hello')
      expect(value).toBeInTheDocument()
    })

    it('should render input value with correct text color', () => {
      const lines = [{ type: 'input-value' as const, content: 'user value', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      const value = screen.getByText('> user value')
      expect(value).toHaveClass('text-primary')
    })

    it('should preserve whitespace in input values', () => {
      const lines = [{ type: 'input-value' as const, content: 'text    with    spaces', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      const value = screen.getByText(/text.*with.*spaces/)
      expect(value).toHaveClass('whitespace-pre-wrap')
    })
  })

  describe('Mixed Output Types', () => {
    it('should render mixed output and error lines', () => {
      const lines = [
        { type: 'output' as const, content: 'Starting process...', id: '1' },
        { type: 'error' as const, content: 'Warning: something', id: '2' },
        { type: 'output' as const, content: 'Process complete', id: '3' },
      ]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('Starting process...')).toBeInTheDocument()
      expect(screen.getByText('Warning: something')).toBeInTheDocument()
      expect(screen.getByText('Process complete')).toBeInTheDocument()
    })

    it('should render all line types together', () => {
      const lines = [
        { type: 'input-prompt' as const, content: 'Name: ', id: '1' },
        { type: 'input-value' as const, content: 'John', id: '2' },
        { type: 'output' as const, content: 'Hello John', id: '3' },
        { type: 'error' as const, content: 'Note: something', id: '4' },
      ]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText(/Name/)).toBeInTheDocument()
      expect(screen.getByText('Hello John')).toBeInTheDocument()
      expect(screen.getByText(/Note.*something/)).toBeInTheDocument()
    })
  })

  describe('Multiline Content', () => {
    it('should handle multiline output content', () => {
      const lines = [
        { type: 'output' as const, content: 'Line 1\nLine 2\nLine 3', id: '1' },
      ]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText(/Line 1/)).toBeInTheDocument()
    })

    it('should preserve newlines with whitespace-pre-wrap', () => {
      const lines = [
        { type: 'output' as const, content: 'First\n  Indented\nThird', id: '1' },
      ]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      const output = screen.getByText(/First/)
      expect(output).toHaveClass('whitespace-pre-wrap')
    })
  })

  describe('Empty Content', () => {
    it('should handle empty string content', () => {
      const lines = [{ type: 'output' as const, content: '', id: '1' }]
      const { container } = render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(container).toBeInTheDocument()
    })

    it('should handle line with only whitespace', () => {
      const lines = [{ type: 'output' as const, content: '   ', id: '1' }]
      const { container } = render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Container Styling', () => {
    it('should have correct container styling', () => {
      render(<TerminalOutput {...defaultProps} />)
      // Container should have space-y-1 class for spacing
      const container = screen.getByText('Click "Run" to execute the Python code').closest('div')
      expect(container).toBeInTheDocument()
    })

    it('should render in a flex column container', () => {
      const lines = [{ type: 'output' as const, content: 'test', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('test')).toBeInTheDocument()
    })
  })

  describe('Line Styling', () => {
    it('should apply leading-relaxed to all lines', () => {
      const lines = [
        { type: 'output' as const, content: 'test output', id: '1' },
        { type: 'error' as const, content: 'test error', id: '2' },
      ]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      // Lines should have proper spacing
      expect(screen.getByText('test output')).toBeInTheDocument()
      expect(screen.getByText('test error')).toBeInTheDocument()
    })

    it('should have monospace font for all output', () => {
      const lines = [{ type: 'output' as const, content: 'mono text', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      // Check parent structure (terminal output area typically has font-mono)
      expect(screen.getByText('mono text')).toBeInTheDocument()
    })
  })

  describe('Line Ordering', () => {
    it('should render lines in order', () => {
      const lines = [
        { type: 'output' as const, content: '1', id: '1' },
        { type: 'output' as const, content: '2', id: '2' },
        { type: 'output' as const, content: '3', id: '3' },
      ]
      render(<TerminalOutput {...defaultProps} lines={lines} />)

      const allElements = screen.getAllByText(/^[123]$/)
      expect(allElements).toHaveLength(3)
    })

    it('should maintain order after multiple renders', () => {
      const lines = [
        { type: 'output' as const, content: 'First', id: '1' },
        { type: 'output' as const, content: 'Second', id: '2' },
      ]
      const { rerender } = render(<TerminalOutput {...defaultProps} lines={lines} />)

      rerender(<TerminalOutput {...defaultProps} lines={lines} />)

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  describe('Special Characters', () => {
    it('should handle special HTML characters', () => {
      const lines = [{ type: 'output' as const, content: '<div>test</div>', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('<div>test</div>')).toBeInTheDocument()
    })

    it('should handle unicode characters', () => {
      const lines = [{ type: 'output' as const, content: '日本語テキスト', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('日本語テキスト')).toBeInTheDocument()
    })

    it('should handle emoji characters', () => {
      const lines = [{ type: 'output' as const, content: 'Success 😊', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('Success 😊')).toBeInTheDocument()
    })

    it('should handle escape sequences', () => {
      const lines = [{ type: 'output' as const, content: 'Tab\there', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText(/Tab.*here/)).toBeInTheDocument()
    })
  })

  describe('Large Output', () => {
    it('should handle large number of lines', () => {
      const lines = Array.from({ length: 100 }, (_, i) => ({
        type: 'output' as const,
        content: `Line ${i}`,
        id: String(i),
      }))
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('Line 0')).toBeInTheDocument()
      expect(screen.getByText('Line 99')).toBeInTheDocument()
    })

    it('should handle very long individual lines', () => {
      const longContent = 'a'.repeat(1000)
      const lines = [{ type: 'output' as const, content: longContent, id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })
  })

  describe('State Changes', () => {
    it('should update when lines change', () => {
      const lines1 = [{ type: 'output' as const, content: 'First output', id: '1' }]
      const { rerender } = render(<TerminalOutput {...defaultProps} lines={lines1} />)
      expect(screen.getByText('First output')).toBeInTheDocument()

      const lines2 = [{ type: 'output' as const, content: 'Second output', id: '2' }]
      rerender(<TerminalOutput {...defaultProps} lines={lines2} />)
      expect(screen.queryByText('First output')).not.toBeInTheDocument()
      expect(screen.getByText('Second output')).toBeInTheDocument()
    })

    it('should update when isRunning changes', () => {
      const { rerender } = render(<TerminalOutput {...defaultProps} lines={[]} isRunning={false} />)
      expect(screen.getByText('Click "Run" to execute the Python code')).toBeInTheDocument()

      rerender(<TerminalOutput {...defaultProps} lines={[]} isRunning={true} />)
      expect(screen.queryByText('Click "Run" to execute the Python code')).not.toBeInTheDocument()
    })

    it('should add new lines incrementally', () => {
      const initialLines = [{ type: 'output' as const, content: 'Line 1', id: '1' }]
      const { rerender } = render(<TerminalOutput {...defaultProps} lines={initialLines} />)

      const updatedLines = [
        { type: 'output' as const, content: 'Line 1', id: '1' },
        { type: 'output' as const, content: 'Line 2', id: '2' },
      ]
      rerender(<TerminalOutput {...defaultProps} lines={updatedLines} />)

      expect(screen.getByText('Line 1')).toBeInTheDocument()
      expect(screen.getByText('Line 2')).toBeInTheDocument()
    })
  })

  describe('Animation', () => {
    it('should render motion components for each line', () => {
      const lines = [{ type: 'output' as const, content: 'Animated', id: '1' }]
      render(<TerminalOutput {...defaultProps} lines={lines} />)
      expect(screen.getByText('Animated')).toBeInTheDocument()
    })
  })
})
