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
        Describe a page one sentence per line, and a script can publish it
        to its own route. Open with <em>start a new page</em> unless you
        mean to add to whatever is loaded in Components. Each script runs on
        its own and is undoable from Components like any other edit.
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
