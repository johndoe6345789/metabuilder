'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'
import { InputBase } from '@mui/material'

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, ...props }, ref) => {
    return (
      <InputBase
        inputRef={ref}
        multiline
        minRows={3}
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
          alignItems: 'flex-start',
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
          '& textarea': {
            p: 0,
          },
        }}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
