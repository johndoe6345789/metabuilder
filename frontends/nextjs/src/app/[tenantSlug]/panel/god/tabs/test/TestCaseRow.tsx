'use client'

import { TextField } from '@/m3'
import type { TestCase, TestResult } from './use-test-runner'
import { badge } from './test-badge'
import s from './TestRunnerTab.module.scss'

export interface TestCaseRowProps {
  case_: TestCase
  result: TestResult | undefined
  onUpdate: (id: string, patch: Partial<TestCase>) => void
  onRemove: (id: string) => void
}

export function TestCaseRow({
  case_: c,
  result: r,
  onUpdate,
  onRemove,
}: TestCaseRowProps) {
  const b = badge(r)
  return (
    <div className={s.case}>
      <div className={s.caseHead}>
        <TextField
          size="small"
          label="Test name"
          value={c.name}
          onChange={e => {
            onUpdate(c.id, { name: e.target.value })
          }}
        />
        <span className={`${s.badge} ${b.cls.length > 0 ? s[b.cls] : ''}`}>
          {b.label}
        </span>
        <button
          className={s.del}
          onClick={() => {
            onRemove(c.id)
          }}
        >
          ✕
        </button>
      </div>
      <div className={s.io}>
        <div className={s.field}>
          <label>Input (JSON)</label>
          <textarea
            className={s.code}
            value={c.input}
            onChange={e => {
              onUpdate(c.id, { input: e.target.value })
            }}
          />
        </div>
        <div className={s.field}>
          <label>Expected (subset)</label>
          <textarea
            className={s.code}
            value={c.expected}
            onChange={e => {
              onUpdate(c.id, { expected: e.target.value })
            }}
          />
        </div>
      </div>
      {r?.message !== undefined && r.message.length > 0 && (
        <div className={s.msg}>{r.message}</div>
      )}
      {r?.actual !== undefined && (
        <pre className={s.actual}>actual → {JSON.stringify(r.actual)}</pre>
      )}
    </div>
  )
}
