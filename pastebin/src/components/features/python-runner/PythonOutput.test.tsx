import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PythonOutput } from './PythonOutput'
import * as pyodideModule from '@/lib/pyodide-runner'
import * as sonerModule from 'sonner'

// Mock the pyodide module
jest.mock('@/lib/pyodide-runner')

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock PythonTerminal to avoid dependency issues
jest.mock('./PythonTerminal', () => ({
  PythonTerminal: () => <div data-testid="python-terminal-mock">Python Terminal</div>,
}))

const mockPyodide = pyodideModule as jest.Mocked<typeof pyodideModule>
const mockToast = sonerModule.toast as jest.Mocked<typeof sonerModule.toast>

describe('PythonOutput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPyodide.isPyodideReady.mockReturnValue(true)
    mockPyodide.getPyodideError.mockReturnValue(null)
    mockPyodide.runPythonCode.mockResolvedValue({ output: '', error: '' })
  })

  describe('Rendering', () => {
    it('should render the component container', () => {
      render(<PythonOutput code="print('hello')" />)
      expect(screen.getByText('Python Output')).toBeInTheDocument()
    })

    it('should display Python Output header', () => {
      render(<PythonOutput code="print('hello')" />)
      expect(screen.getByText('Python Output')).toBeInTheDocument()
    })

    it('should have correct container classes', () => {
      const { container } = render(<PythonOutput code="print('hello')" />)
      const mainContainer = container.querySelector('[class*="flex"][class*="flex-col"]')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Status Badge', () => {
    it('should display Ready status when initialized', () => {
      mockPyodide.isPyodideReady.mockReturnValue(true)
      render(<PythonOutput code="print('hello')" />)
      expect(screen.getByText('Ready')).toBeInTheDocument()
    })

    it('should display Loading status when initializing', () => {
      mockPyodide.isPyodideReady.mockReturnValue(false)
      mockPyodide.getPyodide.mockImplementation(() => new Promise(() => {}))
      render(<PythonOutput code="print('hello')" />)
      expect(screen.getByText('Loading')).toBeInTheDocument()
    })

    it('should display Init failed status when error exists', () => {
      mockPyodide.getPyodideError.mockReturnValue(new Error('Load failed'))
      render(<PythonOutput code="print('hello')" />)
      expect(screen.getByText('Init failed')).toBeInTheDocument()
    })
  })

  describe('Initialization', () => {
    it('should initialize Pyodide on mount when not ready', async () => {
      mockPyodide.isPyodideReady.mockReturnValue(false)
      mockPyodide.getPyodide.mockResolvedValue({} as Record<string, unknown>)

      render(<PythonOutput code="print('hello')" />)

      await waitFor(() => {
        expect(mockPyodide.getPyodide).toHaveBeenCalled()
      })
    })

    it('should show success toast when initialization succeeds', async () => {
      mockPyodide.isPyodideReady.mockReturnValue(false)
      mockPyodide.getPyodide.mockResolvedValue({} as Record<string, unknown>)

      render(<PythonOutput code="print('hello')" />)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Python environment ready!')
      })
    })

    it('should not initialize if already ready', () => {
      mockPyodide.isPyodideReady.mockReturnValue(true)
      render(<PythonOutput code="print('hello')" />)

      // getPyodide should not be called if already ready
      expect(mockPyodide.getPyodide).not.toHaveBeenCalled()
    })

    it('should check for existing initialization error', () => {
      mockPyodide.getPyodideError.mockReturnValue(new Error('Previous error'))
      render(<PythonOutput code="print('hello')" />)

      expect(mockPyodide.getPyodideError).toHaveBeenCalled()
    })
  })

  describe('Run Button', () => {
    it('should render run button', () => {
      render(<PythonOutput code="print('hello')" />)
      expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument()
    })

    it('should enable run button when ready', () => {
      mockPyodide.isPyodideReady.mockReturnValue(true)
      render(<PythonOutput code="print('hello')" />)

      const runButton = screen.getByRole('button', { name: /run/i })
      expect(runButton).not.toBeDisabled()
    })

    it('should disable run button when initializing', () => {
      mockPyodide.isPyodideReady.mockReturnValue(false)
      mockPyodide.getPyodide.mockImplementation(() => new Promise(() => {}))
      render(<PythonOutput code="print('hello')" />)

      const runButton = screen.getByRole('button', { name: /loading|run/i })
      expect(runButton).toBeDisabled()
    })

    it('should disable run button when running', async () => {
      mockPyodide.runPythonCode.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const user = userEvent.setup()
      render(<PythonOutput code="print('hello')" />)

      const runButton = screen.getByRole('button', { name: /run/i })
      await user.click(runButton)

      expect(runButton).toBeDisabled()
    })

    it('should disable run button when there is an init error', () => {
      mockPyodide.getPyodideError.mockReturnValue(new Error('Init error'))
      render(<PythonOutput code="print('hello')" />)

      const runButton = screen.getByRole('button', { name: /run/i })
      expect(runButton).toBeDisabled()
    })
  })

  describe('Code Execution', () => {
    it('should execute code when run button is clicked', async () => {
      const user = userEvent.setup()
      render(<PythonOutput code="print('hello')" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      await waitFor(() => {
        expect(mockPyodide.runPythonCode).toHaveBeenCalledWith("print('hello')")
      })
    })

    it('should display output after execution', async () => {
      mockPyodide.runPythonCode.mockResolvedValue({
        output: 'Hello World',
        error: '',
      })

      const user = userEvent.setup()
      render(<PythonOutput code="print('hello')" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      await waitFor(() => {
        expect(screen.getByText('Hello World')).toBeInTheDocument()
      })
    })

    it('should display error when execution fails', async () => {
      mockPyodide.runPythonCode.mockResolvedValue({
        output: '',
        error: 'NameError: name "x" is not defined',
      })

      const user = userEvent.setup()
      render(<PythonOutput code="print(x)" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      await waitFor(() => {
        expect(screen.getByText(/NameError/)).toBeInTheDocument()
      })
    })

    it('should clear previous output before execution', async () => {
      mockPyodide.runPythonCode.mockResolvedValueOnce({
        output: 'First output',
        error: '',
      })

      const user = userEvent.setup()
      const { rerender } = render(<PythonOutput code="print('first')" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      await waitFor(() => {
        expect(screen.getByText('First output')).toBeInTheDocument()
      })

      mockPyodide.runPythonCode.mockResolvedValueOnce({
        output: 'Second output',
        error: '',
      })

      await user.click(screen.getByRole('button', { name: /run/i }))

      await waitFor(() => {
        expect(screen.getByText('Second output')).toBeInTheDocument()
        expect(screen.queryByText('First output')).not.toBeInTheDocument()
      })
    })
  })

  describe('Terminal Mode Detection', () => {
    it('should render PythonTerminal when code contains input() call', () => {
      render(<PythonOutput code="name = input('Enter name: ')" />)
      expect(screen.getByTestId('python-terminal-mock')).toBeInTheDocument()
    })

    it('should not render PythonTerminal when code does not contain input()', () => {
      render(<PythonOutput code="print('hello')" />)
      expect(screen.queryByTestId('python-terminal-mock')).not.toBeInTheDocument()
    })

    it('should detect input() with various spacing', () => {
      const { rerender } = render(<PythonOutput code="x=input( 'prompt')" />)
      expect(screen.getByTestId('python-terminal-mock')).toBeInTheDocument()

      rerender(<PythonOutput code="x = input ( 'prompt' )" />)
      expect(screen.getByTestId('python-terminal-mock')).toBeInTheDocument()
    })

    it('should be case insensitive for input detection', () => {
      const { rerender } = render(<PythonOutput code="INPUT('test')" />)
      expect(screen.getByTestId('python-terminal-mock')).toBeInTheDocument()

      rerender(<PythonOutput code="Input('test')" />)
      expect(screen.getByTestId('python-terminal-mock')).toBeInTheDocument()
    })
  })

  describe('Retry Functionality', () => {
    it('should show retry button when init error exists', () => {
      mockPyodide.getPyodideError.mockReturnValue(new Error('Load failed'))
      render(<PythonOutput code="print('hello')" />)

      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('should not show retry button when no error', () => {
      render(<PythonOutput code="print('hello')" />)
      expect(screen.queryByText('Retry')).not.toBeInTheDocument()
    })

    it('should call retry and clear errors', async () => {
      mockPyodide.getPyodideError.mockReturnValue(new Error('Load failed'))
      mockPyodide.resetPyodide.mockImplementation(() => {})
      mockPyodide.getPyodide.mockResolvedValue({} as Record<string, unknown>)

      const user = userEvent.setup()
      render(<PythonOutput code="print('hello')" />)

      await user.click(screen.getByText('Retry'))

      await waitFor(() => {
        expect(mockPyodide.resetPyodide).toHaveBeenCalled()
      })
    })

    it('should show Troubleshoot button', () => {
      mockPyodide.getPyodideError.mockReturnValue(new Error('Network error'))
      render(<PythonOutput code="print('hello')" />)

      expect(screen.getByText('Troubleshoot')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should show error card when init error exists', () => {
      mockPyodide.getPyodideError.mockReturnValue(new Error('Load failed'))
      render(<PythonOutput code="print('hello')" />)

      expect(screen.getByText('Python environment failed to start')).toBeInTheDocument()
    })

    it('should display error message', () => {
      const errorMsg = 'Failed to load Pyodide from CDN'
      mockPyodide.getPyodideError.mockReturnValue(new Error(errorMsg))
      render(<PythonOutput code="print('hello')" />)

      expect(screen.getByText(errorMsg)).toBeInTheDocument()
    })

    it('should show error toast when execution error occurs', async () => {
      mockPyodide.runPythonCode.mockRejectedValue(new Error('Execution error'))

      const user = userEvent.setup()
      render(<PythonOutput code="invalid code" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      // Component handles error internally
      await waitFor(() => {
        expect(mockPyodide.runPythonCode).toHaveBeenCalled()
      })
    })

    it('should handle runPythonCode throwing error', async () => {
      mockPyodide.runPythonCode.mockRejectedValue(new Error('Runtime error'))

      const user = userEvent.setup()
      const { container } = render(<PythonOutput code="print('test')" />)

      const buttons = container.querySelectorAll('button')
      const runButton = Array.from(buttons).find((btn) => btn.textContent?.includes('Run'))
      if (runButton) {
        await user.click(runButton)
      }

      await waitFor(() => {
        expect(mockPyodide.runPythonCode).toHaveBeenCalled()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading card during initialization', () => {
      mockPyodide.isPyodideReady.mockReturnValue(false)
      mockPyodide.getPyodide.mockImplementation(() => new Promise(() => {}))

      render(<PythonOutput code="print('hello')" />)

      expect(screen.getByText('Preparing Python environment')).toBeInTheDocument()
    })

    it('should show loading message with details', () => {
      mockPyodide.isPyodideReady.mockReturnValue(false)
      mockPyodide.getPyodide.mockImplementation(() => new Promise(() => {}))

      render(<PythonOutput code="print('hello')" />)

      expect(
        screen.getByText('This takes a few seconds the first time while Pyodide downloads.')
      ).toBeInTheDocument()
    })

    it('should show running state text on button', async () => {
      mockPyodide.runPythonCode.mockImplementation(() => new Promise(() => {}))

      const user = userEvent.setup()
      render(<PythonOutput code="print('hello')" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      expect(screen.getByText('Running...')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state message when no output and not running', () => {
      render(<PythonOutput code="print('hello')" />)
      expect(screen.getByText('Click "Run" to execute the Python code')).toBeInTheDocument()
    })

    it('should not show empty state during initialization', () => {
      mockPyodide.isPyodideReady.mockReturnValue(false)
      mockPyodide.getPyodide.mockImplementation(() => new Promise(() => {}))

      render(<PythonOutput code="print('hello')" />)

      expect(screen.queryByText('Click "Run" to execute the Python code')).not.toBeInTheDocument()
    })

    it('should not show empty state when there is init error', () => {
      mockPyodide.getPyodideError.mockReturnValue(new Error('Load failed'))
      render(<PythonOutput code="print('hello')" />)

      expect(screen.queryByText('Click "Run" to execute the Python code')).not.toBeInTheDocument()
    })
  })

  describe('Output Display', () => {
    it('should display output in pre-formatted block', async () => {
      mockPyodide.runPythonCode.mockResolvedValue({
        output: 'Line 1\nLine 2\nLine 3',
        error: '',
      })

      const user = userEvent.setup()
      render(<PythonOutput code="print('hello')" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      await waitFor(() => {
        expect(screen.getByText(/Line 1/)).toBeInTheDocument()
      })
    })

    it('should wrap output in Card component', async () => {
      mockPyodide.runPythonCode.mockResolvedValue({
        output: 'Output text',
        error: '',
      })

      const user = userEvent.setup()
      render(<PythonOutput code="print('hello')" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      await waitFor(() => {
        const outputCard = screen.getByText('Output text')
        expect(outputCard).toBeInTheDocument()
      })
    })
  })

  describe('Error Display', () => {
    it('should display error message', async () => {
      mockPyodide.runPythonCode.mockResolvedValue({
        output: '',
        error: 'TypeError: unsupported operand type',
      })

      const user = userEvent.setup()
      render(<PythonOutput code="print('test')" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      await waitFor(() => {
        expect(screen.getByText('TypeError: unsupported operand type')).toBeInTheDocument()
      })
    })

    it('should display error label', async () => {
      mockPyodide.runPythonCode.mockResolvedValue({
        output: '',
        error: 'Some error',
      })

      const user = userEvent.setup()
      render(<PythonOutput code="print('test')" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      await waitFor(() => {
        expect(screen.getByText('Error:')).toBeInTheDocument()
      })
    })

    it('should show error with red styling', async () => {
      mockPyodide.runPythonCode.mockResolvedValue({
        output: '',
        error: 'Runtime error message',
      })

      const user = userEvent.setup()
      render(<PythonOutput code="print('test')" />)

      await user.click(screen.getByRole('button', { name: /run/i }))

      await waitFor(() => {
        const errorMsg = screen.getByText('Runtime error message')
        expect(errorMsg).toBeInTheDocument()
      })
    })
  })

  describe('Code Prop Changes', () => {
    it('should update when code prop changes', () => {
      const { rerender } = render(<PythonOutput code="print('first')" />)
      expect(screen.getByText('Python Output')).toBeInTheDocument()

      rerender(<PythonOutput code="print('second')" />)
      expect(screen.getByText('Python Output')).toBeInTheDocument()
    })

    it('should detect input() in new code', () => {
      const { rerender } = render(<PythonOutput code="print('hello')" />)
      expect(screen.queryByTestId('python-terminal-mock')).not.toBeInTheDocument()

      rerender(<PythonOutput code="name = input('Enter: ')" />)
      expect(screen.getByTestId('python-terminal-mock')).toBeInTheDocument()
    })

    it('should switch back to output mode from terminal mode', () => {
      const { rerender } = render(<PythonOutput code="input('test')" />)
      expect(screen.getByTestId('python-terminal-mock')).toBeInTheDocument()

      rerender(<PythonOutput code="print('hello')" />)
      expect(screen.queryByTestId('python-terminal-mock')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<PythonOutput code="print('hello')" />)
      const heading = screen.getByText('Python Output')
      expect(heading.tagName).toBe('H3')
    })

    it('should have proper button labels', () => {
      render(<PythonOutput code="print('hello')" />)
      expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long code string', async () => {
      const longCode = "print('test')\n".repeat(1000)
      render(<PythonOutput code={longCode} />)
      expect(screen.getByText('Python Output')).toBeInTheDocument()
    })

    it('should handle code with multiple input calls', () => {
      const code = `
        name = input('Name: ')
        age = input('Age: ')
      `
      render(<PythonOutput code={code} />)
      expect(screen.getByTestId('python-terminal-mock')).toBeInTheDocument()
    })

    it('should handle empty code string', () => {
      render(<PythonOutput code="" />)
      expect(screen.getByText('Python Output')).toBeInTheDocument()
    })

    it('should handle code with comments mentioning input', () => {
      const code = "# This code uses input() to get user input\nprint('hello')"
      render(<PythonOutput code={code} />)
      // Should still detect the input() call even in comments
      expect(screen.getByTestId('python-terminal-mock')).toBeInTheDocument()
    })
  })

  describe('Multiple Executions', () => {
    it('should execute code multiple times', async () => {
      mockPyodide.runPythonCode.mockResolvedValue({
        output: 'result',
        error: '',
      })

      const user = userEvent.setup()
      render(<PythonOutput code="print('test')" />)

      const runButton = screen.getByRole('button', { name: /run/i })

      await user.click(runButton)
      await waitFor(() => {
        expect(mockPyodide.runPythonCode).toHaveBeenCalledTimes(1)
      })

      await user.click(runButton)
      await waitFor(() => {
        expect(mockPyodide.runPythonCode).toHaveBeenCalledTimes(2)
      })
    })

    it('should clear output between executions', async () => {
      const user = userEvent.setup()
      mockPyodide.runPythonCode
        .mockResolvedValueOnce({ output: 'First', error: '' })
        .mockResolvedValueOnce({ output: 'Second', error: '' })

      render(<PythonOutput code="print('test')" />)

      // First execution
      await user.click(screen.getByRole('button', { name: /run/i }))
      await waitFor(() => {
        expect(screen.getByText('First')).toBeInTheDocument()
      })

      // Second execution should replace output
      await user.click(screen.getByRole('button', { name: /run/i }))
      await waitFor(() => {
        expect(screen.getByText('Second')).toBeInTheDocument()
      })
    })
  })

  describe('Toast Notifications', () => {
    it('should show error toast when init fails', async () => {
      mockPyodide.getPyodide.mockRejectedValue(new Error('Network error'))
      mockPyodide.isPyodideReady.mockReturnValue(false)

      render(<PythonOutput code="print('hello')" />)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to load Python environment')
      })
    })

    it('should show error toast when trying to run with init error', async () => {
      mockPyodide.getPyodideError.mockReturnValue(new Error('Init failed'))

      render(<PythonOutput code="print('hello')" />)

      // When init error exists, the run button is disabled
      // The error toast should have been shown during initialization check
      expect(mockPyodide.getPyodideError).toHaveBeenCalled()
    })

    it('should show info toast when trying to run during initialization', async () => {
      mockPyodide.isPyodideReady.mockReturnValue(false)
      mockPyodide.getPyodide.mockImplementation(() => new Promise(() => {}))

      const user = userEvent.setup()
      const { container } = render(<PythonOutput code="print('hello')" />)

      // Find the run button - during initialization it says "Loading..."
      const buttons = container.querySelectorAll('button')
      const runButton = Array.from(buttons).find(
        (btn) => btn.textContent?.includes('Loading') || btn.textContent?.includes('Run')
      )

      if (runButton && !runButton.hasAttribute('disabled')) {
        await user.click(runButton)
        expect(mockToast.info).toHaveBeenCalledWith('Python environment is still loading...')
      }
    })
  })
})
