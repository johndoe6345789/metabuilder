import { useState } from 'react'
import { runCodeViaFlask } from '@/lib/flask-runner'
import { type SnippetFile } from '@/lib/types'
import { appConfig } from '@/lib/config'
import { safeFilesAndEntry } from './codeTerminalUtils'
import { useCodeTerminalSession } from './useCodeTerminalSession'

const languageRunnerMap: Record<string, string> =
  (appConfig as unknown as { languageRunnerMap: Record<string, string> })
    .languageRunnerMap ?? {}

function getRunnerKey(language: string): string {
  return (
    languageRunnerMap[language] ??
    language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  )
}

const INTERACTIVE_RUNNER_KEYS = new Set(['python'])

export interface TerminalLine {
  type: 'output' | 'error' | 'input-prompt' | 'input-value'
  content: string
  id: string
}

export interface RunFileMap {
  originalName: string
  uuidName: string
}

export interface RunDebugInfo {
  language: string
  runnerKey: string
  interactive: boolean
  files: RunFileMap[]
  entryPointOriginal: string
  entryPointSent: string
  startedAt: number
}

export type UseCodeTerminalReturn = ReturnType<typeof useCodeTerminal>

export function useCodeTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [waitingForInput, setWaitingForInput] = useState(false)
  const [lastRunInfo, setLastRunInfo] = useState<RunDebugInfo | null>(null)

  function addLine(type: TerminalLine['type'], content: string) {
    setLines(prev => [
      ...prev,
      { type, content, id: `${Date.now()}-${Math.random()}` },
    ])
  }

  const session = useCodeTerminalSession(
    addLine,
    setIsRunning,
    setWaitingForInput,
  )

  const handleRun = async (
    language: string,
    files: SnippetFile[],
    entryPoint?: string,
  ) => {
    session.stopPolling()
    setLines([])
    setWaitingForInput(false)
    setInputValue('')
    // eslint-disable-next-line react-hooks/immutability
    session.offsetRef.current = 0
    session.sessionIdRef.current = null
    setIsRunning(true)

    const runnerKey = getRunnerKey(language)
    const isInteractive = INTERACTIVE_RUNNER_KEYS.has(runnerKey)
    const { safeFiles, resolvedEntry, fileMap } = safeFilesAndEntry(
      files,
      entryPoint ?? '',
    )
    const opts = {
      language: runnerKey,
      files: safeFiles,
      entryPoint: resolvedEntry,
    }

    setLastRunInfo({
      language,
      runnerKey,
      interactive: isInteractive,
      files: fileMap,
      entryPointOriginal: entryPoint ?? '',
      entryPointSent: resolvedEntry,
      startedAt: Date.now(),
    })

    try {
      if (isInteractive) {
        await session.startSession(opts)
      } else {
        const result = await runCodeViaFlask(opts)
        if (result.output) addLine('output', result.output)
        if (result.error) addLine('error', result.error)
        setIsRunning(false)
      }
    } catch (err) {
      addLine('error', err instanceof Error ? err.message : String(err))
      setIsRunning(false)
    }
  }

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitingForInput || !session.sessionIdRef.current) return
    const value = inputValue
    setInputValue('')
    setWaitingForInput(false)
    try {
      await session.submitInput(value)
    } catch (err) {
      addLine('error', err instanceof Error ? err.message : String(err))
    }
  }

  const handleStop = () => {
    session.stopSession()
    setIsRunning(false)
    setWaitingForInput(false)
    addLine('error', '[stopped]')
  }

  return {
    lines,
    isRunning,
    isInitializing: false,
    inputValue,
    waitingForInput,
    lastRunInfo,
    setInputValue,
    handleInputSubmit,
    handleRun,
    handleStop,
  }
}
