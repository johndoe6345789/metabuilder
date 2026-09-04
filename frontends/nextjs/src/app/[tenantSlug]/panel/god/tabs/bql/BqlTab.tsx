'use client'

import { Button, Typography } from '@/m3'
import { useBqlTab } from './use-bql-tab'
import { BqlResultsPanel } from './BqlResultsPanel'
import { BqlDocsPanel } from './BqlDocsPanel'
import s from './BqlTab.module.scss'

export function BqlTab() {
  const t = useBqlTab()

  return (
    <div className={s.root}>
      <div className={s.bar}>
        <Typography variant="h6">BQL</Typography>
        <span className={s.spacer} />
        <Button
          variant="contained"
          size="small"
          disabled={t.running || t.script.trim() === ''}
          onClick={() => {
            void t.run()
          }}
        >
          {t.running ? 'Running…' : '▶ Run'}
        </Button>
      </div>

      <Typography variant="body2" color="text.secondary" className={s.hint}>
        Build or edit the current page by describing it, one sentence per
        line. Runs against the page open in Components, and is undoable from
        there like any other edit.
      </Typography>

      <div className={s.layout}>
        <div className={s.editor}>
          <textarea
            className={s.code}
            value={t.script}
            onChange={e => {
              t.setScript(e.target.value)
            }}
            placeholder={'add a Heading 1 that says "Hello"'}
            spellCheck={false}
          />
          <BqlResultsPanel result={t.result} />
        </div>
        <BqlDocsPanel />
      </div>
    </div>
  )
}
