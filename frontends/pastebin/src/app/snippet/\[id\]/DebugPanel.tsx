'use client'

import { useState } from 'react'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import type {
  useDebugger,
  DapStackFrame,
  DapVariable,
  WatchEntry,
} from '@/hooks/useDebugger'
import styles from './DebugPanel.module.scss'

type Debugger = ReturnType<typeof useDebugger>

interface Props {
  language: string
  debugger: Debugger
  onStart: () => void
}

// ---------------------------------------------------------------------------
// Sub-components (kept inline — each <80 LOC)
// ---------------------------------------------------------------------------

function DebugControls({ dbg }: { dbg: Debugger }) {
  const { state, isPaused, isActive } = dbg
  const status = state.status

  return (
    <div className={styles.controls}>
      {isPaused && (
        <>
          <button
            className={styles.ctrlBtn}
            onClick={() => void dbg.resume()}
            title="Continue (F5)"
          >
            <MaterialIcon name="play_arrow" size={16} />
          </button>
          <button
            className={styles.ctrlBtn}
            onClick={() => void dbg.stepOver()}
            title="Step Over (F10)"
          >
            <MaterialIcon name="skip_next" size={16} />
          </button>
          <button
            className={styles.ctrlBtn}
            onClick={() => void dbg.stepIn()}
            title="Step Into (F11)"
          >
            <MaterialIcon name="arrow_downward" size={16} />
          </button>
          <button
            className={styles.ctrlBtn}
            onClick={() => void dbg.stepOut()}
            title="Step Out (⇧F11)"
          >
            <MaterialIcon name="arrow_upward" size={16} />
          </button>
        </>
      )}
      {status === 'running' && (
        <button
          className={styles.ctrlBtn}
          onClick={() => void dbg.pause()}
          title="Pause"
        >
          <MaterialIcon name="pause" size={16} />
        </button>
      )}
      {isActive && (
        <button
          className={`${styles.ctrlBtn} ${styles.ctrlStop}`}
          onClick={() => void dbg.stopDebugging()}
          title="Stop"
        >
          <MaterialIcon name="stop" size={16} />
        </button>
      )}
      <span className={styles.statusBadge} data-status={status}>
        {status}
      </span>
    </div>
  )
}

function VariableRow({
  v,
  indent,
  onExpand,
}: {
  v: DapVariable
  indent: number
  onExpand: (ref: number) => void
}) {
  const expandable = v.variablesReference > 0
  return (
    <div
      className={`${styles.varRow} ${expandable ? styles.varExpandable : ''}`}
      style={{ paddingLeft: 8 + indent * 16 }}
      onClick={() => expandable && onExpand(v.variablesReference)}
    >
      {expandable && <MaterialIcon name="chevron_right" size={12} />}
      <span className={styles.varName}>{v.name}</span>
      <span className={styles.varEq}>=</span>
      <span className={styles.varVal}>{v.value}</span>
      {v.type && <span className={styles.varType}>{v.type}</span>}
    </div>
  )
}

function VariablesPanel({ dbg }: { dbg: Debugger }) {
  const { scopes, variables } = dbg.state
  if (!scopes.length) return null

  return (
    <section className={styles.pane}>
      <h4 className={styles.paneHead}>Variables</h4>
      {scopes.map(scope => (
        <div key={scope.variablesReference}>
          <div className={styles.scopeHead}>{scope.name}</div>
          {(variables[scope.variablesReference] ?? []).map(v => (
            <VariableRow
              key={v.name}
              v={v}
              indent={0}
              onExpand={dbg.expandVariable}
            />
          ))}
        </div>
      ))}
    </section>
  )
}

function CallStackPanel({ frames }: { frames: DapStackFrame[] }) {
  if (!frames.length) return null
  return (
    <section className={styles.pane}>
      <h4 className={styles.paneHead}>Call Stack</h4>
      {frames.map((f, i) => (
        <div
          key={f.id}
          className={`${styles.frame} ${i === 0 ? styles.frameActive : ''}`}
        >
          <span className={styles.frameName}>{f.name}</span>
          {f.source?.name && (
            <span className={styles.frameLoc}>
              {f.source.name}:{f.line}
            </span>
          )}
        </div>
      ))}
    </section>
  )
}

function WatchPanel({ dbg }: { dbg: Debugger }) {
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

function DebugOutput({
  output,
}: {
  output: Array<{ category: string; text: string }>
}) {
  if (!output.length) return null
  return (
    <section className={styles.pane}>
      <h4 className={styles.paneHead}>Output</h4>
      <pre className={styles.outputPre}>
        {output.map((o, i) => (
          <span key={i} data-cat={o.category}>
            {o.text}
          </span>
        ))}
      </pre>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function DebugPanel({ language, debugger: dbg, onStart }: Props) {
  const { state, isActive, supportedLanguages } = dbg
  const langKey = language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const supported = supportedLanguages.some(
    k => k === langKey || language.toLowerCase().startsWith(k),
  )

  if (!isActive) {
    return (
      <div className={styles.idle}>
        {supported ? (
          <>
            <p className={styles.idleHint}>
              Click in the editor gutter to set breakpoints, then start the
              debugger.
            </p>
            <button className={styles.startBtn} onClick={onStart}>
              <MaterialIcon name="bug_report" size={16} />
              Start Debugging
            </button>
          </>
        ) : (
          <p className={styles.idleHint}>
            Debugger not supported for <strong>{language}</strong>. Supported:
            Python, JavaScript, TypeScript, Go.
          </p>
        )}
        {state.status === 'error' && state.error && (
          <p className={styles.errorMsg}>{state.error}</p>
        )}
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <DebugControls dbg={dbg} />
      <div className={styles.panels}>
        <VariablesPanel dbg={dbg} />
        <CallStackPanel frames={state.callStack} />
        <WatchPanel dbg={dbg} />
        <DebugOutput output={state.output} />
      </div>
    </div>
  )
}
