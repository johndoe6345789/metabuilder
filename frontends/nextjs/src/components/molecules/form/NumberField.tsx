'use client'

import { forwardRef } from 'react'

import { TextField } from '@/fakemui'

import styles from './NumberField.module.scss'

export interface NumberFieldProps {
  label?: string
  name?: string
  value?: number | string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  helperText?: string
  required?: boolean
  placeholder?: string
  fullWidth?: boolean
  disabled?: boolean
  min?: number
  max?: number
  step?: number | string
  className?: string
}

const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      label = 'Number',
      name,
      value,
      onChange,
      error,
      helperText,
      required = false,
      placeholder,
      fullWidth = true,
      disabled = false,
      min,
      max,
      step = 1,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <TextField
        ref={ref}
        type="number"
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        error={!!error}
        helperText={error || helperText}
        required={required}
        placeholder={placeholder}
        fullWidth={fullWidth}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`${styles.numberField} ${className || ''}`}
        {...props}
      />
    )
  }
)

NumberField.displayName = 'NumberField'

export { NumberField }
