import { useEffect, useRef } from 'react'
import {
  startInteractiveSession,
  pollSession,
  sendSessionInput,
} from '@/lib/flask-runner'
import { type TerminalLine } from './useCodeTerminal'

export const POLL_INTERVAL_MS = 150

export function mapOutputType(type: string): TerminalLine['type'] {
  const map: Record<string, TerminalLine['type']> = {
    output: 'output',
    error: 'error',
    'input-prompt': 'input-prompt',
  }
  return map[type] ?? 'output'
}

export function useCodeTerminalSession(
  addLine: (type: TerminalLine['type'], content: string) => void,
  setIsRunning: (v: boolean) => void,
  setWaitingForInput: (v: boolean) => void,
) {
  const sessionIdRef = useRef<string | null>(null)
  const offsetRef = useRef(0)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)

  function stopPolling() {
    activeRef.current = false
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  async function poll() {
    const sid = sessionIdRef.current
    if (!sid || !activeRef.current) return
    try {
      const result = await pollSession(sid, offsetRef.current)
      offsetRef.current += result.output.length
      for (const line of result.output) {
        addLine(mapOutputType(line.type), line.text)
      }
      setWaitingForInput(result.waiting_for_input)
      if (result.done) {
        setIsRunning(false)
        stopPolling()
        return
      }
    } catch {
      // transient network error — keep polling
    }
    // Re-arm only if still active: stopPolling() during the await above must
    // not be overwritten by a stale in-flight poll rescheduling itself.
    if (activeRef.current) {
      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
    }
  }

  async function startSession(opts: {
    language: string
    files: { name: string; content: string }[]
    entryPoint: string
  }) {
    const sid = await startInteractiveSession(opts)
    sessionIdRef.current = sid
    activeRef.current = true
    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
  }

  async function submitInput(value: string) {
    const sid = sessionIdRef.current
    if (!sid) return
    await sendSessionInput(sid, value)
  }

  function stopSession() {
    stopPolling()
    sessionIdRef.current = null
  }

  // Stop the poll loop on unmount so navigating away mid-run can't leave a
  // setTimeout loop alive holding the unmounted component's callbacks.
  useEffect(() => () => stopPolling(), [])

  return {
    sessionIdRef,
    offsetRef,
    stopPolling,
    poll,
    startSession,
    submitInput,
    stopSession,
  }
}
