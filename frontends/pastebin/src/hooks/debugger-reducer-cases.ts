import type { DebuggerState, DebuggerAction } from './debugger-types'

type Of<T extends DebuggerAction['type']> = Extract<DebuggerAction, { type: T }>

const cleared: Pick<
  DebuggerState,
  'currentFile' | 'currentLine' | 'callStack' | 'scopes' | 'variables'
> = {
  currentFile: null,
  currentLine: null,
  callStack: [],
  scopes: [],
  variables: {},
}

export function start(s: DebuggerState): DebuggerState {
  return { ...s, ...cleared, status: 'starting', error: null, output: [] }
}

export function running(s: DebuggerState): DebuggerState {
  return { ...s, ...cleared, status: 'running' }
}

export function paused(s: DebuggerState, a: Of<'PAUSED'>): DebuggerState {
  return {
    ...s,
    status: 'paused',
    threadId: a.threadId,
    currentFile: a.file,
    currentLine: a.line,
  }
}

export function terminated(s: DebuggerState): DebuggerState {
  return { ...s, status: 'terminated', currentFile: null, currentLine: null }
}

export function watchResult(
  s: DebuggerState,
  a: Of<'WATCH_RESULT'>,
): DebuggerState {
  return {
    ...s,
    watches: s.watches.map((w, i) =>
      i === a.index ? { ...w, value: a.value, error: a.error } : w,
    ),
  }
}

export function toggleBp(s: DebuggerState, a: Of<'TOGGLE_BP'>): DebuggerState {
  const lines = s.breakpoints[a.file] ?? []
  const next = lines.includes(a.line)
    ? lines.filter(l => l !== a.line)
    : [...lines, a.line].sort((x, y) => x - y)
  return { ...s, breakpoints: { ...s.breakpoints, [a.file]: next } }
}

export function output(s: DebuggerState, a: Of<'OUTPUT'>): DebuggerState {
  return {
    ...s,
    output: [...s.output, { category: a.category, text: a.text }],
  }
}
