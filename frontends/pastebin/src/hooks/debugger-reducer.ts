import type { DebuggerState, DebuggerAction } from './debugger-types'

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
      return {
        ...s,
        status: 'starting',
        error: null,
        output: [],
        callStack: [],
        scopes: [],
        variables: {},
        currentFile: null,
        currentLine: null,
      }
    case 'RUNNING':
      return {
        ...s,
        status: 'running',
        currentFile: null,
        currentLine: null,
        callStack: [],
        scopes: [],
        variables: {},
      }
    case 'PAUSED':
      return {
        ...s,
        status: 'paused',
        threadId: a.threadId,
        currentFile: a.file,
        currentLine: a.line,
      }
    case 'TERMINATED':
      return {
        ...s,
        status: 'terminated',
        currentFile: null,
        currentLine: null,
      }
    case 'ERROR':
      return { ...s, status: 'error', error: a.error }
    case 'CALL_STACK':
      return { ...s, callStack: a.frames }
    case 'SCOPES':
      return { ...s, scopes: a.scopes }
    case 'VARIABLES':
      return { ...s, variables: { ...s.variables, [a.ref]: a.vars } }
    case 'WATCH_RESULT':
      return {
        ...s,
        watches: s.watches.map((w, i) =>
          i === a.index ? { ...w, value: a.value, error: a.error } : w,
        ),
      }
    case 'ADD_WATCH':
      return { ...s, watches: [...s.watches, { expr: a.expr, value: null }] }
    case 'REMOVE_WATCH':
      return { ...s, watches: s.watches.filter((_, i) => i !== a.index) }
    case 'TOGGLE_BP': {
      const lines = s.breakpoints[a.file] ?? []
      const next = lines.includes(a.line)
        ? lines.filter(l => l !== a.line)
        : [...lines, a.line].sort((x, y) => x - y)
      return { ...s, breakpoints: { ...s.breakpoints, [a.file]: next } }
    }
    case 'OUTPUT':
      return {
        ...s,
        output: [...s.output, { category: a.category, text: a.text }],
      }
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
