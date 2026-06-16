import { useReducer, useRef, useCallback, useEffect } from 'react'
import { useDebugSession } from './useDebugSession'
import type { DapMessage } from '@/lib/flask-debugger'
import type {
  DapStackFrame,
  DapScope,
  DapVariable,
  WatchEntry,
} from './debugger-types'
import { debuggerReducer, initialDebuggerState } from './debugger-reducer'
import { runnerKeyFor, SUPPORTED_LANGUAGES } from './debugger-runners'

export type {
  DebugStatus,
  DapStackFrame,
  DapScope,
  DapVariable,
  WatchEntry,
  DebuggerState,
} from './debugger-types'

export function useDebugger() {
  const [state, dispatch] = useReducer(
    debuggerReducer,
    initialDebuggerState,
  )

  // Refs for values accessed inside stable callbacks
  const seqRef = useRef(1)
  const pendingRef = useRef(new Map<number, (m: DapMessage) => void>())
  const launchRef = useRef<Record<string, unknown>>({})
  const onInitRef = useRef<(() => Promise<void>) | null>(null)
  const watchesRef = useRef<WatchEntry[]>([])
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])
  useEffect(() => {
    watchesRef.current = state.watches
  }, [state.watches])

  function nextSeq() {
    return seqRef.current++
  }

  // ------------------------------------------------------------------
  // Message handler — must be stable (no state deps); uses only refs
  // ------------------------------------------------------------------
  const onMessage = useCallback((msg: DapMessage) => {
    if (msg.type === 'response') {
      const seq = msg.request_seq as number
      const resolve = pendingRef.current.get(seq)
      if (resolve) {
        pendingRef.current.delete(seq)
        resolve(msg)
      }
      return
    }
    if (msg.type !== 'event') return

    switch (msg.event as string) {
      case 'initialized':
        void onInitRef.current?.()
        break
      case 'stopped': {
        const body = (msg.body ?? {}) as { reason?: string; threadId?: number }
        const tid = body.threadId ?? 1
        dispatch({ type: 'PAUSED', threadId: tid, file: null, line: null })
        void onStopped(tid)
        break
      }
      case 'continued':
        dispatch({ type: 'RUNNING' })
        break
      case 'terminated':
      case 'exited':
        dispatch({ type: 'TERMINATED' })
        break
      case 'output': {
        const body = (msg.body ?? {}) as { category?: string; output?: string }
        if (body.output) {
          dispatch({
            type: 'OUTPUT',
            category: body.category ?? 'stdout',
            text: body.output,
          })
        }
        break
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onDone = useCallback(() => dispatch({ type: 'TERMINATED' }), [])

  const session = useDebugSession(onMessage, onDone)

  // ------------------------------------------------------------------
  // Promise-based DAP request helper
  // ------------------------------------------------------------------
  async function dap<T = unknown>(
    command: string,
    args: Record<string, unknown> = {},
  ): Promise<T> {
    const seq = nextSeq()
    const p = new Promise<DapMessage>(resolve =>
      pendingRef.current.set(seq, resolve),
    )
    await session.send({ seq, type: 'request', command, arguments: args })
    const resp = await p
    if (!(resp as { success?: boolean }).success) {
      throw new Error(
        (resp as { message?: string }).message ?? `${command} failed`,
      )
    }
    return (resp as { body?: T }).body as T
  }

  // ------------------------------------------------------------------
  // Fetch + dispatch call stack, scopes, variables on pause
  // ------------------------------------------------------------------
  async function onStopped(threadId: number) {
    const stBody = await dap<{ stackFrames?: DapStackFrame[] }>('stackTrace', {
      threadId,
      startFrame: 0,
      levels: 20,
    }).catch(() => null)
    const frames = stBody?.stackFrames ?? []
    dispatch({ type: 'CALL_STACK', frames })

    const top = frames[0]
    if (top) {
      // debugpy (and others) often send only source.path, no source.name —
      // derive the bare filename so it matches the editor's active file.
      const src = top.source
      const file =
        src?.name ?? (src?.path ? (src.path.split('/').pop() ?? null) : null)
      dispatch({
        type: 'PAUSED',
        threadId,
        file,
        line: top.line,
      })
    }

    if (!top) return

    const scopeBody = await dap<{ scopes?: DapScope[] }>('scopes', {
      frameId: top.id,
    }).catch(() => null)
    const scopes = scopeBody?.scopes ?? []
    dispatch({ type: 'SCOPES', scopes })

    await Promise.all(
      scopes
        .filter(sc => !sc.expensive)
        .map(sc => fetchVars(sc.variablesReference)),
    )

    // Re-evaluate watches
    const watches = watchesRef.current
    await Promise.all(watches.map((w, i) => evalWatch(i, w.expr, top.id)))
  }

  async function fetchVars(ref: number) {
    const body = await dap<{ variables?: DapVariable[] }>('variables', {
      variablesReference: ref,
    }).catch(() => null)
    const vars = body?.variables ?? []
    dispatch({ type: 'VARIABLES', ref, vars })
  }

  async function evalWatch(index: number, expr: string, frameId?: number) {
    try {
      const body = await dap<{ result?: string }>('evaluate', {
        expression: expr,
        frameId,
        context: 'watch',
      })
      dispatch({ type: 'WATCH_RESULT', index, value: body?.result ?? null })
    } catch (err) {
      dispatch({
        type: 'WATCH_RESULT',
        index,
        value: null,
        error: err instanceof Error ? err.message : 'error',
      })
    }
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  async function startDebugging(
    language: string,
    files: { name: string; content: string }[],
    entryPoint: string,
  ) {
    dispatch({ type: 'START' })
    const runnerKey = runnerKeyFor(language)
    const bps = stateRef.current.breakpoints // capture now

    // The adapter emits 'initialized' after we request launch/attach. Per the
    // DAP spec the program only starts running once we send configurationDone,
    // so breakpoints MUST be set here first and configurationDone sent last —
    // otherwise the debuggee runs to completion before any breakpoint binds.
    onInitRef.current = async () => {
      for (const [filename, lines] of Object.entries(bps)) {
        if (!lines.length) continue
        await session.send({
          seq: nextSeq(),
          type: 'request',
          command: 'setBreakpoints',
          arguments: {
            source: { name: filename, path: `/workspace/${filename}` },
            breakpoints: lines.map(l => ({ line: l })),
            sourceModified: false,
          },
        })
      }
      await session.send({
        seq: nextSeq(),
        type: 'request',
        command: 'configurationDone',
        arguments: {},
      })
    }

    try {
      const result = await session.start({
        language: runnerKey,
        files,
        entryPoint,
      })
      launchRef.current = result.launch_args

      // 1. initialize. DAP messages are ordered over the adapter's TCP stream,
      //    so we can pipeline initialize then launch/attach without awaiting
      //    the initialize response — the adapter processes them in order.
      await session.send({
        seq: nextSeq(),
        type: 'request',
        command: 'initialize',
        arguments: {
          clientID: 'codesnippet',
          clientName: 'CodeSnippet Debugger',
          adapterID: runnerKey,
          pathFormat: 'path',
          linesStartAt1: true,
          columnsStartAt1: true,
          supportsVariableType: true,
          supportsVariablePaging: false,
          supportsRunInTerminalRequest: false,
        },
      })

      // 2. launch/attach — this triggers the adapter's 'initialized' event,
      //    which runs onInitRef (setBreakpoints → configurationDone). The
      //    command must match the runner: debugpy server-mode wants 'attach',
      //    spawn-adapters (node/go/cpp) want 'launch'. Its response only
      //    arrives after configurationDone, so we don't await it.
      const reqCommand =
        (launchRef.current as { request?: string }).request ?? 'launch'
      await session.send({
        seq: nextSeq(),
        type: 'request',
        command: reqCommand,
        arguments: launchRef.current,
      })
    } catch (err) {
      dispatch({
        type: 'ERROR',
        error: err instanceof Error ? err.message : String(err),
      })
      throw err
    }
  }

  async function stopDebugging() {
    // Best-effort disconnect request before killing
    await session
      .send({
        seq: nextSeq(),
        type: 'request',
        command: 'disconnect',
        arguments: { restart: false },
      })
      .catch(() => {})
    dispatch({ type: 'RESET' })
    await session.stop()
  }

  const stepOver = () =>
    session.send({
      seq: nextSeq(),
      type: 'request',
      command: 'next',
      arguments: { threadId: stateRef.current.threadId },
    })

  const stepIn = () =>
    session.send({
      seq: nextSeq(),
      type: 'request',
      command: 'stepIn',
      arguments: { threadId: stateRef.current.threadId },
    })

  const stepOut = () =>
    session.send({
      seq: nextSeq(),
      type: 'request',
      command: 'stepOut',
      arguments: { threadId: stateRef.current.threadId },
    })

  const resume = () => {
    dispatch({ type: 'RUNNING' })
    session.send({
      seq: nextSeq(),
      type: 'request',
      command: 'continue',
      arguments: { threadId: stateRef.current.threadId },
    })
  }

  const pause = () =>
    session.send({
      seq: nextSeq(),
      type: 'request',
      command: 'pause',
      arguments: { threadId: stateRef.current.threadId },
    })

  const toggleBreakpoint = (file: string, line: number) =>
    dispatch({ type: 'TOGGLE_BP', file, line })

  const addWatch = (expr: string) => dispatch({ type: 'ADD_WATCH', expr })
  const removeWatch = (index: number) =>
    dispatch({ type: 'REMOVE_WATCH', index })

  const expandVariable = (ref: number) => {
    void fetchVars(ref)
  }

  const isActive = state.status !== 'idle'
  const isPaused = state.status === 'paused'
  const supportedLanguages = SUPPORTED_LANGUAGES

  return {
    state,
    isActive,
    isPaused,
    supportedLanguages,
    startDebugging,
    stopDebugging,
    stepOver,
    stepIn,
    stepOut,
    resume,
    pause,
    toggleBreakpoint,
    addWatch,
    removeWatch,
    expandVariable,
  }
}
