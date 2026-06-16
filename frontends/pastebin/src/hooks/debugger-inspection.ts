import type { Dispatch } from 'react'
import type {
  DebuggerAction,
  DapStackFrame,
  DapScope,
  DapVariable,
  WatchEntry,
} from './debugger-types'

type Dap = <T = unknown>(
  command: string,
  args?: Record<string, unknown>,
) => Promise<T>

export interface InspectDeps {
  dap: Dap
  dispatch: Dispatch<DebuggerAction>
  watchesRef: { current: WatchEntry[] }
}

export async function fetchVars(d: InspectDeps, ref: number) {
  const body = await d
    .dap<{ variables?: DapVariable[] }>('variables', {
      variablesReference: ref,
    })
    .catch(() => null)
  d.dispatch({ type: 'VARIABLES', ref, vars: body?.variables ?? [] })
}

export async function evalWatch(
  d: InspectDeps,
  index: number,
  expr: string,
  frameId?: number,
) {
  try {
    const body = await d.dap<{ result?: string }>('evaluate', {
      expression: expr,
      frameId,
      context: 'watch',
    })
    d.dispatch({ type: 'WATCH_RESULT', index, value: body?.result ?? null })
  } catch (err) {
    d.dispatch({
      type: 'WATCH_RESULT',
      index,
      value: null,
      error: err instanceof Error ? err.message : 'error',
    })
  }
}

/** On pause: fetch call stack, current line, scopes, variables and watches. */
export async function onStopped(d: InspectDeps, threadId: number) {
  const stBody = await d
    .dap<{ stackFrames?: DapStackFrame[] }>('stackTrace', {
      threadId,
      startFrame: 0,
      levels: 20,
    })
    .catch(() => null)
  const frames = stBody?.stackFrames ?? []
  d.dispatch({ type: 'CALL_STACK', frames })

  const top = frames[0]
  if (top) {
    // debugpy (and others) often send only source.path, no source.name —
    // derive the bare filename so it matches the editor's active file.
    const src = top.source
    const file =
      src?.name ?? (src?.path ? (src.path.split('/').pop() ?? null) : null)
    d.dispatch({ type: 'PAUSED', threadId, file, line: top.line })
  }
  if (!top) return

  const scopeBody = await d
    .dap<{ scopes?: DapScope[] }>('scopes', { frameId: top.id })
    .catch(() => null)
  const scopes = scopeBody?.scopes ?? []
  d.dispatch({ type: 'SCOPES', scopes })

  await Promise.all(
    scopes
      .filter(sc => !sc.expensive)
      .map(sc => fetchVars(d, sc.variablesReference)),
  )

  const watches = d.watchesRef.current
  await Promise.all(watches.map((w, i) => evalWatch(d, i, w.expr, top.id)))
}
