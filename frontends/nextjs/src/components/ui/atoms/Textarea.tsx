'use client'

import { forwardRef } from 'react'
import { InputBase, InputBaseProps } from '@mui/material'

export interface TextareaProps {
  error?: boolean
  disabled?: boolean
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  name?: string
  id?: string
  rows?: number
  minRows?: number
  maxRows?: number
  className?: string
  required?: boolean
  readOnly?: boolean
  autoFocus?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, minRows = 3, ...props }, ref) => {
    return (
      <InputBase
        inputRef={ref}
        multiline
        minRows={minRows}
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
