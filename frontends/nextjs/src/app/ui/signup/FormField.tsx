'use client'

import type { ChangeEvent, ReactNode } from 'react'
import s from './page.module.scss'

export interface FormFieldProps {
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  minLength?: number
  autoFocus?: boolean
  hint?: ReactNode
}

/** One labelled input, the shape every field on this form shares. */
export function FormField(props: FormFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    props.onChange(e.target.value)
  }

  return (
    <label className={s.label}>
      {props.label}
      <input
        className={s.input}
        type={props.type}
        placeholder={props.placeholder}
        value={props.value}
        onChange={handleChange}
        required={props.required}
        minLength={props.minLength}
        autoFocus={props.autoFocus}
      />
      {props.hint}
    </label>
  )
}
