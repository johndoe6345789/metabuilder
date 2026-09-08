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
        Each test runs the workflow open in the Workflows tab, in the
        order the arrows give: ids are made, conditions stop the run and
        <code> ${'{'}name{'}'} </code> references resolve. Rows go to a
        scratch store and page steps are recorded rather than applied, so
        running a test writes nothing to your data and changes no page.
        Expected is matched as a subset of the values the steps named.
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
