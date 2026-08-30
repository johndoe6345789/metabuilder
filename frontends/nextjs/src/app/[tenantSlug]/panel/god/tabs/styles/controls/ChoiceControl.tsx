'use client'

import type { ReactNode } from 'react'
import type { StyleControl } from '../style-controls'
import s from '../CssClassesTab.module.scss'

export interface ChoiceControlProps {
  control: Extract<StyleControl, { kind: 'choice' }>
  value: string | undefined
  hint: ReactNode
  onSet: (prop: string, value: string) => void
  onClear: (prop: string) => void
}

/** Picking one named option, or none -- picking the active one clears it. */
export function ChoiceControl(props: ChoiceControlProps) {
  const { control, value, hint, onSet, onClear } = props
  return (
    <div className={s.ctrl}>
      <div className={s.ctrlHead}>
        <span className={s.ctrlLabel}>{control.label}</span>
      </div>
      <div className={s.ctrlChoices}>
        {control.options.map(option => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            className={`${s.ctrlChoice} ${value === option.value ? s.ctrlChoiceOn : ''}`}
            onClick={() => {
              if (value === option.value) onClear(control.prop)
              else onSet(control.prop, option.value)
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      {hint}
    </div>
  )
}
