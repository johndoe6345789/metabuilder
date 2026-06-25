import React, { forwardRef } from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/form.module.scss'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  testId?: string
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, testId, className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={classNames(styles.textarea, error && styles.textareaError, className)}
      data-testid={testId}
      {...props}
    />
  )
)

Textarea.displayName = 'Textarea'
