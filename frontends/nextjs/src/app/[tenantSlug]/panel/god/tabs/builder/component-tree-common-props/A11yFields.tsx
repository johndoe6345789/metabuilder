'use client'

import { TextField, Typography } from '@/m3'
import { RoleField } from './RoleField'
import { text } from './text'
import s from '../ComponentTreeTab.module.scss'

export interface A11yFieldsProps {
  props: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}

export function A11yFields({ props, onChange }: A11yFieldsProps) {
  return (
    <>
      <TextField
        size="small"
        fullWidth
        label="Label (aria-label)"
        placeholder="Close dialog"
        value={text(props.ariaLabel)}
        helperText="Names the element when its own text does not"
        onChange={event => {
          onChange({ ariaLabel: event.target.value })
        }}
      />
      <TextField
        size="small"
        fullWidth
        label="Described by (aria-describedby)"
        placeholder="password-hint"
        value={text(props.ariaDescribedby)}
        helperText="ID of the element describing this one"
        onChange={event => {
          onChange({ ariaDescribedby: event.target.value })
        }}
      />
      <RoleField role={text(props.role)} onChange={onChange} />
      <label className={s.propCheck}>
        <input
          type="checkbox"
          checked={props.ariaHidden === true || props.ariaHidden === 'true'}
          onChange={event => {
            onChange({ ariaHidden: event.target.checked ? 'true' : '' })
          }}
        />
        <span>
          Hide from screen readers
          <Typography variant="caption" component="span" className={s.propHint}>
            aria-hidden — for purely decorative elements
          </Typography>
        </span>
      </label>
    </>
  )
}
