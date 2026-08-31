'use client'

import { useState } from 'react'
import { Typography } from '@/m3'
import { ExtraCssPropRow } from './ExtraCssPropRow'
import { AddCssPropertyRow } from './AddCssPropertyRow'
import s from './CssClassesTab.module.scss'

export interface AdvancedCssSectionProps {
  extra: [string, string][]
  onSet: (prop: string, value: string) => void
  onClear: (prop: string) => void
}

/** The raw-CSS disclosure -- anything hand-written that no named control
 *  owns, plus a way to add a new one. */
export function AdvancedCssSection({
  extra,
  onSet,
  onClear,
}: AdvancedCssSectionProps) {
  const [advanced, setAdvanced] = useState(false)

  return (
    <div className={s.group}>
      <button
        type="button"
        className={s.groupHead}
        aria-expanded={advanced}
        onClick={() => {
          setAdvanced(open => !open)
        }}
      >
        <span
          className={`material-symbols-rounded ${s.groupTwist} ${
            advanced ? s.groupTwistOpen : ''
          }`}
          aria-hidden="true"
        >
          chevron_right
        </span>
        <span className="material-symbols-rounded" aria-hidden="true">
          code
        </span>
        Advanced CSS
        {extra.length > 0 && (
          <span className={s.groupCount}>{extra.length}</span>
        )}
      </button>
      {advanced && (
        <div className={s.groupBody}>
          <Typography variant="caption" className={s.ctrlHint}>
            For anything the controls above do not cover. Written exactly as
            CSS.
          </Typography>
          {extra.map(([k, v]) => (
            <ExtraCssPropRow
              key={k}
              prop={k}
              value={v}
              onSet={onSet}
              onClear={onClear}
            />
          ))}
          <AddCssPropertyRow onSet={onSet} />
        </div>
      )}
    </div>
  )
}
