'use client'

import { forwardRef, useState } from 'react'
import { Box, IconButton, InputAdornment, TextField } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

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
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    return (
      <TextField
        inputRef={ref}
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
        size="small"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordVisibility}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  size="small"
                  disabled={disabled}
                >
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
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

PasswordField.displayName = 'PasswordField'

export { PasswordField }
