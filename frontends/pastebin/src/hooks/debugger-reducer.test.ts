import {
  debuggerReducer as reduce,
  initialDebuggerState as init,
} from './debugger-reducer'
import type { DebuggerState } from './debugger-types'

describe('debuggerReducer', () => {
  it('START clears run state and marks starting', () => {
    const prev: DebuggerState = {
      ...init,
      output: [{ category: 'stdout', text: 'x' }],
    }
    const s = reduce(prev, { type: 'START' })
    expect(s.status).toBe('starting')
    expect(s.output).toEqual([])
    expect(s.currentLine).toBeNull()
  })

  it('PAUSED sets file / line / thread', () => {
    const s = reduce(init, {
      type: 'PAUSED',
      threadId: 2,
      file: 'main.py',
      line: 5,
    })
    expect(s).toMatchObject({
      status: 'paused',
      threadId: 2,
      currentFile: 'main.py',
      currentLine: 5,
    })
  })

  it('TOGGLE_BP adds then removes a line, kept sorted', () => {
    let s = reduce(init, { type: 'TOGGLE_BP', file: 'a.py', line: 10 })
    s = reduce(s, { type: 'TOGGLE_BP', file: 'a.py', line: 3 })
    expect(s.breakpoints['a.py']).toEqual([3, 10])
    s = reduce(s, { type: 'TOGGLE_BP', file: 'a.py', line: 10 })
    expect(s.breakpoints['a.py']).toEqual([3])
  })

  it('OUTPUT appends in order', () => {
    let s = reduce(init, { type: 'OUTPUT', category: 'stdout', text: 'a' })
    s = reduce(s, { type: 'OUTPUT', category: 'stderr', text: 'b' })
    expect(s.output).toEqual([
      { category: 'stdout', text: 'a' },
      { category: 'stderr', text: 'b' },
    ])
  })

  it('WATCH_RESULT updates only the matching watch', () => {
    const prev: DebuggerState = {
      ...init,
      watches: [
        { expr: 'x', value: null },
        { expr: 'y', value: null },
      ],
    }
    const s = reduce(prev, { type: 'WATCH_RESULT', index: 1, value: '9' })
    expect(s.watches[1]).toEqual({ expr: 'y', value: '9', error: undefined })
    expect(s.watches[0]).toEqual({ expr: 'x', value: null })
  })

  it('RESET keeps breakpoints, blanks watch values, resets the rest', () => {
    const prev: DebuggerState = {
      ...init,
      status: 'paused',
      breakpoints: { 'a.py': [1] },
      watches: [{ expr: 'x', value: '5' }],
      output: [{ category: 'stdout', text: 'o' }],
    }
    const s = reduce(prev, { type: 'RESET' })
    expect(s.status).toBe('idle')
    expect(s.breakpoints).toEqual({ 'a.py': [1] })
    expect(s.watches).toEqual([{ expr: 'x', value: null }])
    expect(s.output).toEqual([])
  })
})
