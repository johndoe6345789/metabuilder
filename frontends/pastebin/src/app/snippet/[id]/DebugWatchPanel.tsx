'use client'

import { useState } from 'react'
import type { useDebugger, WatchEntry } from '@/hooks/useDebugger'
import styles from './DebugPanel.module.scss'

type Debugger = ReturnType<typeof useDebugger>

export function DebugWatchPanel({ dbg }: { dbg: Debugger }) {
  const [expr, setExpr] = useState('')
  const watches = dbg.state.watches

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = expr.trim()
    if (trimmed) {
      dbg.addWatch(trimmed)
      setExpr('')
    }
  }

  return (
    <section className={styles.pane}>
      <h4 className={styles.paneHead}>Watch</h4>
      {watches.map((w: WatchEntry, i) => (
        <div key={i} className={styles.watchRow}>
          <span className={styles.watchExpr}>{w.expr}</span>
          <span
            className={`${styles.watchVal} ${w.error ? styles.watchErr : ''}`}
          >
            {w.error ? `⚠ ${w.error}` : (w.value ?? '…')}
          </span>
          <button
            className={styles.watchRemove}
            onClick={() => dbg.removeWatch(i)}
            aria-label="Remove watch"
          >
            ×
          </button>
        </div>
      ))}
      <form onSubmit={submit} className={styles.watchForm}>
        <input
          className={styles.watchInput}
          value={expr}
          onChange={e => setExpr(e.target.value)}
          placeholder="Add expression…"
        />
        <button
          type="submit"
          className={styles.watchAdd}
          disabled={!expr.trim()}
        >
          +
        </button>
      </form>
    </section>
  )
}
