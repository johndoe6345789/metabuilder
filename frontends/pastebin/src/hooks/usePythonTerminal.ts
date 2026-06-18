import { useState } from 'react'
import { startInteractiveSession, sendSessionInput } from '@/lib/flask-runner'
import { useSessionPoller } from './useSessionPoller'

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

  function addLine(type: TerminalLine['type'], content: string) {
    setLines(prev => [
      ...prev,
      { type, content, id: `${Date.now()}-${Math.random()}` },
    ])
  }

  const { sessionIdRef, begin, stop } = useSessionPoller(
    result => {
      for (const line of result.output) {
        addLine(mapType(line.type), line.text)
      }
      setWaitingForInput(result.waiting_for_input)
      if (result.done) setIsRunning(false)
    },
    () => {},
    POLL_INTERVAL_MS,
  )

  const handleRun = async (code: string) => {
    stop()
    setLines([])
    setWaitingForInput(false)
    setInputValue('')
    sessionIdRef.current = null
    setIsRunning(true)

    try {
      const sid = await startInteractiveSession({
        language: 'python',
        files: [{ name: 'main.py', content: code }],
      })
      begin(sid)
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
