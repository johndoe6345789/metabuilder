import React from 'react'

export const FormHelperText = ({ children, error, className = '', ...props }) => (
  <span className={`form-helper ${error ? 'form-helper--error' : ''} ${className}`} {...props}>{children}</span>
)
