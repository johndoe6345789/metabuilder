import React from 'react'

export const Panel = ({ children, className = '', ...props }) => (
  <div className={`panel ${className}`} {...props}>{children}</div>
)
