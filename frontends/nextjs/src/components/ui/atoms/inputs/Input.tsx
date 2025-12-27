'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { InputBase } from '@mui/material'

/**
 * Props for the Input component
 * @extends {InputHTMLAttributes} Inherits HTML input element attributes
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Whether the input is in an error state */
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, error, className, style, ...props }, ref) => {
    // Filter out HTML-specific props that conflict with MUI
    const { color, ...restProps } = props as InputProps & { color?: string }
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
        {...restProps}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
