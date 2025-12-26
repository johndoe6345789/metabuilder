'use client'

import { forwardRef } from 'react'
import { InputBase, InputBaseProps } from '@mui/material'

export interface InputProps extends Omit<InputBaseProps, 'size'> {
  error?: boolean
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, error, fullWidth = true, ...props }, ref) => {
    return (
      <InputBase
        inputRef={ref}
        type={type}
        error={error}
        fullWidth={fullWidth}
        sx={{
          px: 1.5,
          py: 1,
          fontSize: '0.875rem',
          border: 1,
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:hover': {
            borderColor: error ? 'error.main' : 'text.secondary',
          },
          '&.Mui-focused': {
            borderColor: error ? 'error.main' : 'primary.main',
            boxShadow: (theme) => 
              `0 0 0 2px ${error ? theme.palette.error.main : theme.palette.primary.main}25`,
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
