'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { TextField, TextFieldProps, InputBase, InputBaseProps } from '@mui/material'

// Simple input that matches the original API
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, error, ...props }, ref) => {
    return (
      <InputBase
        inputRef={ref}
        type={type}
        error={error}
        sx={{
          width: '100%',
          px: 1.5,
          py: 1,
          fontSize: '0.875rem',
          border: 1,
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          '&:hover': {
            borderColor: error ? 'error.main' : 'text.primary',
          },
          '&.Mui-focused': {
            borderColor: error ? 'error.main' : 'primary.main',
            boxShadow: (theme) => `0 0 0 2px ${error ? theme.palette.error.main : theme.palette.primary.main}25`,
          },
          '&.Mui-disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
          '& input': {
            p: 0,
          },
        }}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
