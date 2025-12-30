import React, { forwardRef } from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`textarea ${error ? 'textarea--error' : ''} ${className}`}
      {...props}
    />
  )
)

Textarea.displayName = 'Textarea'
