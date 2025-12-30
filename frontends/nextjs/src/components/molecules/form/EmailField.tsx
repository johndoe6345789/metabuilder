'use client'

import { forwardRef } from 'react'

import { TextField } from '@/fakemui'
import { Email } from '@/fakemui/icons'

export interface EmailFieldProps {
  label?: string
  name?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  helperText?: string
  required?: boolean
  placeholder?: string
  fullWidth?: boolean
  disabled?: boolean
  autoComplete?: string
  showIcon?: boolean
  className?: string
}

const EmailField = forwardRef<HTMLInputElement, EmailFieldProps>(
  (
    {
      label = 'Email',
      name = 'email',
      value,
      onChange,
      error,
      helperText,
      required = false,
      placeholder = 'you@example.com',
      fullWidth = true,
      disabled = false,
      autoComplete = 'email',
      showIcon = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <TextField
        ref={ref}
        type="email"
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
        autoComplete={autoComplete}
        className={className}
        startAdornment={
          showIcon ? (
            <Email size={16} style={{ color: 'rgba(0,0,0,0.54)' }} />
          ) : undefined
        }
        {...props}
      />
    )
  }
)

EmailField.displayName = 'EmailField'

export { EmailField }
