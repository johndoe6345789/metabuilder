import { useState, useEffect, useRef } from 'react'
import { runPythonCodeInteractive, getPyodide, isPyodideReady } from '@/lib/pyodide-runner'
import { toast } from 'sonner'

interface TerminalLine {
  type: 'output' | 'error' | 'input-prompt' | 'input-value'
  content: string
  id: string
}

export function usePythonTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(!isPyodideReady())
  const [inputValue, setInputValue] = useState('')
  const [waitingForInput, setWaitingForInput] = useState(false)
  const inputResolveRef = useRef<((value: string) => void) | null>(null)

  useEffect(() => {
    if (!isPyodideReady()) {
      setIsInitializing(true)
      getPyodide()
        .then(() => {
          setIsInitializing(false)
          toast.success('Python environment ready!')
        })
        .catch((err) => {
          setIsInitializing(false)
          toast.error('Failed to load Python environment')
          console.error(err)
        })
    }
  }, [])

  const addLine = (type: TerminalLine['type'], content: string) => {
    setLines((prev) => [
      ...prev,
      { type, content, id: `${Date.now()}-${Math.random()}` },
    ])
  }

  const handleInputPrompt = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      addLine('input-prompt', prompt)
      setWaitingForInput(true)
      inputResolveRef.current = resolve
    })
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitingForInput || !inputResolveRef.current) return

    const value = inputValue
    addLine('input-value', value)
    setInputValue('')
    setWaitingForInput(false)
    
    const resolve = inputResolveRef.current
    inputResolveRef.current = null
    resolve(value)
  }

  const handleRun = async (code: string) => {
    if (isInitializing) {
      toast.info('Python environment is still loading...')
      return
    }

    setIsRunning(true)
    setLines([])
    setWaitingForInput(false)
    setInputValue('')

    try {
      await runPythonCodeInteractive(code, {
        onOutput: (text) => {
          addLine('output', text)
        },
        onError: (text) => {
          addLine('error', text)
        },
        onInputRequest: handleInputPrompt,
      })
    } catch (err) {
      addLine('error', err instanceof Error ? err.message : String(err))
    } finally {
      setIsRunning(false)
      setWaitingForInput(false)
    }
  }

  return {
    lines,
    isRunning,
    isInitializing,
    inputValue,
    waitingForInput,
    setInputValue,
    handleInputSubmit,
    handleRun,
  }
}
