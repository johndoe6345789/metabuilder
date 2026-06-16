import type { DebuggerState, DebuggerAction } from './debugger-types'
import * as c from './debugger-reducer-cases'

export const initialDebuggerState: DebuggerState = {
  status: 'idle',
  error: null,
  breakpoints: {},
  currentFile: null,
  currentLine: null,
  threadId: 1,
  callStack: [],
  scopes: [],
  variables: {},
  watches: [],
  output: [],
}

export function debuggerReducer(
  s: DebuggerState,
  a: DebuggerAction,
): DebuggerState {
  switch (a.type) {
    case 'START':
      return c.start(s)
    case 'RUNNING':
      return c.running(s)
    case 'PAUSED':
      return c.paused(s, a)
    case 'TERMINATED':
      return c.terminated(s)
    case 'ERROR':
      return { ...s, status: 'error', error: a.error }
    case 'CALL_STACK':
      return { ...s, callStack: a.frames }
    case 'SCOPES':
      return { ...s, scopes: a.scopes }
    case 'VARIABLES':
      return { ...s, variables: { ...s.variables, [a.ref]: a.vars } }
    case 'WATCH_RESULT':
      return c.watchResult(s, a)
    case 'ADD_WATCH':
      return { ...s, watches: [...s.watches, { expr: a.expr, value: null }] }
    case 'REMOVE_WATCH':
      return { ...s, watches: s.watches.filter((_, i) => i !== a.index) }
    case 'TOGGLE_BP':
      return c.toggleBp(s, a)
    case 'OUTPUT':
      return c.output(s, a)
    case 'RESET':
      return {
        ...initialDebuggerState,
        breakpoints: s.breakpoints,
        watches: s.watches.map(w => ({ ...w, value: null })),
      }
    default:
      return s
  }
}
