import React, { forwardRef } from 'react'
import { FormLabel } from './FormLabel'
import { FormHelperText } from './FormHelperText'
import { Input } from './Input'

export interface TimePickerProps {
  testId?: string
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: boolean
  value?: string
  onChange?: (value: string) => void
  min?: string
  max?: string
  disabled?: boolean
  required?: boolean
  className?: string
  step?: number
  placeholder?: string
}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  (
    {
      testId,
      label,
      helperText,
      error,
      value,
      onChange,
      min,
      max,
      disabled,
      required,
      className = '',
      step,
      placeholder,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className={`time-picker ${error ? 'time-picker--error' : ''} ${className}`} data-testid={testId} aria-label={typeof label === 'string' ? label : undefined}>
        {label && <FormLabel required={required}>{label}</FormLabel>}
        <Input
          ref={ref}
          type="time"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          error={error}
          step={step}
          placeholder={placeholder}
          {...props}
        />
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
      </div>
    )
  }
)

TimePicker.displayName = 'TimePicker'
