import { renderHook, act } from '@testing-library/react'
import { useDebugger } from './useDebugger'

jest.mock('./useDebugSession', () => ({
  useDebugSession: () => ({
    send: jest.fn().mockResolvedValue(undefined),
    start: jest.fn().mockResolvedValue({ launch_args: {} }),
    stop: jest.fn().mockResolvedValue(undefined),
  }),
}))

describe('useDebugger — toggleBreakpoint', () => {
  it('adds a breakpoint when the line is not yet set', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => { result.current.toggleBreakpoint('main.py', 5) })
    expect(result.current.state.breakpoints['main.py']).toEqual([5])
  })

  it('removes a breakpoint when the line is already set', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => { result.current.toggleBreakpoint('main.py', 5) })
    act(() => { result.current.toggleBreakpoint('main.py', 5) })
    expect(result.current.state.breakpoints['main.py']).toEqual([])
  })

  it('keeps the breakpoint list sorted after adding multiple lines', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => { result.current.toggleBreakpoint('main.py', 10) })
    act(() => { result.current.toggleBreakpoint('main.py', 3) })
    act(() => { result.current.toggleBreakpoint('main.py', 7) })
    expect(result.current.state.breakpoints['main.py']).toEqual([3, 7, 10])
  })

  it('does not affect other lines when one is toggled off', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => { result.current.toggleBreakpoint('main.py', 3) })
    act(() => { result.current.toggleBreakpoint('main.py', 7) })
    act(() => { result.current.toggleBreakpoint('main.py', 3) })
    expect(result.current.state.breakpoints['main.py']).toEqual([7])
  })

  it('tracks breakpoints independently per file', () => {
    const { result } = renderHook(() => useDebugger())
    act(() => { result.current.toggleBreakpoint('main.py', 5) })
    act(() => { result.current.toggleBreakpoint('utils.py', 3) })
    expect(result.current.state.breakpoints['main.py']).toEqual([5])
    expect(result.current.state.breakpoints['utils.py']).toEqual([3])
  })

  it('handles toggling on an empty file entry', () => {
    const { result } = renderHook(() => useDebugger())
    // file not yet in state — should initialise to [line]
    act(() => { result.current.toggleBreakpoint('new.py', 1) })
    expect(result.current.state.breakpoints['new.py']).toEqual([1])
  })

  it('preserves breakpoints after a debug session resets', async () => {
    const { result } = renderHook(() => useDebugger())
    act(() => { result.current.toggleBreakpoint('main.py', 4) })
    await act(async () => { await result.current.stopDebugging() })
    expect(result.current.state.breakpoints['main.py']).toEqual([4])
  })
})
