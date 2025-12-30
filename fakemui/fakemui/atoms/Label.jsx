import React from 'react'

export const Label = ({ children, className = '', ...props }) => (
  <span className={`label ${className}`} {...props}>{children}</span>
)
