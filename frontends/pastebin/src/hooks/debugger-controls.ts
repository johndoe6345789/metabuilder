import type { Dispatch } from 'react'
import type { DebuggerAction } from './debugger-types'

export interface ControlDeps {
  send: (command: string, args?: Record<string, unknown>) => Promise<unknown>
  stop: () => Promise<void>
  dispatch: Dispatch<DebuggerAction>
  threadId: () => number
}

/** Reducer-dispatch wrappers for breakpoints and watch expressions. */
export function makeStateActions(dispatch: Dispatch<DebuggerAction>) {
  return {
    toggleBreakpoint: (file: string, line: number) =>
      dispatch({ type: 'TOGGLE_BP', file, line }),
    addWatch: (expr: string) => dispatch({ type: 'ADD_WATCH', expr }),
    removeWatch: (index: number) => dispatch({ type: 'REMOVE_WATCH', index }),
  }
}

/** Execution controls: step over/into/out, resume, pause, stop. */
export function makeControls(d: ControlDeps) {
  const thread = () => ({ threadId: d.threadId() })

  return {
    stepOver: () => d.send('next', thread()),
    stepIn: () => d.send('stepIn', thread()),
    stepOut: () => d.send('stepOut', thread()),
    pause: () => d.send('pause', thread()),
    resume: () => {
      d.dispatch({ type: 'RUNNING' })
      return d.send('continue', thread())
    },
    stopDebugging: async () => {
      // Best-effort disconnect before killing the session.
      await d.send('disconnect', { restart: false }).catch(() => {})
      d.dispatch({ type: 'RESET' })
      await d.stop()
    },
  }
}
