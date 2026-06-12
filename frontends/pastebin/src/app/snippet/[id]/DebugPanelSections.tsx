'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import type { useDebugger, DapStackFrame, DapVariable } from
  '@/hooks/useDebugger'
import styles from './DebugPanel.module.scss'

type Debugger = ReturnType<typeof useDebugger>

function VariableRow({ v, indent, onExpand }: {
  v: DapVariable; indent: number; onExpand: (ref: number) => void
}) {
  const expandable = v.variablesReference > 0
  const cls = `${styles.varRow} ${expandable ? styles.varExpandable : ''}`
  return (
    <div className={cls} style={{ paddingLeft: 8 + indent * 16 }}
      onClick={() => expandable && onExpand(v.variablesReference)}>
      {expandable && <MaterialIcon name="chevron_right" size={12} />}
      <span className={styles.varName}>{v.name}</span>
      <span className={styles.varEq}>=</span>
      <span className={styles.varVal}>{v.value}</span>
      {v.type && <span className={styles.varType}>{v.type}</span>}
    </div>
  )
}
export function VariablesPanel({ dbg }: { dbg: Debugger }) {
  const { scopes, variables } = dbg.state
  if (!scopes.length) return null
  return (
    <section className={styles.pane}>
      <h4 className={styles.paneHead}>Variables</h4>
      {scopes.map(scope => (
        <div key={scope.variablesReference}>
          <div className={styles.scopeHead}>{scope.name}</div>
          {(variables[scope.variablesReference] ?? []).map(v => (
            <VariableRow key={v.name} v={v} indent={0}
              onExpand={dbg.expandVariable} />
          ))}
        </div>
      ))}
    </section>
  )
}
export function CallStackPanel({ frames }: { frames: DapStackFrame[] }) {
  if (!frames.length) return null
  return (
    <section className={styles.pane}>
      <h4 className={styles.paneHead}>Call Stack</h4>
      {frames.map((f, i) => (
        <div key={f.id}
          className={
            `${styles.frame} ${i === 0 ? styles.frameActive : ''}`
          }
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
export function DebugOutput({
  output,
}: { output: Array<{ category: string; text: string }> }) {
  if (!output.length) return null
  return (
    <section className={styles.pane}>
      <h4 className={styles.paneHead}>Output</h4>
      <pre className={styles.outputPre}>
        {output.map((o, i) => (
          <span key={i} data-cat={o.category}>{o.text}</span>
        ))}
      </pre>
    </section>
  )
}
