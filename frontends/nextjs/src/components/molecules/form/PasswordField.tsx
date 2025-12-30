'use client'

import { forwardRef, useState } from 'react'

import { IconButton, TextField } from '@/fakemui'
import { Visibility, VisibilityOff } from '@/fakemui/icons'

export interface PasswordFieldProps {
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
  className?: string
}

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label = 'Password',
      name = 'password',
      value,
      onChange,
      error,
      helperText,
      required = false,
      placeholder,
      fullWidth = true,
      disabled = false,
      autoComplete = 'current-password',
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword(prev => !prev)
    }

    return (
      <TextField
        ref={ref}
        type={showPassword ? 'text' : 'password'}
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
        endAdornment={
          <IconButton
            aria-label="toggle password visibility"
            onClick={togglePasswordVisibility}
            onMouseDown={e => e.preventDefault()}
            disabled={disabled}
            sm
          >
            {showPassword ? (
              <VisibilityOff size={16} />
            ) : (
              <Visibility size={16} />
            )}
          </IconButton>
        }
        {...props}
      />
    )
  }
)

PasswordField.displayName = 'PasswordField'

export { PasswordField }
