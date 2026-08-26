'use client'

import { Button, TextField, Typography } from '@/m3'
import { useTestRunner, type TestResult } from './use-test-runner'
import s from './TestRunnerTab.module.scss'

function badge(r: TestResult | undefined) {
  if (!r) return { cls: '', label: '—' }
  if (r.status === 'pass') return { cls: 'pass', label: '✓ Pass' }
  if (r.status === 'fail') return { cls: 'fail', label: '✕ Fail' }
  return { cls: 'err', label: '⚠ Error' }
}

export function TestRunnerTab() {
  const t = useTestRunner()
  const passed = t.cases.filter(c => t.results[c.id]?.status === 'pass').length
  const ran = Object.keys(t.results).length

  return (
    <div className={s.root}>
      <div className={s.bar}>
        <Typography variant="h6">Tests</Typography>
        {ran > 0 && (
          <span className={s.summary}>
            {passed}/{ran} passing
          </span>
        )}
        <span className={s.spacer} />
        <Button variant="outlined" size="small" onClick={t.create}>
          + New test
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={t.running}
          onClick={() => {
            void t.runAll()
          }}
        >
          {t.running ? 'Running…' : '▶ Run all'}
        </Button>
      </div>

      <Typography variant="body2" color="text.secondary" className={s.hint}>
        Each test feeds its input through the current workflow and checks the
        output contains the expected fields.
      </Typography>

      <div className={s.list}>
        {t.cases.map(c => {
          const r = t.results[c.id]
          const b = badge(r)
          return (
            <div key={c.id} className={s.case}>
              <div className={s.caseHead}>
                <TextField
                  size="small"
                  label="Test name"
                  value={c.name}
                  onChange={e => {
                    t.update(c.id, { name: e.target.value })
                  }}
                />
                <span className={`${s.badge} ${b.cls ? s[b.cls] : ''}`}>
                  {b.label}
                </span>
                <button
                  className={s.del}
                  onClick={() => {
                    t.remove(c.id)
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
                      t.update(c.id, { input: e.target.value })
                    }}
                  />
                </div>
                <div className={s.field}>
                  <label>Expected (subset)</label>
                  <textarea
                    className={s.code}
                    value={c.expected}
                    onChange={e => {
                      t.update(c.id, { expected: e.target.value })
                    }}
                  />
                </div>
              </div>
              {r?.message && <div className={s.msg}>{r.message}</div>}
              {r?.actual && (
                <pre className={s.actual}>
                  actual → {JSON.stringify(r.actual)}
                </pre>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
