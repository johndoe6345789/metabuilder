import React, { forwardRef } from 'react'

export const IconButton = forwardRef(({ children, sm, lg, className = '', ...props }, ref) => (
  <button ref={ref} className={`icon-btn ${sm ? 'icon-btn--sm' : ''} ${lg ? 'icon-btn--lg' : ''} ${className}`} {...props}>{children}</button>
))
