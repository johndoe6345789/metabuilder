import { useReducer, useRef, useCallback, useEffect } from 'react'
import { useDebugSession } from './useDebugSession'
import type { DapMessage } from '@/lib/flask-debugger'
import type { WatchEntry } from './debugger-types'
import { debuggerReducer, initialDebuggerState } from './debugger-reducer'
import { SUPPORTED_LANGUAGES } from './debugger-runners'
import { dapRequest } from './debugger-requests'
import { fetchVars } from './debugger-inspection'
import { handleDapMessage } from './debugger-messages'
import { startSession } from './debugger-start'
import { makeControls } from './debugger-controls'
import { useLatestRef } from './useLatestRef'

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

  // Fire-and-forget DAP request (returns the send promise).
  function send(command: string, args: Record<string, unknown> = {}) {
    return session.send(dapRequest(nextSeq(), command, args))
  }

  function stopSession() {
    return session.stop()
  }

  function threadId() {
    return stateRef.current.threadId
  }

  // Deps for the extracted inspection helpers; read lazily so the stable
  // onMessage callback always uses the current dap/dispatch/watches.
  const inspect = useLatestRef({ dap, dispatch, watchesRef })

  // Stable message handler (no state deps); reads everything through refs.
  const onMessage = useCallback((msg: DapMessage) => {
    handleDapMessage(
      { dispatch, pendingRef, onInitRef, inspectRef: inspect },
      msg,
    )
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
    await session.send(dapRequest(seq, command, args))
    const resp = await p
    if (!(resp as { success?: boolean }).success) {
      throw new Error(
        (resp as { message?: string }).message ?? `${command} failed`,
      )
    }
    return (resp as { body?: T }).body as T
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  function startDebugging(
    language: string,
    files: { name: string; content: string }[],
    entryPoint: string,
  ) {
    return startSession(
      {
        send,
        start: opts => session.start(opts),
        dispatch,
        onInitRef,
        launchRef,
        breakpoints: () => stateRef.current.breakpoints,
      },
      language,
      files,
      entryPoint,
    )
  }

  // send/stop/threadId only read refs when invoked (event handlers), not
  // during render — the react-hooks/refs rule can't see that here.
  // eslint-disable-next-line react-hooks/refs
  const controls = makeControls({
    send,
    stop: stopSession,
    dispatch,
    threadId,
  })

  const toggleBreakpoint = (file: string, line: number) =>
    dispatch({ type: 'TOGGLE_BP', file, line })

  const addWatch = (expr: string) => dispatch({ type: 'ADD_WATCH', expr })
  const removeWatch = (index: number) =>
    dispatch({ type: 'REMOVE_WATCH', index })

  const expandVariable = (ref: number) => {
    void fetchVars(inspect.current, ref)
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
    ...controls,
    toggleBreakpoint,
    addWatch,
    removeWatch,
    expandVariable,
  }
}
