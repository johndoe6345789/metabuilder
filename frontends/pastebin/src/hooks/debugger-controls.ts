import type { Dispatch } from 'react'
import type { DebuggerAction } from './debugger-types'

export interface ControlDeps {
  send: (command: string, args?: Record<string, unknown>) => Promise<unknown>
  stop: () => Promise<void>
  dispatch: Dispatch<DebuggerAction>
  threadId: () => number
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
