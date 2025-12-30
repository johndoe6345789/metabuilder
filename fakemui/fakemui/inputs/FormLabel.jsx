import React from 'react'

export const FormLabel = ({ children, required, className = '', ...props }) => (
  <label className={`form-label ${required ? 'form-label--required' : ''} ${className}`} {...props}>{children}</label>
)
