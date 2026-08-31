'use client'

import type { CssClass } from '../styles/use-css-classes'
import { classChipTitle } from './class-chip-title'
import s from './ComponentTreeTab.module.scss'

export interface ClassChipProps {
  css: CssClass
  on: boolean
  onToggle: (name: string) => void
}

export function ClassChip({ css, on, onToggle }: ClassChipProps) {
  return (
    <button
      type="button"
      className={`${s.classChip} ${on ? s.classChipOn : ''}`}
      aria-pressed={on}
      title={classChipTitle(css.props)}
      onClick={() => {
        onToggle(css.name)
      }}
    >
      {on && (
        <span className="material-symbols-rounded" aria-hidden="true">
          check
        </span>
      )}
      {css.name}
    </button>
  )
}
