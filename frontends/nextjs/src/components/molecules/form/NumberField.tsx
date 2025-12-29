'use client'

import { forwardRef } from 'react'
import { TextField } from '@mui/material'

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
      ...props
    },
    ref
  ) => {
    return (
      <TextField
        inputRef={ref}
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
        size="small"
        slotProps={{
          htmlInput: {
            min,
            max,
            step,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
          },
          '& input[type=number]': {
            MozAppearance: 'textfield',
          },
          '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
            {
              WebkitAppearance: 'none',
              margin: 0,
            },
        }}
        {...props}
      />
    )
  }
)

NumberField.displayName = 'NumberField'

export { NumberField }
