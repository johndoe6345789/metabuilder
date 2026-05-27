'use client'

import type { RefObject } from 'react'
import styles from '../QueryConsole.module.scss'
import cfg from '../data/queryConsole.json'

const { cliExamples } = cfg

interface CliPanelProps {
  cliInput: string
  loading: boolean
  cliRef: RefObject<HTMLInputElement | null>
  onInputChange: (v: string) => void
  onRun: () => void
}

export function CliPanel({
  cliInput,
  loading,
  cliRef,
  onInputChange,
  onRun,
}: CliPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.cliRow}>
        <span className={styles.cliPrompt}>$</span>
        <input
          ref={cliRef}
          className={styles.cliInput}
          value={cliInput}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && onRun()}
          placeholder="dbal list Snippet"
          autoFocus
        />
        <button
          className={styles.executeBtn}
          onClick={onRun}
          disabled={loading || !cliInput.trim()}
          type="button"
        >
          {loading ? '...' : 'Run'}
        </button>
      </div>
      <div className={styles.cliHelp}>
        <span className={styles.cliHelpLabel}>Examples:</span>
        {cliExamples.map(ex => (
          <button
            key={ex}
            className={styles.cliExample}
            onClick={() => {
              onInputChange(ex)
              cliRef.current?.focus()
            }}
            type="button"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
