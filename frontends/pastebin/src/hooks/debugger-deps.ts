import type { Dispatch } from 'react'
import type { DebuggerAction, WatchEntry } from './debugger-types'

/** Promise-based DAP request function (resolves with the response body). */
export type Dap = <T = unknown>(
  command: string,
  args?: Record<string, unknown>,
) => Promise<T>

/** Shared dependencies for the inspection/fetch helpers. */
export interface InspectDeps {
  dap: Dap
  dispatch: Dispatch<DebuggerAction>
  watchesRef: { current: WatchEntry[] }
}
