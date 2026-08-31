'use client'

import { Button, Typography } from '@/m3'
import { useTestRunner } from './use-test-runner'
import { TestCaseRow } from './TestCaseRow'
import s from './TestRunnerTab.module.scss'

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
          onClick={t.runAll}
        >
          {t.running ? 'Running…' : '▶ Run all'}
        </Button>
      </div>

      <Typography variant="body2" color="text.secondary" className={s.hint}>
        Each test feeds its input through the current workflow and checks the
        output contains the expected fields.
      </Typography>

      <div className={s.list}>
        {t.cases.map(c => (
          <TestCaseRow
            key={c.id}
            case_={c}
            result={t.results[c.id]}
            onUpdate={t.update}
            onRemove={t.remove}
          />
        ))}
      </div>
    </div>
  )
}
