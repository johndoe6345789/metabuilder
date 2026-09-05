'use client'

import { Button, TextField } from '@/m3'
import type { ApplyBqlResult } from '../builder/bql/apply'
import type { BqlScript, PublishOutcome } from './use-bql-tab'
import { BqlResultsPanel } from './BqlResultsPanel'
import { BqlPublishedList } from './BqlPublishedList'
import s from './BqlTab.module.scss'

export interface BqlScriptCardProps {
  script: BqlScript
  result: ApplyBqlResult | undefined
  /** Routes this script published to, and why any of them did not take. */
  published: PublishOutcome[] | undefined
  running: boolean
  /** Removal is hidden for the last one -- the tab always keeps a box. */
  removable: boolean
  onPatch: (id: string, change: Partial<BqlScript>) => void
  onRemove: (id: string) => void
  onRun: (id: string) => void
}

export function BqlScriptCard({
  script,
  result,
  published,
  running,
  removable,
  onPatch,
  onRemove,
  onRun,
}: BqlScriptCardProps) {
  return (
    <div className={s.card}>
      <div className={s.cardBar}>
        <TextField
          size="small"
          label="Name"
          value={script.name}
          onChange={e => {
            onPatch(script.id, { name: e.target.value })
          }}
        />
        <span className={s.spacer} />
        {removable && (
          <button
            type="button"
            className={s.remove}
            aria-label={`Remove ${script.name}`}
            onClick={() => {
              onRemove(script.id)
            }}
          >
            ✕
          </button>
        )}
        <Button
          variant="contained"
          size="small"
          disabled={running || script.text.trim() === ''}
          onClick={() => {
            onRun(script.id)
          }}
        >
          {running ? 'Running…' : '▶ Run'}
        </Button>
      </div>

      <textarea
        className={s.code}
        value={script.text}
        onChange={e => {
          onPatch(script.id, { text: e.target.value })
        }}
        placeholder={'add a Heading 1 that says "Hello"'}
        spellCheck={false}
      />
      <BqlResultsPanel result={result ?? null} />

      <BqlPublishedList published={published} />
    </div>
  )
}
