'use client'

import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { FormLabel } from './FormLabel'
import { FormHelperText } from './FormHelperText'
import { Input } from './Input'

export interface DatePickerProps {
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
  format?: 'date' | 'datetime-local' | 'month' | 'week'
  placeholder?: string
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
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
      format = 'date',
      placeholder,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className={`date-picker ${error ? 'date-picker--error' : ''} ${className}`}>
        {label && <FormLabel required={required}>{label}</FormLabel>}
        <Input
          ref={ref}
          type={format}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          error={error}
          placeholder={placeholder}
          {...props}
        />
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'
