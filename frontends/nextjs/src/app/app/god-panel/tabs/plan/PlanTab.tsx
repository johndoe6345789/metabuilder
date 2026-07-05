'use client'

import { Button, TextField, Typography } from '@/m3'
import { COLUMNS, usePlanBoard } from './use-plan-board'
import s from './PlanTab.module.scss'

export function PlanTab() {
  const board = usePlanBoard()

  return (
    <div className={s.root}>
      <div className={s.bar}>
        <Typography variant="h6">Plan</Typography>
        <span className={s.spacer} />
        <TextField size="small" label="New task" value={board.draft}
          onChange={(e) => { board.setDraft(e.target.value) }}
          onKeyDown={(e) => { if (e.key === 'Enter') board.add() }} />
        <Button variant="contained" size="small" onClick={board.add}>+ Add</Button>
      </div>

      <div className={s.board}>
        {COLUMNS.map((col) => {
          const items = board.tasks.filter((t) => t.status === col.status)
          return (
            <div key={col.status} className={s.column}>
              <div className={s.colHead}>
                <span>{col.label}</span>
                <span className={s.count}>{items.length}</span>
              </div>
              <div className={s.cards}>
                {items.map((t) => (
                  <div key={t.id} className={s.card}>
                    <span className={s.title}>{t.title}</span>
                    <div className={s.actions}>
                      <button title="Back" onClick={() => { board.move(t.id, -1) }}>‹</button>
                      <button title="Forward" onClick={() => { board.move(t.id, 1) }}>›</button>
                      <button title="Delete" className={s.del}
                        onClick={() => { board.remove(t.id) }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
