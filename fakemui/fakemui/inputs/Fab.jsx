import React, { forwardRef } from 'react'

export const Fab = forwardRef(({ children, primary, secondary, sm, extended, className = '', ...props }, ref) => (
  <button ref={ref} className={`fab ${primary ? 'fab--primary' : ''} ${secondary ? 'fab--secondary' : ''} ${sm ? 'fab--sm' : ''} ${extended ? 'fab--extended' : ''} ${className}`} {...props}>{children}</button>
))
