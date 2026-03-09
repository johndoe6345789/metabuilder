'use client'

import { useRef, useEffect } from 'react'
import { TerminalOutput } from '@/components/features/python-runner/TerminalOutput'
import { TerminalInput } from '@/components/features/python-runner/TerminalInput'
import { type SnippetFile } from '@/lib/types'
import { type UseCodeTerminalReturn } from '@/hooks/useCodeTerminal'
import { appConfig } from '@/lib/config'
import styles from './CodeTerminal.module.scss'

const INTERACTIVE_RUNNER_KEYS = new Set(['python'])
const languageRunnerMap: Record<string, string> = (appConfig as unknown as { languageRunnerMap: Record<string, string> }).languageRunnerMap ?? {}
const getRunnerKey = (lang: string) => languageRunnerMap[lang] ?? lang.toLowerCase().replace(/[^a-z0-9]+/g, '-')

interface CodeTerminalProps {
  language: string
  files: SnippetFile[]
  entryPoint?: string
  controller: UseCodeTerminalReturn
}

export function CodeTerminal({ language, files, entryPoint, controller }: CodeTerminalProps) {
  const {
    lines,
    isRunning,
    inputValue,
    waitingForInput,
    setInputValue,
    handleInputSubmit,
  } = controller

  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const hasErrors = lines.some((line) => line.type === 'error')
  const supportsInteractive = INTERACTIVE_RUNNER_KEYS.has(getRunnerKey(language))

  return (
    <div className={styles.terminal} data-testid="code-terminal">
      <div
        className={styles.srOnly}
        role="status"
        aria-live={hasErrors ? 'assertive' : 'polite'}
        aria-atomic="true"
        data-testid="terminal-status"
      >
        {isRunning && 'Code is running'}
        {waitingForInput && supportsInteractive && 'Waiting for user input'}
        {!isRunning && lines.length > 0 && `${lines.length} lines of output`}
        {hasErrors && 'Errors detected in output'}
      </div>

      <div
        className={styles.output}
        data-testid="terminal-output-area"
        role="region"
        aria-label="Terminal output"
        aria-live="polite"
        aria-atomic="false"
      >
        <TerminalOutput lines={lines} isRunning={isRunning} />
        {supportsInteractive && (
          <TerminalInput
            waitingForInput={waitingForInput}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={handleInputSubmit}
          />
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  )
}
