import { useRef } from 'react'
import {
  startInteractiveSession,
  pollSession,
  sendSessionInput,
} from '@/lib/flask-runner'
import { type TerminalLine } from './useCodeTerminal'

export const POLL_INTERVAL_MS = 150

export function mapOutputType(
  type: string
): TerminalLine['type'] {
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

  function stopPolling() {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  async function poll() {
    const sid = sessionIdRef.current
    if (!sid) return
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
    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
  }

  async function startSession(opts: {
    language: string
    files: { name: string; content: string }[]
    entryPoint: string
  }) {
    const sid = await startInteractiveSession(opts)
    sessionIdRef.current = sid
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

  return {
    sessionIdRef, offsetRef,
    stopPolling, poll, startSession, submitInput, stopSession,
  }
}
