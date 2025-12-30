import React from 'react'

export const AutoGrid = ({ children, sm, lg, gap, className = '', ...props }) => (
  <div className={`auto-grid ${sm ? 'auto-grid--sm' : ''} ${lg ? 'auto-grid--lg' : ''} ${gap ? `gap-${gap}` : ''} ${className}`} {...props}>{children}</div>
)
