import { renderHook, act, waitFor } from '@testing-library/react'
import { usePythonTerminal } from './usePythonTerminal'
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

const mockPyodide = pyodideModule as jest.Mocked<typeof pyodideModule>
const mockToast = sonerModule.toast as jest.Mocked<typeof sonerModule.toast>

describe('usePythonTerminal Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPyodide.isPyodideReady.mockReturnValue(true)
  })

  describe('Initialization', () => {
    it('should initialize with empty terminal', () => {
      const { result } = renderHook(() => usePythonTerminal())

      expect(result.current.lines).toEqual([])
      expect(result.current.isRunning).toBe(false)
      expect(result.current.isInitializing).toBe(false)
      expect(result.current.inputValue).toBe('')
      expect(result.current.waitingForInput).toBe(false)
    })

    it('should start initializing Pyodide when not ready', () => {
      mockPyodide.isPyodideReady.mockReturnValueOnce(false)
      mockPyodide.getPyodide.mockResolvedValueOnce({} as Record<string, unknown>)

      const { result } = renderHook(() => usePythonTerminal())

      expect(result.current.isInitializing).toBe(true)
    })

    it('should skip initialization when Pyodide is ready', async () => {
      // Pyodide is already ready
      mockPyodide.isPyodideReady.mockReturnValue(true)

      const { result } = renderHook(() => usePythonTerminal())

      // Should not be initializing since Pyodide is ready
      expect(result.current.isInitializing).toBe(false)

      // getPyodide should not be called since Pyodide is ready
      await waitFor(() => {
        expect(mockPyodide.getPyodide).not.toHaveBeenCalled()
      }, { timeout: 500 })
    })
  })

  describe('Terminal Output', () => {
    it('should add output line', async () => {
      mockPyodide.runPythonCodeInteractive.mockImplementation(async (code, callbacks) => {
        callbacks.onOutput?.('Hello, World!')
      })

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        await result.current.handleRun('print("Hello, World!")')
      })

      await waitFor(() => {
        expect(result.current.lines).toHaveLength(1)
      })

      const outputLine = result.current.lines[0]
      expect(outputLine.type).toBe('output')
      expect(outputLine.content).toBe('Hello, World!')
    })

    it('should add error line', async () => {
      mockPyodide.runPythonCodeInteractive.mockImplementation(async (code, callbacks) => {
        callbacks.onError?.('NameError: name "x" is not defined')
      })

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        await result.current.handleRun('print(x)')
      })

      await waitFor(() => {
        expect(result.current.lines).toHaveLength(1)
      })

      const errorLine = result.current.lines[0]
      expect(errorLine.type).toBe('error')
      expect(errorLine.content).toContain('NameError')
    })

    it('should clear lines when running new code', async () => {
      mockPyodide.runPythonCodeInteractive.mockImplementation(async (code, callbacks) => {
        callbacks.onOutput?.('Output')
      })

      const { result } = renderHook(() => usePythonTerminal())

      // First run
      await act(async () => {
        await result.current.handleRun('print("First")')
      })

      await waitFor(() => {
        expect(result.current.lines).toHaveLength(1)
      })

      // Second run should clear previous lines
      await act(async () => {
        await result.current.handleRun('print("Second")')
      })

      await waitFor(() => {
        expect(result.current.lines).toHaveLength(1)
        expect(result.current.lines[0].content).toBe('Output')
      })
    })

    it('should handle code execution errors', async () => {
      const error = new Error('Code execution failed')
      mockPyodide.runPythonCodeInteractive.mockRejectedValueOnce(error)

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        await result.current.handleRun('invalid code')
      })

      await waitFor(() => {
        expect(result.current.isRunning).toBe(false)
      })

      expect(result.current.lines).toHaveLength(1)
      expect(result.current.lines[0].type).toBe('error')
    })
  })

  describe('Input Handling', () => {
    it('should update input value', () => {
      const { result } = renderHook(() => usePythonTerminal())

      act(() => {
        result.current.setInputValue('test input')
      })

      expect(result.current.inputValue).toBe('test input')
    })

    it('should not submit input if not waiting for input', () => {
      const { result } = renderHook(() => usePythonTerminal())

      const mockEvent = { preventDefault: jest.fn() } as Record<string, jest.Mock>

      const initialValue = 'initial'
      act(() => {
        result.current.setInputValue(initialValue)
      })

      act(() => {
        result.current.handleInputSubmit(mockEvent)
      })

      // Input value should not change
      expect(result.current.inputValue).toBe(initialValue)
    })
  })

  describe('Code Execution State', () => {
    it('should set running state during execution', async () => {
      mockPyodide.runPythonCodeInteractive.mockImplementation(
        async (code, callbacks) => {
          callbacks.onOutput?.('done')
        }
      )

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        await result.current.handleRun('print("test")')
      })

      // After async execution completes, isRunning should be false
      expect(result.current.isRunning).toBe(false)
    })

    it('should not run code if Pyodide is initializing', async () => {
      mockPyodide.isPyodideReady.mockReturnValueOnce(false)
      mockPyodide.getPyodide.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        await result.current.handleRun('print("test")')
      })

      expect(mockPyodide.runPythonCodeInteractive).not.toHaveBeenCalled()
      expect(mockToast.info).toHaveBeenCalledWith('Python environment is still loading...')
    })

    it('should reset waiting state after execution error', async () => {
      mockPyodide.runPythonCodeInteractive.mockRejectedValueOnce(new Error('Execution error'))

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        await result.current.handleRun('code')
      })

      expect(result.current.waitingForInput).toBe(false)
      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('Multiple Output Types', () => {
    it('should handle mixed output and error', async () => {
      mockPyodide.runPythonCodeInteractive.mockImplementation(async (code, callbacks) => {
        callbacks.onOutput?.('Starting...')
        callbacks.onError?.('Warning: something')
        callbacks.onOutput?.('Finished')
      })

      const { result } = renderHook(() => usePythonTerminal())

      expect(result.current.lines).toHaveLength(0)

      await act(async () => {
        await result.current.handleRun('code')
      })

      expect(result.current.lines).toHaveLength(3)
      expect(result.current.lines[0].type).toBe('output')
      expect(result.current.lines[1].type).toBe('error')
      expect(result.current.lines[2].type).toBe('output')
    })
  })
})
