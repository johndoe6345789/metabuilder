'use client'

import { forwardRef } from 'react'
import { TextField } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import { InputAdornment } from '@mui/material'

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
      ...props
    },
    ref
  ) => {
    return (
      <TextField
        inputRef={ref}
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
        size="small"
        slotProps={{
          input: showIcon
            ? {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }
            : undefined,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
          },
        }}
        {...props}
      />
    )
  }
)

EmailField.displayName = 'EmailField'

export { EmailField }
