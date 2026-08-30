'use client'

import type { ReactNode } from 'react'
import type { StyleControl } from '../style-controls'
import s from '../CssClassesTab.module.scss'

export interface ToggleControlProps {
  control: Extract<StyleControl, { kind: 'toggle' }>
  value: string | undefined
  hint: ReactNode
  onSet: (prop: string, value: string) => void
  onClear: (prop: string) => void
}

/** On writes the declared "on" value; off clears the declaration entirely. */
export function ToggleControl(props: ToggleControlProps) {
  const { control } = props
  const on = props.value === control.on

  return (
    <div className={s.ctrl}>
      <label className={s.ctrlToggle}>
        <input
          type="checkbox"
          checked={on}
          onChange={event => {
            if (event.target.checked) props.onSet(control.prop, control.on)
            else props.onClear(control.prop)
          }}
        />
        <span>{control.label}</span>
      </label>
      {props.hint}
    </div>
  )
}
