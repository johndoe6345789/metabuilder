import React from 'react'

export interface FormHelperTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  error?: boolean
}

export const FormHelperText: React.FC<FormHelperTextProps> = ({ children, error, className = '', ...props }) => (
  <span className={`form-helper ${error ? 'form-helper--error' : ''} ${className}`} {...props}>
    {children}
  </span>
)
