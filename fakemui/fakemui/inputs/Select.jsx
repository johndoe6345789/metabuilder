import React, { forwardRef } from 'react'

export const Select = forwardRef(({ children, sm, error, className = '', ...props }, ref) => (
  <select ref={ref} className={`select ${sm ? 'select--sm' : ''} ${error ? 'select--error' : ''} ${className}`} {...props}>{children}</select>
))
