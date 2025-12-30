'use client'

import { Textarea as FakemuiTextarea, TextareaProps as FakemuiTextareaProps } from '@/fakemui/fakemui/inputs'
import { forwardRef } from 'react'
import styles from './Textarea.module.scss'

/**
 * Props for the Textarea component
 */
export interface TextareaProps extends Omit<FakemuiTextareaProps, 'className'> {
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
  ({ error, minRows = 3, className, ...props }, ref) => {
    return (
      <FakemuiTextarea
        ref={ref}
        rows={minRows}
        error={error}
        className={`${styles.textarea} ${error ? styles.error : ''} ${className || ''}`}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
