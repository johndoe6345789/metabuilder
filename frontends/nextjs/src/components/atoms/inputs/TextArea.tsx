'use client'

import { Textarea } from '@/fakemui'
import { forwardRef } from 'react'

/**
 * Props for the TextArea component
 * Wrapper around fakemui Textarea to maintain API compatibility
 */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Whether the textarea is in an error state */
  error?: boolean
  /** Whether the textarea should take up the full width of its container */
  fullWidth?: boolean
  /** Minimum number of rows */
  minRows?: number
  /** Maximum number of rows */
  maxRows?: number
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, fullWidth = true, minRows = 3, maxRows, sx, className, ...props }, ref) => {
    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className, error ? 'textarea--error' : ''].filter(Boolean).join(' ')

    return (
      <Textarea
        ref={ref}
        rows={minRows}
        error={error}
        fullWidth={fullWidth}
        className={combinedClassName}
        {...props}
      />
    )
  }
)

TextArea.displayName = 'TextArea'

export { TextArea }
