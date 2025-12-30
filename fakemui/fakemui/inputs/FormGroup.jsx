import React from 'react'

export const FormGroup = ({ children, row, className = '', ...props }) => (
  <div className={`form-group ${row ? 'form-group--row' : ''} ${className}`} {...props}>{children}</div>
)
