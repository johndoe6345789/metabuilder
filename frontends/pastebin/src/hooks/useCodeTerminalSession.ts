import { startInteractiveSession, sendSessionInput } from '@/lib/flask-runner'
import { type TerminalLine } from './useCodeTerminal'
import { useSessionPoller } from './useSessionPoller'

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
  const { sessionIdRef, offsetRef, begin, stop } = useSessionPoller(
    result => {
      for (const line of result.output) {
        addLine(mapOutputType(line.type), line.text)
      }
      setWaitingForInput(result.waiting_for_input)
      if (result.done) setIsRunning(false)
    },
    () => {},
    POLL_INTERVAL_MS,
  )

  async function startSession(opts: {
    language: string
    files: { name: string; content: string }[]
    entryPoint: string
  }) {
    begin(await startInteractiveSession(opts))
  }

  async function submitInput(value: string) {
    const sid = sessionIdRef.current
    if (!sid) return
    await sendSessionInput(sid, value)
  }

  function stopSession() {
    stop()
    sessionIdRef.current = null
  }

  return {
    sessionIdRef,
    offsetRef,
    stopPolling: stop,
    startSession,
    submitInput,
    stopSession,
  }
}
