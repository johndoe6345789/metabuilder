import type { DapStackFrame, DapScope } from './debugger-types'
import type { InspectDeps } from './debugger-deps'
import { fetchVars, evalWatch } from './debugger-fetch'

export type { InspectDeps } from './debugger-deps'

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
