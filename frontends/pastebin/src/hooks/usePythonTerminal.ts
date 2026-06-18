import { useEffect, useState, useRef } from 'react'
import {
  startInteractiveSession,
  pollSession,
  sendSessionInput,
} from '@/lib/flask-runner'

interface TerminalLine {
  type: 'output' | 'error' | 'input-prompt' | 'input-value'
  content: string
  id: string
}

// Maps backend line types to the terminal line types the UI expects
function mapType(backendType: string): TerminalLine['type'] {
  switch (backendType) {
    case 'err':
      return 'error'
    case 'prompt':
      return 'input-prompt'
    case 'input-echo':
      return 'input-value'
    default:
      return 'output'
  }
}

const POLL_INTERVAL_MS = 150

export function usePythonTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [waitingForInput, setWaitingForInput] = useState(false)
  const sessionIdRef = useRef<string | null>(null)
  const offsetRef = useRef(0)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)

  function addLine(type: TerminalLine['type'], content: string) {
    setLines(prev => [
      ...prev,
      { type, content, id: `${Date.now()}-${Math.random()}` },
    ])
  }
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
        addLine(mapType(line.type), line.text)
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

    // Re-arm only if still active, so a stopPolling() during the await can't
    // be overwritten by a stale in-flight poll rescheduling itself.
    if (activeRef.current) {
      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
    }
  }

  const handleRun = async (code: string) => {
    stopPolling()
    setLines([])
    setWaitingForInput(false)
    setInputValue('')
    offsetRef.current = 0
    sessionIdRef.current = null
    setIsRunning(true)

    try {
      const sid = await startInteractiveSession({
        language: 'python',
        files: [{ name: 'main.py', content: code }],
      })
      sessionIdRef.current = sid
      activeRef.current = true
      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
    } catch (err) {
      addLine('error', err instanceof Error ? err.message : String(err))
      setIsRunning(false)
    }
  }

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sid = sessionIdRef.current
    if (!waitingForInput || !sid) return

    const value = inputValue
    setInputValue('')
    setWaitingForInput(false)

    try {
      await sendSessionInput(sid, value)
    } catch (err) {
      addLine('error', err instanceof Error ? err.message : String(err))
    }
  }

  // Stop the poll loop on unmount so navigating away mid-run can't leave a
  // setTimeout loop alive holding the unmounted component's callbacks.
  useEffect(() => () => stopPolling(), [])

  return {
    lines,
    isRunning,
    isInitializing: false,
    inputValue,
    waitingForInput,
    setInputValue,
    handleInputSubmit,
    handleRun,
  }
}
