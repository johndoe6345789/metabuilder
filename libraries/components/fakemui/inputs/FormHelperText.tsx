import React from 'react'

export interface FormHelperTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  testId?: string
  children?: React.ReactNode
  error?: boolean
}

export const FormHelperText: React.FC<FormHelperTextProps> = ({ children, error, testId, className = '', ...props }) => (
  <span className={`form-helper ${error ? 'form-helper--error' : ''} ${className}`} data-testid={testId} {...props}>
    {children}
  </span>
)
