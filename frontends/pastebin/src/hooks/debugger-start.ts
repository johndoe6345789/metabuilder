import type { Dispatch } from 'react'
import type { DebuggerAction } from './debugger-types'
import { runnerKeyFor } from './debugger-runners'
import { initializeArgs, setBreakpointsArgs } from './debugger-requests'

type Files = { name: string; content: string }[]

export interface StartDeps {
  send: (command: string, args?: Record<string, unknown>) => Promise<unknown>
  start: (opts: {
    language: string
    files: Files
    entryPoint: string
  }) => Promise<{ launch_args: Record<string, unknown> }>
  dispatch: Dispatch<DebuggerAction>
  onInitRef: { current: (() => Promise<void>) | null }
  launchRef: { current: Record<string, unknown> }
  breakpoints: () => Record<string, number[]>
}

/**
 * Run the DAP start handshake. The adapter emits 'initialized' after we request
 * launch/attach; per spec the program only runs once we send configurationDone,
 * so breakpoints are set first and configurationDone last (otherwise the
 * debuggee runs to completion before any breakpoint binds). debugpy server-mode
 * wants 'attach'; spawn-adapters (node/go/cpp) want 'launch'.
 */
export async function startSession(
  d: StartDeps,
  language: string,
  files: Files,
  entryPoint: string,
) {
  d.dispatch({ type: 'START' })
  const runnerKey = runnerKeyFor(language)
  const bps = d.breakpoints() // capture now

  d.onInitRef.current = async () => {
    for (const [filename, lines] of Object.entries(bps)) {
      if (!lines.length) continue
      await d.send('setBreakpoints', setBreakpointsArgs(filename, lines))
    }
    await d.send('configurationDone')
  }

  try {
    const result = await d.start({ language: runnerKey, files, entryPoint })
    d.launchRef.current = result.launch_args
    // DAP messages are ordered over the adapter's TCP stream, so initialize
    // then launch/attach can be pipelined without awaiting the response.
    await d.send('initialize', initializeArgs(runnerKey))
    const reqCommand =
      (d.launchRef.current as { request?: string }).request ?? 'launch'
    await d.send(reqCommand, d.launchRef.current)
  } catch (err) {
    d.dispatch({
      type: 'ERROR',
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}
