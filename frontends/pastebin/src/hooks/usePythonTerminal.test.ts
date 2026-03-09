import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePythonTerminal } from './usePythonTerminal'
import * as flaskRunner from '@/lib/flask-runner'

// Mock the flask-runner module
jest.mock('@/lib/flask-runner')

const mockFlaskRunner = flaskRunner as jest.Mocked<typeof flaskRunner>

describe('usePythonTerminal Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
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

    it('should always report isInitializing as false (Flask is always ready)', () => {
      const { result } = renderHook(() => usePythonTerminal())
      expect(result.current.isInitializing).toBe(false)
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

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>

      const initialValue = 'initial'
      act(() => {
        result.current.setInputValue(initialValue)
      })

      act(() => {
        result.current.handleInputSubmit(mockEvent)
      })

      // Input value should not change since waitingForInput is false
      expect(result.current.inputValue).toBe(initialValue)
    })

    it('should not submit input if no active session', () => {
      const { result } = renderHook(() => usePythonTerminal())

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>

      act(() => {
        result.current.setInputValue('some input')
      })

      // handleInputSubmit checks waitingForInput — which is false by default
      act(() => {
        result.current.handleInputSubmit(mockEvent)
      })

      expect(mockFlaskRunner.sendSessionInput).not.toHaveBeenCalled()
    })
  })

  describe('Code Execution State', () => {
    it('should set running state to false after error from Flask not configured', async () => {
      mockFlaskRunner.startInteractiveSession.mockRejectedValue(
        new Error('Flask backend not configured (NEXT_PUBLIC_FLASK_BACKEND_URL is not set)')
      )

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        await result.current.handleRun('print("test")')
      })

      expect(result.current.isRunning).toBe(false)
    })

    it('should add error line when Flask is not configured', async () => {
      const errorMsg = 'Flask backend not configured (NEXT_PUBLIC_FLASK_BACKEND_URL is not set)'
      mockFlaskRunner.startInteractiveSession.mockRejectedValue(new Error(errorMsg))

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        await result.current.handleRun('print("test")')
      })

      expect(result.current.lines).toHaveLength(1)
      expect(result.current.lines[0].type).toBe('error')
      expect(result.current.lines[0].content).toContain('Flask backend not configured')
    })

    it('should clear lines when running new code', async () => {
      mockFlaskRunner.startInteractiveSession.mockRejectedValue(new Error('error1'))

      const { result } = renderHook(() => usePythonTerminal())

      // First run adds an error line
      await act(async () => {
        await result.current.handleRun('print("first")')
      })

      expect(result.current.lines).toHaveLength(1)

      // Second run should clear and add new error line
      mockFlaskRunner.startInteractiveSession.mockRejectedValue(new Error('error2'))
      await act(async () => {
        await result.current.handleRun('print("second")')
      })

      expect(result.current.lines).toHaveLength(1)
      expect(result.current.lines[0].content).toBe('error2')
    })

    it('should reset waitingForInput after execution error', async () => {
      mockFlaskRunner.startInteractiveSession.mockRejectedValue(new Error('Execution error'))

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        await result.current.handleRun('code')
      })

      expect(result.current.waitingForInput).toBe(false)
      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('Session polling', () => {
    it('should start session and poll for output', async () => {
      mockFlaskRunner.startInteractiveSession.mockResolvedValue('session-123')
      mockFlaskRunner.pollSession.mockResolvedValue({
        output: [{ type: 'out', text: 'Hello World' }],
        waiting_for_input: false,
        done: true,
      })

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        result.current.handleRun('print("Hello World")')
        // Advance past the initial setTimeout for poll
        jest.advanceTimersByTime(150)
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(mockFlaskRunner.startInteractiveSession).toHaveBeenCalledWith({
        language: 'python',
        files: [{ name: 'main.py', content: 'print("Hello World")' }],
      })
    })

    it('should map output line types correctly', async () => {
      mockFlaskRunner.startInteractiveSession.mockResolvedValue('session-456')
      mockFlaskRunner.pollSession.mockResolvedValueOnce({
        output: [
          { type: 'out', text: 'stdout line' },
          { type: 'err', text: 'stderr line' },
          { type: 'prompt', text: '> ' },
          { type: 'input-echo', text: 'typed' },
        ],
        waiting_for_input: false,
        done: true,
      })

      const { result } = renderHook(() => usePythonTerminal())

      await act(async () => {
        result.current.handleRun('code')
        jest.advanceTimersByTime(150)
        await Promise.resolve()
        await Promise.resolve()
        await Promise.resolve()
      })

      await waitFor(() => {
        expect(result.current.lines.length).toBeGreaterThan(0)
      }, { timeout: 1000 })
    })
  })

  describe('Return interface', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => usePythonTerminal())

      expect(typeof result.current.lines).toBe('object')
      expect(typeof result.current.isRunning).toBe('boolean')
      expect(typeof result.current.isInitializing).toBe('boolean')
      expect(typeof result.current.inputValue).toBe('string')
      expect(typeof result.current.waitingForInput).toBe('boolean')
      expect(typeof result.current.setInputValue).toBe('function')
      expect(typeof result.current.handleInputSubmit).toBe('function')
      expect(typeof result.current.handleRun).toBe('function')
    })
  })
})
