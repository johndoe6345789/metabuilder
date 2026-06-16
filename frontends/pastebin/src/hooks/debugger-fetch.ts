import type { DapVariable } from './debugger-types'
import type { InspectDeps } from './debugger-deps'

/** Fetch a scope/variable's children and dispatch them under its reference. */
export async function fetchVars(d: InspectDeps, ref: number) {
  const body = await d
    .dap<{ variables?: DapVariable[] }>('variables', {
      variablesReference: ref,
    })
    .catch(() => null)
  d.dispatch({ type: 'VARIABLES', ref, vars: body?.variables ?? [] })
}

/** Evaluate a watch expression in a frame; dispatch the result or error. */
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
