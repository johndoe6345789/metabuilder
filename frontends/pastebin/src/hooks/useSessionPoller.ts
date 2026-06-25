import { useEffect, useRef } from 'react'
import { pollSession, type PollResult } from '@/lib/flask-runner'
import { useLatestRef } from './useLatestRef'

/**
 * Drives the shared "poll a Flask interactive session until done" loop used by
 * both the code-runner and Python terminals. Owns the session id, output
 * offset, timer and active flag, and guarantees:
 *  - the loop is torn down on unmount (no orphaned setTimeout holding the
 *    unmounted component's callbacks),
 *  - a stop() during an in-flight poll is not overwritten by a stale
 *    reschedule (the activeRef re-arm guard).
 * Callbacks are read through a latest-ref so the long-lived loop never sees a
 * stale closure.
 */
export function useSessionPoller(
  onResult: (result: PollResult) => void,
  onDone: () => void,
  intervalMs: number,
) {
  const sessionIdRef = useRef<string | null>(null)
  const offsetRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)
  const cb = useLatestRef({ onResult, onDone })

  function stop() {
    activeRef.current = false
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  async function tick() {
    const sid = sessionIdRef.current
    if (!sid || !activeRef.current) return
    try {
      const result = await pollSession(sid, offsetRef.current)
      offsetRef.current += result.output.length
      cb.current.onResult(result)
      if (result.done) {
        stop()
        cb.current.onDone()
        return
      }
    } catch {
      // transient network error — keep polling
    }
    if (activeRef.current) {
      timerRef.current = setTimeout(tick, intervalMs)
    }
  }

  function begin(sessionId: string) {
    sessionIdRef.current = sessionId
    offsetRef.current = 0
    activeRef.current = true
    timerRef.current = setTimeout(tick, intervalMs)
  }

  useEffect(() => stop, [])

  return { sessionIdRef, offsetRef, begin, stop }
}
