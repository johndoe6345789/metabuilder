'use client'

import { forwardRef } from 'react'
import { InputBase, InputBaseProps } from '@mui/material'

/**
 * Props for the Textarea component
 */
export interface TextareaProps {
  /** Whether the textarea is in an error state */
  error?: boolean
  /** Whether the textarea is disabled */
  disabled?: boolean
  /** Placeholder text to display when empty */
  placeholder?: string
  /** Controlled value */
  value?: string
  /** Default value for uncontrolled mode */
  defaultValue?: string
  /** Callback when value changes */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  /** Callback when textarea loses focus */
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  /** Callback when textarea receives focus */
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  /** Form field name */
  name?: string
  /** Element ID */
  id?: string
  /** Number of visible rows */
  rows?: number
  /** Minimum number of rows (for auto-resize) */
  minRows?: number
  /** Maximum number of rows (for auto-resize) */
  maxRows?: number
  /** CSS class name for custom styling */
  className?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the textarea is read-only */
  readOnly?: boolean
  /** Whether to auto-focus on mount */
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
