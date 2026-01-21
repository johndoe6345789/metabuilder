import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PythonTerminal } from './PythonTerminal'
import * as usePythonTerminalModule from '@/hooks/usePythonTerminal'

// Mock the usePythonTerminal hook
jest.mock('@/hooks/usePythonTerminal')

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

const mockUsePythonTerminal = usePythonTerminalModule.usePythonTerminal as jest.MockedFunction<typeof usePythonTerminalModule.usePythonTerminal>

const defaultMockReturn = {
  lines: [],
  isRunning: false,
  isInitializing: false,
  inputValue: '',
  waitingForInput: false,
  setInputValue: jest.fn(),
  handleInputSubmit: jest.fn(),
  handleRun: jest.fn(),
}

describe('PythonTerminal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePythonTerminal.mockReturnValue(defaultMockReturn)
  })

  describe('Rendering', () => {
    it('should render the terminal container with correct test id', () => {
      render(<PythonTerminal code="print('hello')" />)
      expect(screen.getByTestId('python-terminal')).toBeInTheDocument()
    })

    it('should render terminal header', () => {
      render(<PythonTerminal code="print('hello')" />)
      expect(screen.getByTestId('terminal-header')).toBeInTheDocument()
    })

    it('should render terminal output area', () => {
      render(<PythonTerminal code="print('hello')" />)
      expect(screen.getByTestId('terminal-output-area')).toBeInTheDocument()
    })

    it('should have correct aria-label on output area', () => {
      render(<PythonTerminal code="print('hello')" />)
      const outputArea = screen.getByTestId('terminal-output-area')
      expect(outputArea).toHaveAttribute('aria-label', 'Terminal output')
    })

    it('should have region role on output area for accessibility', () => {
      render(<PythonTerminal code="print('hello')" />)
      const outputArea = screen.getByTestId('terminal-output-area')
      expect(outputArea).toHaveAttribute('role', 'region')
    })

    it('should display empty state when no lines', () => {
      render(<PythonTerminal code="print('hello')" />)
      expect(screen.getByText('Click "Run" to execute the Python code')).toBeInTheDocument()
    })

    it('should display lines when they exist', () => {
      const lines = [
        { type: 'output' as const, content: 'Hello World', id: '1' },
      ]
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        lines,
      })

      render(<PythonTerminal code="print('hello')" />)
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })
  })

  describe('Header Integration', () => {
    it('should pass isRunning to TerminalHeader', () => {
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        isRunning: true,
      })

      render(<PythonTerminal code="print('hello')" />)
      const runButton = screen.getByTestId('run-python-btn')
      expect(runButton).toBeDisabled()
    })

    it('should pass isInitializing to TerminalHeader', () => {
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        isInitializing: true,
      })

      render(<PythonTerminal code="print('hello')" />)
      const runButton = screen.getByTestId('run-python-btn')
      expect(runButton).toBeDisabled()
    })

    it('should pass waitingForInput to TerminalHeader', () => {
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        waitingForInput: true,
      })

      render(<PythonTerminal code="print('hello')" />)
      const runButton = screen.getByTestId('run-python-btn')
      expect(runButton).toBeDisabled()
    })

    it('should call handleRun with code when run button is clicked', async () => {
      const handleRun = jest.fn()
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        handleRun,
      })

      const testCode = "print('test')"
      const user = userEvent.setup()

      render(<PythonTerminal code={testCode} />)
      await user.click(screen.getByTestId('run-python-btn'))

      expect(handleRun).toHaveBeenCalledWith(testCode)
    })
  })

  describe('Input Handling', () => {
    it('should show input form when waitingForInput is true', () => {
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        waitingForInput: true,
      })

      render(<PythonTerminal code="input('Enter: ')" />)
      expect(screen.getByTestId('terminal-input-form')).toBeInTheDocument()
    })

    it('should hide input form when waitingForInput is false', () => {
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        waitingForInput: false,
      })

      render(<PythonTerminal code="print('hello')" />)
      expect(screen.queryByTestId('terminal-input-form')).not.toBeInTheDocument()
    })

    it('should pass inputValue to TerminalInput', () => {
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        waitingForInput: true,
        inputValue: 'test input',
      })

      render(<PythonTerminal code="input('Enter: ')" />)
      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input.value).toBe('test input')
    })

    it('should call setInputValue when input changes', async () => {
      const setInputValue = jest.fn()
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        waitingForInput: true,
        setInputValue,
      })

      const user = userEvent.setup()
      render(<PythonTerminal code="input('Enter: ')" />)

      const input = screen.getByTestId('terminal-input')
      await user.type(input, 'new value')

      expect(setInputValue).toHaveBeenCalled()
    })

    it('should call handleInputSubmit when form is submitted', async () => {
      const handleInputSubmit = jest.fn((e: React.FormEvent) => e.preventDefault())
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        waitingForInput: true,
        handleInputSubmit,
      })

      const user = userEvent.setup()
      render(<PythonTerminal code="input('Enter: ')" />)

      const form = screen.getByTestId('terminal-input-form')
      await user.type(screen.getByTestId('terminal-input'), 'test')
      await user.keyboard('{Enter}')

      expect(handleInputSubmit).toHaveBeenCalled()
    })
  })

  describe('Terminal Output', () => {
    it('should render multiple lines', () => {
      const lines = [
        { type: 'output' as const, content: 'Line 1', id: '1' },
        { type: 'output' as const, content: 'Line 2', id: '2' },
        { type: 'error' as const, content: 'Error line', id: '3' },
      ]
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        lines,
      })

      render(<PythonTerminal code="print('hello')" />)
      expect(screen.getByText('Line 1')).toBeInTheDocument()
      expect(screen.getByText('Line 2')).toBeInTheDocument()
      expect(screen.getByText('Error line')).toBeInTheDocument()
    })

    it('should pass isRunning to TerminalOutput', () => {
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        isRunning: true,
      })

      render(<PythonTerminal code="print('hello')" />)
      // When running and no lines, should show running state instead of empty message
      expect(screen.queryByText('Click "Run" to execute the Python code')).not.toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('should have correct flex layout classes', () => {
      render(<PythonTerminal code="print('hello')" />)
      const terminal = screen.getByTestId('python-terminal')
      expect(terminal).toHaveClass('flex', 'flex-col', 'h-full', 'bg-card')
    })

    it('should have correct output area styling', () => {
      render(<PythonTerminal code="print('hello')" />)
      const outputArea = screen.getByTestId('terminal-output-area')
      expect(outputArea).toHaveClass('flex-1', 'overflow-auto', 'p-4', 'font-mono', 'text-sm')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined code gracefully', () => {
      render(<PythonTerminal code="" />)
      expect(screen.getByTestId('python-terminal')).toBeInTheDocument()
    })

    it('should handle very long code strings', () => {
      const longCode = "print('hello')\n".repeat(1000)
      const handleRun = jest.fn()
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        handleRun,
      })

      const user = userEvent.setup()
      render(<PythonTerminal code={longCode} />)

      expect(screen.getByTestId('python-terminal')).toBeInTheDocument()
    })

    it('should handle special characters in code', () => {
      const specialCode = "print('!@#$%^&*()')"
      const handleRun = jest.fn()
      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        handleRun,
      })

      render(<PythonTerminal code={specialCode} />)
      expect(screen.getByTestId('python-terminal')).toBeInTheDocument()
    })

    it('should render large number of lines', () => {
      const lines = Array.from({ length: 100 }, (_, i) => ({
        type: 'output' as const,
        content: `Line ${i}`,
        id: String(i),
      }))

      mockUsePythonTerminal.mockReturnValue({
        ...defaultMockReturn,
        lines,
      })

      render(<PythonTerminal code="print('hello')" />)
      expect(screen.getByText('Line 0')).toBeInTheDocument()
      expect(screen.getByText('Line 99')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should maintain state through multiple renders', () => {
      const { rerender } = render(<PythonTerminal code="print('hello')" />)
      expect(screen.getByTestId('python-terminal')).toBeInTheDocument()

      rerender(<PythonTerminal code="print('world')" />)
      expect(screen.getByTestId('python-terminal')).toBeInTheDocument()
    })

    it('should not call hooks multiple times unnecessarily', () => {
      const { rerender } = render(<PythonTerminal code="print('hello')" />)
      const callCount = mockUsePythonTerminal.mock.calls.length

      rerender(<PythonTerminal code="print('hello')" />)
      // Should only be called once more
      expect(mockUsePythonTerminal.mock.calls.length).toBeLessThanOrEqual(callCount + 1)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      render(<PythonTerminal code="print('hello')" />)
      const terminal = screen.getByTestId('python-terminal')
      expect(terminal.tagName).toBe('DIV')
    })

    it('should pass accessibility attributes to child components', () => {
      render(<PythonTerminal code="print('hello')" />)
      const outputArea = screen.getByTestId('terminal-output-area')
      expect(outputArea).toHaveAttribute('role', 'region')
      expect(outputArea).toHaveAttribute('aria-label', 'Terminal output')
    })

    it('should have proper heading hierarchy through TerminalHeader', () => {
      render(<PythonTerminal code="print('hello')" />)
      // TerminalHeader should contain semantic header text
      expect(screen.getByText('Python Terminal')).toBeInTheDocument()
    })
  })
})
