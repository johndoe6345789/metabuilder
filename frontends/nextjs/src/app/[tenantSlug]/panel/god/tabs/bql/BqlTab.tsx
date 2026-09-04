'use client'

import { Typography } from '@/m3'
import { useBqlTab } from './use-bql-tab'
import { BqlScriptCard } from './BqlScriptCard'
import { BqlDocsPanel } from './BqlDocsPanel'
import s from './BqlTab.module.scss'

export function BqlTab() {
  const t = useBqlTab()

  return (
    <div className={s.root}>
      <div className={s.bar}>
        <Typography variant="h6">BQL</Typography>
        <span className={s.spacer} />
        <button type="button" className={s.add} onClick={t.add}>
          + Add script
        </button>
      </div>

      <Typography variant="body2" color="text.secondary" className={s.hint}>
        Build or edit the current page by describing it, one sentence per
        line. Each script runs on its own, against the page open in
        Components, and is undoable from there like any other edit.
      </Typography>

      <div className={s.layout}>
        <div className={s.editor}>
          {t.scripts.map(script => (
            <BqlScriptCard
              key={script.id}
              script={script}
              result={t.results[script.id]}
              published={t.published[script.id]}
              running={t.runningId === script.id}
              removable={t.scripts.length > 1}
              onPatch={t.patch}
              onRemove={t.remove}
              onRun={id => {
                void t.run(id)
              }}
            />
          ))}
        </div>
        <BqlDocsPanel />
      </div>
    </div>
  )
}
