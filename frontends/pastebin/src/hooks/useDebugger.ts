import { useReducer, useRef, useCallback, useEffect } from 'react'
import { useDebugSession } from './useDebugSession'
import type { DapMessage } from '@/lib/flask-debugger'

export type DebugStatus =
  | 'idle'
  | 'starting'
  | 'running'
  | 'paused'
  | 'terminated'
  | 'error'

export interface DapStackFrame {
  id: number
  name: string
  source?: { name?: string; path?: string }
  line: number
  column: number
}

export interface DapScope {
  name: string
  variablesReference: number
  expensive: boolean
}

export interface DapVariable {
  name: string
  value: string
  type?: string
  variablesReference: number
}

export interface WatchEntry {
  expr: string
  value: string | null
  error?: string
}

export interface DebuggerState {
  status: DebugStatus
  error: string | null
  breakpoints: Record<string, number[]> // filename → 1-indexed line numbers
  currentFile: string | null
  currentLine: number | null
  threadId: number
  callStack: DapStackFrame[]
  scopes: DapScope[]
  variables: Record<number, DapVariable[]> // variablesReference → vars
  watches: WatchEntry[]
  output: { category: string; text: string }[]
}

type Action =
  | { type: 'START' }
  | { type: 'RUNNING' }
  | {
      type: 'PAUSED'
      threadId: number
      file: string | null
      line: number | null
    }
  | { type: 'TERMINATED' }
  | { type: 'ERROR'; error: string }
  | { type: 'CALL_STACK'; frames: DapStackFrame[] }
  | { type: 'SCOPES'; scopes: DapScope[] }
  | { type: 'VARIABLES'; ref: number; vars: DapVariable[] }
  | {
      type: 'WATCH_RESULT'
      index: number
      value: string | null
      error?: string
    }
  | { type: 'ADD_WATCH'; expr: string }
  | { type: 'REMOVE_WATCH'; index: number }
  | { type: 'TOGGLE_BP'; file: string; line: number }
  | { type: 'OUTPUT'; category: string; text: string }
  | { type: 'RESET' }

const initial: DebuggerState = {
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

function reducer(s: DebuggerState, a: Action): DebuggerState {
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
        ...initial,
        breakpoints: s.breakpoints,
        watches: s.watches.map(w => ({ ...w, value: null })),
      }
    default:
      return s
  }
}

// Map display language names to runner keys
const LANG_KEY: Record<string, string> = {
  Python: 'python',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Go: 'go',
  'C++': 'cpp-cmake',
}

export function useDebugger() {
  const [state, dispatch] = useReducer(reducer, initial)

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
      dispatch({
        type: 'PAUSED',
        threadId,
        file: top.source?.name ?? null,
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
    const runnerKey =
      LANG_KEY[language] ?? language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
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
  const supportedLanguages = Object.keys(LANG_KEY)

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
