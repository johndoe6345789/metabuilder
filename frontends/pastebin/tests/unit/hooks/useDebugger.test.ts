import { renderHook, act } from '@testing-library/react'
import { useDebugger } from '@/hooks/useDebugger'
import type { DapMessage } from '@/lib/flask-debugger'

// Capture the message/done callbacks so tests can drive state transitions
let capturedOnMessage: (msg: DapMessage) => void = () => {}
let capturedOnDone: () => void = () => {}
const mockSend = jest.fn()
const mockStop = jest.fn()
const mockStart = jest.fn()

jest.mock('@/hooks/useDebugSession', () => ({
  useDebugSession: (onMsg: (m: DapMessage) => void, onDone: () => void) => {
    capturedOnMessage = onMsg
    capturedOnDone = onDone
    return {
      sessionIdRef: { current: null },
      start: mockStart,
      send: mockSend,
      stop: mockStop,
    }
  },
}))

const event = (name: string, body: unknown = {}): DapMessage => ({
  seq: 1,
  type: 'event',
  event: name,
  body,
})

describe('useDebugger – language support', () => {
  it('includes C++ in supportedLanguages', () => {
    const { result } = renderHook(() => useDebugger())
    expect(result.current.supportedLanguages).toContain('C++')
  })

  it('includes Python, JavaScript, TypeScript, Go', () => {
    const { result } = renderHook(() => useDebugger())
    const langs = result.current.supportedLanguages
    expect(langs).toContain('Python')
    expect(langs).toContain('JavaScript')
    expect(langs).toContain('TypeScript')
    expect(langs).toContain('Go')
  })
})

describe('useDebugger – initial state', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useDebugger())
    expect(result.current.state.status).toBe('idle')
    expect(result.current.isActive).toBe(false)
    expect(result.current.isPaused).toBe(false)
  })
})

describe('useDebugger – breakpoints', () => {
  it('adds a breakpoint on first toggle', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => {
      result.current.toggleBreakpoint('main.cpp', 10)
    })
    expect(result.current.state.breakpoints['main.cpp']).toEqual([10])
  })

  it('removes a breakpoint on second toggle', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => {
      result.current.toggleBreakpoint('main.cpp', 10)
    })
    act(() => {
      result.current.toggleBreakpoint('main.cpp', 10)
    })
    expect(result.current.state.breakpoints['main.cpp']).toEqual([])
  })

  it('keeps breakpoints sorted', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => {
      result.current.toggleBreakpoint('main.cpp', 20)
    })
    act(() => {
      result.current.toggleBreakpoint('main.cpp', 5)
    })
    act(() => {
      result.current.toggleBreakpoint('main.cpp', 12)
    })
    expect(result.current.state.breakpoints['main.cpp']).toEqual([5, 12, 20])
  })

  it('tracks breakpoints per file independently', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => {
      result.current.toggleBreakpoint('main.cpp', 3)
    })
    act(() => {
      result.current.toggleBreakpoint('util.cpp', 7)
    })
    expect(result.current.state.breakpoints['main.cpp']).toEqual([3])
    expect(result.current.state.breakpoints['util.cpp']).toEqual([7])
  })
})

describe('useDebugger – DAP event handling', () => {
  it('transitions to paused on stopped event', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => {
      capturedOnMessage(event('stopped', { reason: 'breakpoint', threadId: 1 }))
    })
    expect(result.current.state.status).toBe('paused')
    expect(result.current.isPaused).toBe(true)
  })

  it('transitions to running on continued event', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => {
      capturedOnMessage(event('stopped', { threadId: 1 }))
    })
    act(() => {
      capturedOnMessage(event('continued'))
    })
    expect(result.current.state.status).toBe('running')
  })

  it('transitions to terminated on exited event', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => {
      capturedOnMessage(event('exited'))
    })
    expect(result.current.state.status).toBe('terminated')
  })

  it('appends stdout output', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => {
      capturedOnMessage(
        event('output', { category: 'stdout', output: 'hello\n' }),
      )
    })
    expect(result.current.state.output).toEqual([
      { category: 'stdout', text: 'hello\n' },
    ])
  })

  it('marks terminated when session done', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => {
      capturedOnDone()
    })
    expect(result.current.state.status).toBe('terminated')
  })
})

describe('useDebugger – watches', () => {
  it('adds and removes watches', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => {
      result.current.addWatch('x')
    })
    act(() => {
      result.current.addWatch('y')
    })
    expect(result.current.state.watches).toHaveLength(2)
    act(() => {
      result.current.removeWatch(0)
    })
    expect(result.current.state.watches[0].expr).toBe('y')
  })
})

describe('useDebugger – startDebugging maps C++ to cpp-cmake', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStart.mockResolvedValue({
      session_id: 'sid1',
      launch_args: { request: 'launch', program: '/workspace/__prog__' },
    })
    mockSend.mockResolvedValue(undefined)
  })

  it('calls session.start with cpp-cmake as language for C++ snippets', async () => {
    const { result } = renderHook(() => useDebugger())
    const files = [{ name: 'main.cpp', content: 'int main(){}' }]
    await act(async () => {
      await result.current.startDebugging('C++', files, 'main.cpp')
    })
    expect(mockStart).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'cpp-cmake' }),
    )
  })
})

describe('useDebugger – DAP handshake order', () => {
  const commands = () =>
    mockSend.mock.calls.map(c => (c[0] as { command: string }).command)

  beforeEach(() => {
    jest.clearAllMocks()
    mockSend.mockResolvedValue(undefined)
  })

  it('sends initialize then attach (not launch) for Python', async () => {
    mockStart.mockResolvedValue({
      session_id: 'sid',
      launch_args: { request: 'attach', justMyCode: false },
    })
    const { result } = renderHook(() => useDebugger())
    await act(async () => {
      await result.current.startDebugging(
        'Python',
        [{ name: 'main.py', content: 'print(1)' }],
        'main.py',
      )
    })
    const cmds = commands()
    expect(cmds).toContain('initialize')
    expect(cmds).toContain('attach')
    expect(cmds).not.toContain('launch')
    // initialize must precede attach
    expect(cmds.indexOf('initialize')).toBeLessThan(cmds.indexOf('attach'))
  })

  it('sets breakpoints then configurationDone on initialized event', async () => {
    mockStart.mockResolvedValue({
      session_id: 'sid',
      launch_args: { request: 'attach' },
    })
    const { result } = renderHook(() => useDebugger())
    act(() => {
      result.current.toggleBreakpoint('main.py', 3)
    })
    await act(async () => {
      await result.current.startDebugging(
        'Python',
        [{ name: 'main.py', content: 'x=1\ny=2\nprint(x)' }],
        'main.py',
      )
    })
    mockSend.mockClear()
    await act(async () => {
      capturedOnMessage(event('initialized'))
    })
    const cmds = commands()
    expect(cmds).toEqual(['setBreakpoints', 'configurationDone'])
    // configurationDone must come last so the program doesn't run early
    expect(cmds.indexOf('setBreakpoints')).toBeLessThan(
      cmds.indexOf('configurationDone'),
    )
  })

  it('uses launch (not attach) for spawn-adapter languages like Go', async () => {
    mockStart.mockResolvedValue({
      session_id: 'sid',
      launch_args: { request: 'launch', mode: 'debug' },
    })
    const { result } = renderHook(() => useDebugger())
    await act(async () => {
      await result.current.startDebugging(
        'Go',
        [{ name: 'main.go', content: 'package main' }],
        'main.go',
      )
    })
    const cmds = commands()
    expect(cmds).toContain('launch')
    expect(cmds).not.toContain('attach')
  })
})
