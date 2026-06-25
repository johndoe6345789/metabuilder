import { useEffect, useRef } from 'react'
import {
  startDebugSession,
  pollDebugSession,
  sendDapMessage,
  stopDebugSession,
  type DapMessage,
  type StartDebugResult,
} from '@/lib/flask-debugger'

const POLL_MS = 100

export function useDebugSession(
  onMessage: (msg: DapMessage) => void,
  onDone: () => void,
) {
  const sessionIdRef = useRef<string | null>(null)
  const offsetRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)

  function stopPolling() {
    activeRef.current = false
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  async function poll() {
    const sid = sessionIdRef.current
    if (!sid || !activeRef.current) return
    try {
      const result = await pollDebugSession(sid, offsetRef.current)
      offsetRef.current += result.messages.length
      for (const msg of result.messages) onMessage(msg)
      if (result.done) {
        stopPolling()
        onDone()
        return
      }
    } catch {
      // transient — keep polling
    }
    if (activeRef.current) {
      timerRef.current = setTimeout(poll, POLL_MS)
    }
  }

  async function start(opts: {
    language: string
    files: { name: string; content: string }[]
    entryPoint: string
  }): Promise<StartDebugResult> {
    const result = await startDebugSession(opts)
    sessionIdRef.current = result.session_id
    offsetRef.current = 0
    activeRef.current = true
    timerRef.current = setTimeout(poll, POLL_MS)
    return result
  }

  async function send(msg: Record<string, unknown>): Promise<void> {
    const sid = sessionIdRef.current
    if (!sid) throw new Error('No active debug session')
    await sendDapMessage(sid, msg)
  }

  async function stop(): Promise<void> {
    const sid = sessionIdRef.current
    stopPolling()
    sessionIdRef.current = null
    if (sid) await stopDebugSession(sid)
  }

  // On unmount, kill the poll loop and tear down the backend session so a
  // navigate-away mid-debug can't leave an orphaned setTimeout loop (holding
  // the unmounted component's closures) or a stranded debug container.
  useEffect(() => {
    return () => {
      activeRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      const sid = sessionIdRef.current
      if (sid) void stopDebugSession(sid)
    }
  }, [])

  return { sessionIdRef, start, send, stop }
}
